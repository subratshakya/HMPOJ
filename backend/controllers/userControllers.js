const User = require("../models/userModels");
const Problem = require("../models/problemModel");
const Submission = require("../models/submissionModel");
const { getRedisClient } = require("../utils/redisClient");
const ErrorResponse = require("../utils/errorResponse");

//load all users (with Redis caching for leaderboard)
exports.allUsers = async (req, res, next) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  const cacheKey = `leaderboard:page:${page}`;

  try {
    // Try serving from Redis cache first
    const redis = await getRedisClient();
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`Cache HIT for ${cacheKey}`);
        return res.status(200).json(JSON.parse(cached));
      }
    }

    // Cache MISS - query MongoDB
    const count = await User.find({}).estimatedDocumentCount();
    const users = await User.find()
      .sort({ pointsEarned: -1 })
      .select("-password")
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const responseData = {
      success: true,
      users,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    };

    // Save to Redis with 60-second TTL
    if (redis) {
      await redis.setEx(cacheKey, 60, JSON.stringify(responseData));
      console.log(`Cache SET for ${cacheKey} (TTL: 60s)`);
    }

    res.status(200).json(responseData);
  } catch (error) {
    return next(error);
  }
};
//show single user
exports.singleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({
      success: true,
      user,
    });
    next();
  } catch (error) {
    return next(error);
  }
};

exports.searchUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ userName: req.params.userName });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      user,
    });
    next();
  } catch (error) {
    return next(error);
  }
};

//edit user
exports.editUser = async (req, res, next) => {
  console.log(req);
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({
      success: true,
      user,
    });
    next();
  } catch (error) {
    return next(error);
  }
};

//delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "user deleted",
    });
    next();
  } catch (error) {
    return next(error);
  }
};

//updatePoints
exports.updatePoints = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isAccepted, problemId, code, language, status } = req.body;

    // Fetch the problem from the database using the problemId
    const problem = await Problem.findById(problemId);
    console.log(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const { difficulty } = problem;

    let pointsToAdd = 0;
    let pointsToRemove = 0;

    if (isAccepted) {
      switch (difficulty) {
        case "hard":
          pointsToAdd = 30;
          break;
        case "medium":
          pointsToAdd = 20;
          break;
        case "easy":
          pointsToAdd = 10;
          break;
        default:
          break;
      }
    } else {
      pointsToRemove = 5;
    }

    const updateQuery = {
      $inc: {
        questionsSolved: isAccepted ? 1 : 0,
        pointsEarned: isAccepted ? pointsToAdd : -pointsToRemove,
      },
    };

    if (isAccepted) {
      updateQuery.$addToSet = {
        solvedProblems: problemId,
      };
    }

    const user = await User.findByIdAndUpdate(id, updateQuery, { new: true });

    // Store Submission History
    if (code && language && status) {
      await Submission.create({
        user: id,
        problem: problemId,
        code,
        language,
        status,
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
    // next();
  } catch (error) {
    return next(error);
  }
};

// get user submissions (authenticated — only logged-in users)
exports.getUserSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ user: req.params.id })
      .populate("problem", "title")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    return next(error);
  }
};

// get ALL submissions — admin only
exports.getAllSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find()
      .populate("user", "name userName")
      .populate("problem", "title difficulty")
      .sort({ createdAt: -1 })
      .limit(200); // cap at 200 most recent
    res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    return next(error);
  }
};
