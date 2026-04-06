import React, { useState, useEffect } from "react";
import axios from "axios";
import LoadingComponent from "./loading";
import { useNavigate } from "react-router-dom";

const ProblemList = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const difficulty = "";
  const problemType = "";

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        axios.defaults.withCredentials = true;
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/allProblems?pageNumber=${page}&difficulty=${difficulty}&problemType=${problemType}`
        );
        setProblems(response.data.problems);
        setPage(response.data.page);
        setPages(response.data.pages);
        setLoading(false);
      } catch (error) {
        if (error.response && error.response.data) {
          setError(error.response.data.message);
        } else {
          setError(error.message);
        }

        if (error.response && error.response.status === 401) {
          setError("You are not authorized. Please log in first.");
        }
        setLoading(false);
      }
    };

    fetchProblems();
  }, [page]);

  const handlenavigation = (problemID) => {
    navigate(`/problem/${problemID}`);
  };

  return (
    <>
      {loading ? (
        <LoadingComponent />
      ) : error ? (
        <div className="flex justify-center items-center h-screen">
          <p className="font-mono text-red-500">{error}</p>
        </div>
      ) : (
        <>
          <h3 className="font-mono font-bold text-3xl ml-8 text-blueGray-700">
            Problem Set
          </h3>
          <div className="overflow-x-auto border border-black m-4">
            <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
              <thead className="ltr:text-left rtl:text-right ">
                <tr>
                  <th className="whitespace-nowrap px-4 py-2 text-lg font-medium text-gray-900">
                    Title
                  </th>
                  <th className="whitespace-nowrap px-4 py-2 font-medium text-lg text-gray-900">
                    Difficulty
                  </th>
                  <th className="whitespace-nowrap px-4 py-2 font-medium text-lg text-gray-900">
                    Tags
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {problems.map((problem) => (
                  <tr
                    key={problem._id}
                    onClick={() => handlenavigation(problem._id)}
                  >
                    <td className="whitespace-nowrap px-4 py-2 text-base font-medium text-gray-900">
                      {problem.title}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-base ">
                      {problem.difficulty}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700 text-base ">
                      {problem.problemType}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-4 space-x-4">
            {pages > 1 && (
              <>
                <button
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-l"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <button
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-r"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pages}
                >
                  Next
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ProblemList;
