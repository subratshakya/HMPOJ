const express = require("express");
const router = express.Router();
const {
  createContest,
  getAllContests,
  getContestDetails,
  registerContest,
  getContestLeaderboard,
} = require("../controllers/contestControllers");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Admin routes
router.post("/admin/contest/create", isAuthenticated, isAdmin, createContest);

// Public / User routes
router.get("/contests", getAllContests);
router.get("/contest/:id", isAuthenticated, getContestDetails);
router.post("/contest/:id/register", isAuthenticated, registerContest);
router.get("/contest/:id/leaderboard", isAuthenticated, getContestLeaderboard);

module.exports = router;
