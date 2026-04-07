const Contest = require("../models/contestModel");
const Submission = require("../models/submissionModel");
const User = require("../models/userModels");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Create a new contest
// @route   POST /api/admin/contest/create
// @access  Private/Admin
exports.createContest = async (req, res, next) => {
  try {
    const { title, description, startTime, endTime, problems } = req.body;
    
    const contest = await Contest.create({
      title,
      description,
      startTime,
      endTime,
      problems
    });

    res.status(201).json({
      success: true,
      contest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contests (Upcoming, Active, Past)
// @route   GET /api/contests
// @access  Public
exports.getAllContests = async (req, res, next) => {
  try {
    // Only return metadata, not the exact problems array
    const contests = await Contest.find().select("-problems.problem").sort({ startTime: -1 });

    res.status(200).json({
      success: true,
      contests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Contest Details
// @route   GET /api/contest/:id
// @access  Private
exports.getContestDetails = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate("problems.problem", "title difficulty problemType")
      .populate("participants", "name userName rating");

    if (!contest) {
      return next(new ErrorResponse("Contest not found", 404));
    }

    const now = new Date();
    // Security Gate: Mask problems if the contest has not started AND the user is not an Admin
    const isAdmin = req.user.role === 1;
    if (now < contest.startTime && !isAdmin) {
      contest.problems = []; // Hide the problems
    }

    res.status(200).json({
      success: true,
      contest,
      isActive: now >= contest.startTime && now <= contest.endTime
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register for Contest
// @route   POST /api/contest/:id/register
// @access  Private
exports.registerContest = async (req, res, next) => {
  try {
    const contestId = req.params.id;
    const userId = req.user.id;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return next(new ErrorResponse("Contest not found", 404));
    }

    // Check if already registered
    if (contest.participants.includes(userId)) {
      return next(new ErrorResponse("Already registered", 400));
    }

    // Register User
    contest.participants.push(userId);
    await contest.save();

    // Add contest to user's history
    await User.findByIdAndUpdate(userId, {
      $push: { contestsParticipated: contestId }
    });

    res.status(200).json({
      success: true,
      message: "Successfully registered for contest",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Contest Leaderboard (Time decay scoring)
// @route   GET /api/contest/:id/leaderboard
// @access  Private
exports.getContestLeaderboard = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return next(new ErrorResponse("Contest not found", 404));

    // Get all submissions for this contest
    const submissions = await Submission.find({ contest: contest._id })
      .populate("user", "name userName rating")
      .sort({ createdAt: 1 }); // Oldest first to process chronological penalties

    const userScores = {}; // userId -> { points, penaltyTime, problems: { pId: { status, fails } } }

    submissions.forEach(sub => {
      const uId = sub.user._id.toString();
      const pId = sub.problem.toString();
      
      if (!userScores[uId]) {
        userScores[uId] = {
          user: sub.user,
          totalPoints: 0,
          totalPenalty: 0, // Time penalty mapped as Codeforces penalty minutes
          problems: {}
        };
      }

      const pStatus = userScores[uId].problems[pId] || { status: "pending", fails: 0, points: 0 };

      // If they already accepted this problem, ignore further submissions
      if (pStatus.status === "Accepted") return;

      if (sub.status === "Accepted") {
        // Calculate minutes since start
        const submitTime = new Date(sub.createdAt);
        const startTime = new Date(contest.startTime);
        const minutesElapsed = Math.floor((submitTime - startTime) / 60000);

        // Find max points for this problem from contest definition
        const contestProblem = contest.problems.find(p => p.problem.toString() === pId);
        const maxPoints = contestProblem ? contestProblem.points : 0;

        // Codeforces style: Point decay (e.g. lose 1/250 of max points per minute) + 50 points flat penalty per wrong attempt
        const decay = Math.floor(minutesElapsed * (maxPoints / 250));
        let earned = maxPoints - decay - (pStatus.fails * 50);
        if (earned < (maxPoints * 0.3)) earned = Math.floor(maxPoints * 0.3); // Minimum floor points if solved

        pStatus.status = "Accepted";
        pStatus.points = earned;
        
        userScores[uId].totalPoints += earned;
        userScores[uId].totalPenalty += minutesElapsed + (pStatus.fails * 20); // standard 20 min aggregate tracking
      } else if (sub.status === "Wrong Answer" || sub.status.includes("Runtime Error")) {
        pStatus.fails += 1;
      }

      userScores[uId].problems[pId] = pStatus;
    });

    // Sort leaderboard: Points DESC, then Penalty ASC
    const leaderboard = Object.values(userScores).sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return a.totalPenalty - b.totalPenalty;
    });

    res.status(200).json({
      success: true,
      leaderboard
    });
  } catch (error) {
    next(error);
  }
};
