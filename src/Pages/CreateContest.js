import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import axios from "axios";
import { toast } from "react-toastify";

function CreateContest() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allProblems, setAllProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]); // { problem: Obj, points: Number }

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/allProblems`);
      setAllProblems(res.data.problems);
    } catch (err) {
      toast.error("Failed to load problems pool");
    }
  };

  const handleCreate = async () => {
    if (!title || !startTime || !endTime || selectedProblems.length === 0) {
      return toast.warning("Please fill all fields and select at least one problem");
    }

    try {
      axios.defaults.withCredentials = true;
      await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/contest/create`, {
        title,
        description,
        startTime,
        endTime,
        problems: selectedProblems.map(sp => ({ problem: sp.problem._id, points: sp.points }))
      });
      toast.success("Contest successfully created!");
      window.location.href = "/contests";
    } catch (err) {
      toast.error(err.response?.data?.error || "Creation failed");
    }
  };

  const addProblem = (probId) => {
    if (selectedProblems.find(sp => sp.problem._id === probId)) return;
    const p = allProblems.find(x => x._id === probId);
    if (!p) return;
    setSelectedProblems([...selectedProblems, { problem: p, points: 1000 }]);
  };

  const removeProblem = (probId) => {
    setSelectedProblems(selectedProblems.filter(sp => sp.problem._id !== probId));
  };

  const updatePoints = (probId, pts) => {
    setSelectedProblems(selectedProblems.map(sp => 
      sp.problem._id === probId ? { ...sp, points: Number(pts) } : sp
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-lg border p-8">
          <h1 className="text-2xl font-bold font-mono mb-6 border-b pb-4">Admin: Create Contest</h1>
          
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-bold mb-2">Contest Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded" placeholder="e.g. Weekly Code Battle #1" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2 rounded" rows="3" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Start Time</label>
                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">End Time</label>
                <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full border p-2 rounded" />
              </div>
            </div>

            <div className="border-t pt-6 mt-2">
              <h2 className="text-xl font-bold font-mono mb-4">Challenge Set</h2>
              
              <div className="mb-4">
                <select className="w-full border p-2 rounded" onChange={(e) => addProblem(e.target.value)} value="">
                  <option value="" disabled>-- Select a problem from DB to append --</option>
                  {allProblems.map(p => (
                    <option key={p._id} value={p._id}>{p.title} ({p.difficulty})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {selectedProblems.map((sp, idx) => (
                  <div key={sp.problem._id} className="flex justify-between items-center bg-gray-100 p-3 rounded">
                    <div>
                      <span className="font-bold font-mono mr-3">Prob {String.fromCharCode(65+idx)}: </span>
                      {sp.problem.title}
                    </div>
                    <div className="flex gap-4">
                      <input 
                        type="number" 
                        value={sp.points} 
                        onChange={(e) => updatePoints(sp.problem._id, e.target.value)} 
                        className="w-24 p-1 border rounded text-right" 
                        placeholder="Points" 
                      />
                      <button onClick={() => removeProblem(sp.problem._id)} className="text-red-500 font-bold hover:text-red-700">X</button>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t shadow-2xl flex justify-center z-50">
              <button onClick={handleCreate} className="w-full max-w-4xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-xl shadow-lg transition-transform hover:scale-[1.02] uppercase tracking-wider">
                🚀 Construct & Schedule Contest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
}

export default CreateContest;
