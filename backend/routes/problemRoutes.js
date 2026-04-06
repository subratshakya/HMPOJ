const express = require("express");
const router = express.Router();

const { isAuthenticated, isAdmin } = require("../middleware/auth");
const {
  newproblem,
  singleProblem,
  allProblems,
  testProblem,
  randomProblem,
} = require("../controllers/problemControllers");

//api

//create problem
router.post("/newproblem", isAuthenticated, isAdmin, newproblem);

//all problem
router.get("/allProblems", isAuthenticated, allProblems);

//testcase of  problem
router.get("/testProblem/:id", isAuthenticated, testProblem);

// problem by id
router.get("/problem/:id", singleProblem);

//random Problem
router.get("/randomProblem", randomProblem);

module.exports = router;
