const Blog = require("../models/blogModel");
const ErrorResponse = require("../utils/errorResponse");

// Create a new blog
exports.createBlog = async (req, res, next) => {
  try {
    const blog = await Blog.create(req.body);
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

// Get all blogs
exports.getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    next(error);
  }
};

// Get single blog by ID
exports.getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return next(
        new ErrorResponse(`Blog not found with ID ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

// Update blog by ID
exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!blog) {
      return next(
        new ErrorResponse(`Blog not found with ID ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

// Delete blog by ID
exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return next(
        new ErrorResponse(`Blog not found with ID ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
