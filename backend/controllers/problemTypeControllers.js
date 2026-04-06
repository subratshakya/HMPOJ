const User = require("../models/userModels");
const ErrorResponse = require("../utils/errorResponse");

//create problem category
exports.createProblemType = async (req, res, next) => {
    try {
      const problemT = await ProblemType.create({
        problemTypeName: req.body.problemTypeName,
        user: req.user.id,
      });
      res.status(201).json({
        success: true,
        problemT,
      });
    } catch (error) {
      next(error);
    }
  };