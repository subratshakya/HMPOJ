import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingComponent from "../components/loading";

function ContestHub() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/contests`);
      // Add a client-side status flag
      const now = new Date();
      const mapped = res.data.contests.map(c => {
        let status = "Upcoming";
        const st = new Date(c.startTime);
        const et = new Date(c.endTime);
        if (now > et) status = "Ended";
        else if (now >= st && now <= et) status = "Active";
        return { ...c, status, st, et };
      });
      setContests(mapped);
    } catch (err) {
      toast.error("Failed to fetch contests");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === "Active") return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-500/30";
    if (status === "Upcoming") return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-500/30";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-500/30";
  };

  const handleRegister = async (cId) => {
    try {
      axios.defaults.withCredentials = true;
      await axios.post(`${process.env.REACT_APP_API_URL}/api/contest/${cId}/register`);
      toast.success("Successfully registered for contest!");
      navigate(`/contest/${cId}`);
    } catch (error) {
      if (error.response?.status === 401) return toast.info("Please login first to enter contests.");
      if (error.response?.data?.error === "Already registered") {
        navigate(`/contest/${cId}`);
      } else {
        toast.error(error.response?.data?.error || "Registration failed");
      }
    }
  };

  if (loading) return <LoadingComponent />;

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user && user.role === 1;

  const activeUpcoming = contests.filter(c => c.status !== "Ended").reverse();
  const past = contests.filter(c => c.status === "Ended");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b pb-6 dark:border-gray-800">
          <div>
            <h1 className="text-3xl font-bold font-mono text-gray-900 dark:text-white flex items-center gap-3">
              <span className="text-4xl">🏆</span> Arena
            </h1>
            <p className="mt-2 font-mono text-gray-500 dark:text-gray-400">
              Compete against others in real-time, climb the global leaderboard, and improve your rating.
            </p>
          </div>
          {isAdmin && (
            <div className="mt-4 md:mt-0">
              <Link to="/admin/contest/create" className="bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm inline-flex items-center gap-2">
                ⚙️ Schedule Contest
              </Link>
            </div>
          )}
        </div>

        {/* Active & Upcoming */}
        <h2 className="text-xl font-bold font-mono dark:text-white mb-4">Active & Upcoming Contests</h2>
        <div className="grid gap-4 mb-12">
          {activeUpcoming.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="font-mono text-gray-500 dark:text-gray-400">No active or upcoming contests at the moment. Check back later!</p>
            </div>
          ) : (
            activeUpcoming.map((c) => (
              <div key={c._id} className="flex flex-col md:flex-row items-center justify-between p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                <div className="flex-1 w-full md:w-auto">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded border font-mono font-medium ${getStatusColor(c.status)}`}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{c.title}</h3>
                  <p className="text-sm font-mono text-gray-500 mt-1 dark:text-gray-400">Starts: {c.st.toLocaleString()} • Ends: {c.et.toLocaleString()}</p>
                </div>
                <div className="mt-4 md:mt-0 md:ml-6 w-full md:w-auto shrink-0 flex gap-3">
                  <button onClick={() => handleRegister(c._id)} className="w-full md:w-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-lg font-mono font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                    {c.status === "Active" ? "Enter Arena" : "Register"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Past Contests */}
        <h2 className="text-xl font-bold font-mono dark:text-white mb-4">Past Contests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {past.map((c) => (
            <div key={c._id} className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-all">
              <h3 className="text-md font-bold text-gray-900 dark:text-white line-clamp-1">{c.title}</h3>
              <p className="text-xs font-mono text-gray-500 mt-2 dark:text-gray-400">Ended: {c.et.toLocaleDateString()}</p>
              <div className="mt-4 flex gap-2">
                <Link to={`/contest/${c._id}`} className="flex-1 text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-mono text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                  Practice Mode
                </Link>
                <Link to={`/contest/${c._id}/leaderboard`} className="flex-1 text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-mono text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                  Final Standings
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ContestHub;
