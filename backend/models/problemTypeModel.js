// const mongoose = require("mongoose");
// const { ObjectId } = mongoose.Schema;

// const problemTypeSchema = new mongoose.Schema(
//   {
//     problemTypeName: {
//       type: String,
//       trim: true,
//       required: [true, "Problem category is required"],
//       maxlength: 30,
//     },

//     user: {
//       type: ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("ProblemType", problemTypeSchema);