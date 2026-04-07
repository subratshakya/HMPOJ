const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/userModels');
const Problem = require('./models/problemModel');
require("dotenv").config();

async function runTest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hmp_oj");
    console.log("Connected to MongoDB for Test setup metadata...");

    // 1. Identify users and problems
    let adminUser = await User.findOne({ role: 1 });
    let normalUser = await User.findOne({ role: 0 });
    let problem = await Problem.findOne();

    if (!problem) throw new Error("No problem found in DB. Run seed first.");

    // Fallbacks if users don't exist
    if (!adminUser) {
        adminUser = await User.create({ name: "Admin", userName: "adminBoy", email: "admin2@test.com", password: "password", role: 1 });
    }
    if (!normalUser) {
        normalUser = await User.create({ name: "Player1", userName: "player1", email: "p2@test.com", password: "password", role: 0 });
    }

    const adminToken = adminUser.getJwtToken();
    const userToken = normalUser.getJwtToken();

    const adminHeaders = { headers: { Cookie: `token=${adminToken}` } };
    const userHeaders = { headers: { Cookie: `token=${userToken}` } };

    console.log("\n================ PHASE 1: ADMIN CREATES CONTEST ===============");
    let contestRes;
    try {
        contestRes = await axios.post("http://localhost:5000/api/admin/contest/create", {
            title: "HMP OJ Inaugural Contest",
            description: "A test contest to verify scoring logic.",
            startTime: new Date(Date.now() - 5 * 60000), // Started 5 mins ago
            endTime: new Date(Date.now() + 60 * 60000), // Ends in 1 hr
            problems: [{ problem: problem._id, points: 1000 }]
        }, adminHeaders);
        console.log("✅ Contest Created!");
    } catch(err) {
        console.error("❌ Failed to create contest:", err.response?.data?.error || err.message);
        process.exit(1);
    }

    const contestId = contestRes.data.contest._id;

    console.log("\n================ PHASE 2: PUBLIC SEES CONTESTS ================");
    const allContestsRes = await axios.get("http://localhost:5000/api/contests");
    console.log(`✅ Contests retrieved! Total counts: ${allContestsRes.data.contests.length}`);
    if (allContestsRes.data.contests[0].problems === undefined) {
      console.log("✅ DB correctly masked problem identities from the public API route by default.");
    }

    console.log("\n================ PHASE 3: USER REGISTERS ======================");
    await axios.post(`http://localhost:5000/api/contest/${contestId}/register`, {}, userHeaders);
    console.log(`✅ Player1 registered for the contest!`);

    console.log("\n================ PHASE 4: GET CONTEST DETAILS =================");
    const detailsRes = await axios.get(`http://localhost:5000/api/contest/${contestId}`, userHeaders);
    console.log(`✅ Contest is Active: ${detailsRes.data.isActive}`);
    console.log(`✅ Problem loaded in arena:`, detailsRes.data.contest.problems[0].problem.title);

    console.log("\n================ PHASE 5: USER SUBMITS CODE ===================");
    // Submit a solution mapping to this contest arena
    // Note: Since Worker is truly async, we will just enqueue it and check Leaderboard (which will handle empty gracefully)
    const submitRes = await axios.post("http://localhost:5000/api/submissions/enqueue", {
        problemId: problem._id,
        code: `console.log("Hello from contest arena!");`,
        language: 63, // JS
        contestId: contestId
    }, userHeaders);
    console.log(`✅ Code execution job enqueued to RabbitMQ for Contest! JobID: ${submitRes.data.jobId}`);

    console.log("\n================ PHASE 6: LEADERBOARD COMPUTATION =============");
    console.log("Waiting 3s for RabbitMQ worker to resolve Judge0 and save to MongoDB...");
    await new Promise(r => setTimeout(r, 3000));

    const boardRes = await axios.get(`http://localhost:5000/api/contest/${contestId}/leaderboard`, userHeaders);
    console.log("✅ Codeforces Leaderboard Retrieved!");
    console.log(JSON.stringify(boardRes.data.leaderboard, null, 2));

    console.log("\n=================== INTEGRATION TEST O.K. =====================");
    process.exit(0);

  } catch(e) {
      console.error("Test execution failed:", e.response?.data?.error || e.message);
      process.exit(1);
  }
}

runTest();
