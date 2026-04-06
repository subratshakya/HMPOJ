import React, { useState, useEffect } from "react";
import axios from "axios";
import LoadingComponent from "../components/loading";
import Header from "../components/header";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useClipboard } from "use-clipboard-copy";
import { CopyToClipboard } from "react-copy-to-clipboard";

const ProblemPage = () => {
  const nav = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const _id = useParams().problemid;

  const handleSubmit = () => {
    nav(`/submit/${_id}`);
  };
  const clipboard = useClipboard();

  const handleCopyInput = () => {
    clipboard.copy(problem.sampleTest.input);
    alert("Input copied to clipboard");
  };

  const handleCopyOutput = () => {
    clipboard.copy(problem.sampleTest.output);
    alert("Output copied to clipboard");
  };
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        axios.defaults.withCredentials = true;
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/problem/${_id}`
        );
        setProblem(response.data.problem);
      } catch (error) {
        setError(error.response.data.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [_id]);

  if (loading) {
    return <LoadingComponent />;
  }

  if (error || !problem) {
    return (
      <>
        <Header />
        <div className="font-mono error text-red-500 text-center mt-8">
          Problem not found
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="font-mono container mx-auto px-4">
        <header className="font-mono header bg-gray-900 text-white py-5 text-center">
          <h1 className="font-mono title text-xl font-extrabold md:text-3xl">
            {problem.title}
          </h1>
          <div className="font-mono constraints">
            <h6 className="font-mono section-title text-lg md:text-xl">
              Time limit :{problem.timeLimit} seconds
            </h6>
          </div>
        </header>

        <main className="font-mono main bg-white rounded-lg shadow-md p-6 mt-4 text-left">
          <div className="font-mono mb-5">
            <h2 className="font-mono section-title font-extrabold text-lg md:text-xl">
              Problem Statement:
            </h2>
            <div
              className="font-mono prose"
              dangerouslySetInnerHTML={{ __html: problem.description }}
            ></div>
          </div>
          <div className="font-mono input-output">
            <h2 className="font-mono section-title font-extrabold text-lg md:text-xl">
              Input
            </h2>
            <div className="font-mono prose">
              <div
                className="font-mono prose"
                dangerouslySetInnerHTML={{ __html: problem.input }}
              ></div>
            </div>
            <h2 className="font-mono section-title font-extrabold text-lg md:text-xl">
              Output
            </h2>
            <div className="font-mono prose">
              <div
                className="font-mono prose"
                dangerouslySetInnerHTML={{ __html: problem.output }}
              ></div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-gray-100 p-6 rounded-md">
              <h2 className="text-xl font-semibold mb-4">Example</h2>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Input</h3>
                <pre className="bg-white p-4 rounded-md shadow-sm overflow-x-auto">
                  {problem.sampleTest.input}
                </pre>
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mt-2"
                  onClick={handleCopyInput}
                >
                  Copy Input
                </button>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Output</h3>
                <pre className="bg-white p-4 rounded-md shadow-sm overflow-x-auto">
                  {problem.sampleTest.output}
                </pre>
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mt-2"
                  onClick={handleCopyOutput}
                >
                  Copy Output
                </button>
              </div>
            </div>
          </div>
          <button
            className="font-mono submitbtn bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 block mx-auto"
            onClick={handleSubmit}
          >
            Submit Code
          </button>
        </main>
      </div>
    </>
  );
};

export default ProblemPage;
