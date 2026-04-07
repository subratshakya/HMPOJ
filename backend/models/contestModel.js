const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    problems: [
      {
        problem: {
          type: ObjectId,
          ref: "Problem",
          required: true,
        },
        points: {
          type: Number,
          required: true,
        },
      },
    ],
    participants: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contest", contestSchema);
