const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const submissionSchema = new mongoose.Schema(
    {
        user: {
            type: ObjectId,
            ref: "User",
            required: true,
        },
        problem: {
            type: ObjectId,
            ref: "Problem",
            required: true,
        },
        contest: {
            type: ObjectId,
            ref: "Contest",
            required: false,
        },
        code: {
            type: String,
            required: true,
        },
        language: {
            type: Number, // Judge0 Language ID
            required: true,
        },
        status: {
            type: String, // "Accepted", "Wrong Answer", "Runtime Error", etc.
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
