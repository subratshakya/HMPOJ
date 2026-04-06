const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const blogSchema = new mongoose.Schema(
  {
    blogTitle: {
      type: String,
      trim: true,
      required: [true, "Title is required"],
      maxlength: 30,
    },

    blogDesc: {
      type: String,
      trim: true,
      required: [true, "Description is required"],
    },
    blogContent: {
      type: String,
      trim: true,
      required: [true, "Content is required"],
    },

    authorName: {
      type: String,
      ref: "User",
      required: true,
    },
    authorDesc: {
      type: String,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
