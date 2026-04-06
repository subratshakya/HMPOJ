import React, { useState, useEffect } from "react";
import axios from "axios";

import LoadingComponent from "./loading";
import { useNavigate } from "react-router-dom";
function LeaderboardComponent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        axios.defaults.withCredentials = true;
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/leaderboard`
        );
        setUsers(response.data.users);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        if (error.response && error.response.status === 401) {
          setError("You are not authorized. Please log in first.");
        }
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  const handleUserclick = (userID) => {
    // Use the `navigate` function to navigate to the problem page
    navigate(`/profile/${userID}`);
  };
  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h3 className="font-mono font-bold text-lg text-blueGray-700">
          Leader Board
        </h3>
        <p className="font-mono text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap">
      <div className="w-full xl:w-8/12 px-4">
        <div className="relative flex flex-col min-w-0 break-words w-full mb-8 shadow-lg rounded-lg bg-white text-blueGray-700">
          <div className="px-6 py-4 border-0">
            <div className="flex flex-wrap items-center">
              <div className="relative w-full max-w-full flex-grow flex-1">
                <h3 className="font-mono font-bold text-lg text-blueGray-700">
                  Leader Board
                </h3>
              </div>
            </div>
          </div>
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 align-middle border border-solid py-3 text-xl uppercase border-l-0 border-r-0 whitespace-nowrap font-mono font-bold text-left bg-blueGray-100 text-blueGray-500 border-blueGray-200">
                    Serial No
                  </th>
                  <th className="px-6 align-middle border border-solid py-3 text-xl uppercase border-l-0 border-r-0 whitespace-nowrap font-mono font-bold text-left bg-blueGray-100 text-blueGray-500 border-blueGray-200">
                    Username
                  </th>
                  <th className="px-6 align-middle border border-solid py-3 text-xl uppercase border-l-0 border-r-0 whitespace-nowrap font-mono font-bold text-left bg-blueGray-100 text-blueGray-500 border-blueGray-200">
                    Points Earned
                  </th>
                  <th className="px-6 align-middle border border-solid py-3 text-xl uppercase border-l-0 border-r-0 whitespace-nowrap font-mono font-bold text-left bg-blueGray-100 text-blueGray-500 border-blueGray-200">
                    Problems Solved
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id} onClick={() => handleUserclick(user._id)}>
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
                        <span className="ml-3 font-mono text-sm font-bold NaN">
                          {user.userName}
                        </span>
                      </div>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div className="flex items-center">
                        {user.pointsEarned}
                      </div>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div className="flex items-center">
                        <i className="mr-2 text-emerald-500"></i>
                        {user.questionsSolved}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardComponent;
