import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import axios from "axios";
import LoadingComponent from "../components/loading";

function ContestLeaderboard() {
  const { contestid } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000); // Polling 10s for live updates
    return () => clearInterval(interval);
  }, [contestid]);

  const fetchLeaderboard = async () => {
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/contest/${contestid}/leaderboard`);
      setLeaderboard(res.data.leaderboard);
      const cRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/contest/${contestid}`);
      setContest(cRes.data.contest);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && leaderboard.length === 0) return <LoadingComponent />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold font-mono text-gray-900 dark:text-white mb-2">Live Standings</h1>
        <p className="font-mono text-gray-500 dark:text-gray-400 mb-8">{contest?.title}</p>
        
        <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <table className="min-w-full text-sm font-mono text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-center">Penalty</th>
                {contest?.problems?.map((p, idx) => (
                   <th key={p.problem._id} className="px-6 py-4 text-center" title={p.problem.title}>
                     {String.fromCharCode(65 + idx)}
                   </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="100%" className="px-6 py-8 text-center">No submissions yet!</td>
                </tr>
              ) : (
                leaderboard.map((row, idx) => (
                  <tr key={row.user._id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-bold">{idx + 1}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{row.user.userName}</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600 dark:text-green-400">{row.totalPoints}</td>
                    <td className="px-6 py-4 text-center text-red-500 dark:text-red-400">{row.totalPenalty}</td>
                    
                    {contest?.problems?.map(p => {
                      const pStatus = row.problems[p.problem._id];
                      return (
                        <td key={p.problem._id} className="px-6 py-4 text-center">
                          {pStatus ? (
                            pStatus.status === "Accepted" ? (
                              <div className="text-green-500">
                                <span className="font-bold">+{pStatus.points}</span>
                                {pStatus.fails > 0 && <span className="block text-xs mt-0.5 text-gray-400">(-{pStatus.fails})</span>}
                              </div>
                            ) : (
                              <span className="text-red-500 font-bold">-{pStatus.fails}</span>
                            )
                          ) : (
                            <span className="text-gray-300 dark:text-gray-700">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ContestLeaderboard;
