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
    navigate(`/profile/${userID}`);
  };

  if (loading) return <LoadingComponent />;

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center py-20 px-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/20">
        <h3 className="font-mono font-bold text-xl text-red-600 dark:text-red-400 mb-2">
          Leaderboard Unavailable
        </h3>
        <p className="font-mono text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  const getRankIcon = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return index + 1;
  };

  const getRankStyles = (index) => {
    if (index === 0) return "bg-yellow-100/50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/30";
    if (index === 1) return "bg-slate-100/50 dark:bg-slate-400/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700/30";
    if (index === 2) return "bg-amber-100/50 dark:bg-amber-700/10 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-900/30";
    return "text-gray-500 dark:text-gray-400 border-transparent";
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 shadow-2xl rounded-3xl border border-gray-100 dark:border-gray-800 transition-all duration-300">
        {/* Header with gradient underline */}
        <div className="px-8 py-10 sm:px-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white font-mono">
                Leader Board
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400 font-mono text-sm uppercase tracking-widest">
                Top Performers & Coding Legends
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-gray-600 dark:text-gray-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>Updated Live</span>
            </div>
          </div>
        </div>

        <div className="block w-full overflow-x-auto px-4 sm:px-8 pb-12">
          <table className="items-center w-full bg-transparent border-separate border-spacing-y-3">
            <thead>
              <tr className="text-gray-400 dark:text-gray-500 uppercase text-xs font-mono font-bold tracking-widest text-left">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-center">Solved</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr 
                  key={user._id} 
                  onClick={() => handleUserclick(user._id)}
                  className="group cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Rank Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl border font-mono font-black text-lg transition-transform group-hover:scale-110 ${getRankStyles(index)}`}>
                      {getRankIcon(index)}
                    </div>
                  </td>
                  
                  {/* Participant Information */}
                  <td className="px-6 py-4 whitespace-nowrap border-t-0 align-middle">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-base font-bold text-gray-900 dark:text-white font-mono group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {user.userName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                          Member since {new Date(user.createdAt || Date.now()).getFullYear()}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Points Earned */}
                  <td className="px-6 py-4 text-center whitespace-nowrap align-middle">
                    <span className="text-xl font-black text-gray-900 dark:text-white font-mono">
                      {user.pointsEarned || 0}
                    </span>
                    <span className="ml-1 text-[10px] text-gray-400 uppercase font-mono block">pts</span>
                  </td>

                  {/* Problems Solved */}
                  <td className="px-6 py-4 text-center whitespace-nowrap align-middle">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {user.questionsSolved || 0}
                      </span>
                      <div className="w-16 h-1 dark:bg-gray-800 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${Math.min((user.questionsSolved || 0) * 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 font-mono italic">No legends found yet. Start solving to claim your spot!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default LeaderboardComponent;
