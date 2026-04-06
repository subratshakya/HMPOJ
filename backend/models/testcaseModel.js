const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const testcaseSchema = new mongoose.Schema(
  {
    input:{
        type:String,
        required:true,
    },
    output:{
        type:String,
        required:true,
    },
    // user: {
    //     type: ObjectId,
    //     ref: "User",
    //     required: true,
    //   },
      problem: {
        type: ObjectId,
        ref: "Problem",
        required: true,
      },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Testcase", testcaseSchema);