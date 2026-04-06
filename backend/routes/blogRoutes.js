const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/auth");
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

// Define routes

// Create a new blog
router.post("/createBlog", isAdmin, createBlog);

// Get all blogs
router.get("/blogs", getAllBlogs);

// Get a single blog by ID
router.get("/blogs/:id", getBlogById);

// Update a blog by ID
router.put("/blogs/:id", updateBlog);

// Delete a blog by ID
router.delete("/blogs/:id", deleteBlog);

module.exports = router;
