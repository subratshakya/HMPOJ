const User = require("../models/userModels");
const Problem = require("../models/problemModel");
const Testcase = require("../models/testcaseModel");
const ErrorResponse = require("../utils/errorResponse");

// create a problem with multiple test cases
exports.newproblem = async (req, res, next) => {
  try {
    const { testcases, ...problemData } = req.body;

    const problem = await Problem.create(problemData);

    const createdTestcases = await Testcase.insertMany(
      testcases.map((testcase) => ({ ...testcase, problem: problem._id }))
    );

    problem.testcases = createdTestcases.map((testcase) => testcase._id);
    await problem.save();

    res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    next(error);
  }
};

// show single problem
exports.singleProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id).select("-testcases");
    res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    return next(error);
  }
};

exports.testProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id).populate("testcases");

    const testcases = problem.testcases.map((testcase) => ({
      input: testcase.input,
      output: testcase.output,
    }));

    res.status(200).json({
      success: true,
      testcases,
      timeLimit: problem.timeLimit,
    });
  } catch (error) {
    return next(error);
  }
};

// load all problems with optional difficulty/type filters and pagination
exports.allProblems = async (req, res, next) => {
  const { difficulty, problemType, pageNumber } = req.query;
  const pageSize = 10;
  const page = Number(pageNumber) || 1;

  try {
    let query = Problem.find();

    if (difficulty) {
      query = query.where("difficulty").equals(difficulty);
    }

    if (problemType) {
      query = query.where("problemType").equals(problemType);
    }

    const count = await Problem.countDocuments(query);

    const problems = await query
      .sort({ createdAt: -1 })
      .select("title problemType difficulty")
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    res.status(200).json({
      success: true,
      problems,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error) {
    return next(error);
  }
};

// random problem
exports.randomProblem = async (req, res) => {
  try {
    const count = await Problem.countDocuments();
    const randomIndex = Math.floor(Math.random() * count);
    const randomProblem = await Problem.findOne().skip(randomIndex);

    res.status(200).json({
      success: true,
      problemId: randomProblem._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
