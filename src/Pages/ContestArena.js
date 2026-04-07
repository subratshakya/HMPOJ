import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingComponent from "../components/loading";

function ContestArena() {
  const { contestid } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [userSubs, setUserSubs] = useState({});

  useEffect(() => {
    fetchContest();
    fetchUserSubmissions();
  }, [contestid]);

  useEffect(() => {
    if (!contest) return;
    const interval = setInterval(() => {
      const now = new Date();
      const st = new Date(contest.startTime);
      if (now < st) {
        setTimeRemaining(Math.max((st - now) / 1000, 0));
        // If timer hits 0, auto refresh to get problems
        if (Math.max((st - now) / 1000, 0) < 1) {
            window.location.reload();
        }
      } else {
        const et = new Date(contest.endTime);
        if (now < et) {
          setTimeRemaining(Math.max((et - now) / 1000, 0));
        } else setTimeRemaining(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  const fetchContest = async () => {
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/contest/${contestid}`);
      setContest(res.data.contest);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load contest");
      if(err.response?.status === 401) window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubmissions = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const userObj = JSON.parse(userStr);
    const user = userObj.user || userObj;
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/${user._id || user.id}/submissions`);
      const sm = {};
      res.data.submissions.forEach(s => {
         const pid = s.problem._id || s.problem;
         if (sm[pid] === "Accepted") return;
         if (s.status === "Accepted") sm[pid] = "Accepted";
         else if (!sm[pid] || sm[pid] === "Pending") sm[pid] = s.status;
      });
      setUserSubs(sm);
    } catch(e) {}
  };

  if (loading) return <LoadingComponent />;
  if (!contest) return null;

  const now = new Date();
  const st = new Date(contest.startTime);
  const et = new Date(contest.endTime);
  const isUpcoming = now < st;
  const isActive = now >= st && now <= et;
  const isEnded = now > et;

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mb-8">
          <div className="p-8 md:p-12 border-b dark:border-gray-800 flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-5xl font-bold font-mono text-gray-900 dark:text-white mb-4">
              {contest.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-mono max-w-2xl">{contest.description}</p>
            
            <div className="mt-8">
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-mono font-bold mb-4
                ${isUpcoming && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"}
                ${isActive && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 animate-pulse"}
                ${isEnded && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}
              `}>
                {isUpcoming && "CONTEST STARTS IN"}
                {isActive && "CONTEST CLOSES IN"}
                {isEnded && "CONTEST HAS ENDED"}
              </span>
              
              {!isEnded && (
                <div className="text-6xl md:text-8xl tracking-tight font-mono font-bold text-gray-900 dark:text-white">
                  {formatTime(timeRemaining)}
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-4">
              <Link to={`/contest/${contest._id}/leaderboard`} className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-mono hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                Live Leaderboard
              </Link>
            </div>
          </div>

          {/* Problem List (Only visible if active or ended, masked natively by backend if upcoming unless Admin) */}
          <div className="p-8">
            <h2 className="text-xl font-bold font-mono text-gray-900 dark:text-white mb-6">Problems</h2>
            {contest.problems && contest.problems.length > 0 ? (
              <div className="grid gap-3">
                {contest.problems.map((p, idx) => (
                  <Link 
                    key={p.problem._id} 
                    to={`/contest/${contest._id}/problem/${p.problem._id}`}
                    className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-mono font-bold text-gray-400 group-hover:text-blue-500">
                        {String.fromCharCode(65 + idx)} {/* Letter A, B, C */}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{p.problem.title}</h3>
                    </div>
                    <div className="font-mono text-sm text-gray-500 dark:text-gray-400 font-bold flex items-center gap-3">
                      {userSubs[p.problem._id] === "Accepted" ? (
                        <span className="text-green-600 dark:text-green-400">✅ Solved</span>
                      ) : userSubs[p.problem._id] ? (
                        <span className="text-red-500 dark:text-red-400">❌ {userSubs[p.problem._id]}</span>
                      ) : null}
                      <span>Score: {p.points} Points</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                <p className="text-gray-400 dark:text-gray-500 font-mono">
                  {isUpcoming ? "Problems will be revealed when the contest begins." : "No problems found."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ContestArena;
