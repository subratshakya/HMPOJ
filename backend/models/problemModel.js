const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Title is required"],
      maxlength: 30,
    },
    timeLimit: {
      type: Number,

      required: [true, "Time Limit is required"],
      maxlength: 2,
    },
    difficulty: {
      type: String,
      trim: true,
      required: [true, "difficulty is required"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Description is required"],
    },
    input: {
      type: String,
      trim: true,
      required: [false, "Input is required"],
    },
    output: {
      type: String,
      trim: true,
      required: [false, "Output is required"],
    },
    // testcase: {
    //     type: ObjectId,
    //     ref: "Testcase",
    //     required: true,
    //   },
    sampleTest: {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
    },
    testcases: [
      {
        type: ObjectId,
        ref: "Testcase",
        required: true,
      },
    ],

    problemType: {
      type: String,
      trim: true,
      required: [true, "Type is required"],
    },
    
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Problem", problemSchema);
