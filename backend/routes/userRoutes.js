const express = require("express");
const router = express.Router();

const {
  allUsers,
  singleUser,
  editUser,
  deleteUser,
  updatePoints,
  getUserSubmissions,
  getAllSubmissions,
} = require("../controllers/userControllers");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

//routes

//admin based user data
router.get("/allusers", isAdmin, allUsers);

//leaderboard
router.get("/leaderboard", isAuthenticated, allUsers);

// user by id
router.get("/user/:id", singleUser);

//edit User
router.put("/user/edit/:id", isAuthenticated, editUser);

//delete User
router.delete("/admin/user/delete/:id", isAdmin, deleteUser);

//updatePoints
router.put("/user/updatePoints/:id", isAuthenticated, updatePoints);

//get User Submissions (auth required — fixed from public)
router.get("/user/:id/submissions", isAuthenticated, getUserSubmissions);

//get ALL Submissions (admin only)
router.get("/admin/submissions", isAdmin, getAllSubmissions);

module.exports = router;
