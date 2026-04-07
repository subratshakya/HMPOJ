import React, { useState, useEffect } from "react";
import Editor from "../components/editor";
import Header from "../components/header";
import "../CSS/submitPage.css";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingComponent from "../components/loading";
import Footer from "../components/footer";
import { useParams, Link } from "react-router-dom";

function SubmissionPage() {
  const [error, setError] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(52);
  const [problem, setProblem] = useState("");
  const [testCases, setTestCases] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resToken, setResToken] = useState([]);
  const [statusDescriptions, setStatusDescriptions] = useState([]);
  const [results, setResults] = useState([]);
  const [response, setResponse] = useState(null);
  const [tableShow, setTableShow] = useState(false);
  const { problemid, contestid } = useParams();
  const _id = problemid;

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleProblemChange = (event) => {
    setProblem(event.target.value);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.warning("Please enter your code before submitting!");
      return;
    }

    setIsLoading(true);
    setStatusDescriptions([]);
    setTableShow(false);

    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        toast.info("You are not authorized. Please log in first.");
        setIsLoading(false);
        return;
      }

      const userObj = JSON.parse(storedUser);
      const user = userObj.user || userObj;

      axios.defaults.withCredentials = true;
      // Get baseline submissions count to detect when the async worker finishes
      const baselineRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/${user._id || user.id}/submissions`);
      const baselineCount = baselineRes.data.submissions ? baselineRes.data.submissions.length : 0;

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/submissions/enqueue`,
        {
          problemId: _id,
          code,
          language,
          contestId: contestid || undefined
        }
      );

      if (response.data.success) {
        toast.info("Submitting code to Judge0 sandbox...");
        // Fast polling to await worker completion
        const pollTimer = setInterval(async () => {
          try {
            const checkRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/${user._id || user.id}/submissions`);
            if (checkRes.data.submissions && checkRes.data.submissions.length > baselineCount) {
              clearInterval(pollTimer);
              const latest = checkRes.data.submissions[0];
              
              setResults([{
                status: { description: latest.status },
                language: { name: latest.language == "52" ? "C++" : latest.language == "71" ? "Python" : latest.language == "91" ? "Java" : "Node.js" },
                wall_time: 0,
                memory: 0
              }]);
              setTableShow(true);
              setIsLoading(false);
              
              if (latest.status === "Accepted") toast.success("✅ Solution Accepted!");
              else toast.error(`❌ ${latest.status}`);
            }
          } catch(e) {}
        }, 1500);

        // Fail-safe timeout 30s
        setTimeout(() => {
          clearInterval(pollTimer);
          setIsLoading(false);
        }, 30000);
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response && error.response.status === 401) {
        toast.info("You are not authorized. Please log in first.");
      } else {
        toast.error("Failed to enqueue submission due to a server error.");
      }
      console.error(error);
    }
  };

  return (
    <>
      <Header />

      <div className="submitbody">
        {contestid && (
          <div className="bg-gray-100 dark:bg-gray-800 py-3 px-6 mb-4 mt-2 max-w-4xl mx-auto rounded-lg flex items-center justify-between shadow-sm font-mono">
            <div className="flex gap-4">
              <Link to={`/contest/${contestid}`} className="text-gray-600 dark:text-gray-300 hover:underline font-bold">
                ← Arena
              </Link>
              <span className="text-gray-400">|</span>
              <Link to={`/contest/${contestid}/problem/${_id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-bold">
                ← Read Problem
              </Link>
            </div>
            <Link to={`/contest/${contestid}/leaderboard`} className="text-gray-700 dark:text-gray-200 hover:underline font-bold">
              🏆 Leaderboard
            </Link>
          </div>
        )}
        <h2 id="submitcode">Submit your code</h2>
        <div className="editor-container">
          <label className="label">Code:</label>
          <Editor value={code} onChange={handleCodeChange} />
        </div>
        <div className="selectbody">
          <>
            <label className="label">Language:</label>
            <select
              className="select"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value={52}>C++</option>
              <option value={91}>Java</option>
              <option value={71}>Python</option>
              <option value={63}>Node.js</option>
            </select>
          </>
        </div>

        {isLoading && <LoadingComponent />}
        <button className="button" onClick={handleSubmit}>
          Submit
        </button>

        {tableShow && (
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 align-middle border border-solid py-3 text-xl uppercase border-l-0 border-r-0 whitespace-nowrap font-mono font-bold text-left bg-blueGray-100 text-blueGray-500 border-blueGray-200">
                    TestCase
                  </th>
                  <th className="px-6 align-middle border border-solid py-3 text-xl uppercase border-l-0 border-r-0 whitespace-nowrap font-mono font-bold text-left bg-blueGray-100 text-blueGray-500 border-blueGray-200">
                    Status
                  </th>
                  <th className="px-6 align-middle border border-solid py-3 text-xl uppercase border-l-0 border-r-0 whitespace-nowrap font-mono font-bold text-left bg-blueGray-100 text-blueGray-500 border-blueGray-200">
                    Language
                  </th>
                  <th className="px-6 align-middle border border-solid py-3 text-xl uppercase border-l-0 border-r-0 whitespace-nowrap font-mono font-bold text-left bg-blueGray-100 text-blueGray-500 border-blueGray-200">
                    Time Taken
                  </th>
                  <th className="px-6 align-middle border border-solid py-3 text-xl uppercase border-l-0 border-r-0 whitespace-nowrap font-mono font-bold text-left bg-blueGray-100 text-blueGray-500 border-blueGray-200">
                    Memory Used
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((results, index) => (
                  <tr>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div className="flex items-center">
                        <span className="ml-3 font-mono font-bold NaN">
                          {index + 1}
                        </span>
                      </div>
                    </td>{" "}
                    {/* Serial number column */}
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div className="flex items-center">
                        <span className="ml-3 font-mono font-bold NaN">
                          {results.status.description}
                        </span>
                      </div>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div className="flex items-center">
                        <span className="ml-3 font-mono text-sm font-bold NaN">
                          {results.language.name}
                        </span>
                      </div>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div className="flex items-center">
                        {results.wall_time * 1000}ms
                      </div>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div className="flex items-center">
                        <i className="mr-2 text-emerald-500"></i>
                        {results.memory}kb
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default SubmissionPage;
