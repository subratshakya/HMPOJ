const express = require("express");
const router = express.Router();
const { enqueueSubmission } = require("../controllers/submissionControllers");
const { isAuthenticated } = require("../middleware/auth");

// Push a new code execution job to RabbitMQ queue
router.post("/submissions/enqueue", isAuthenticated, enqueueSubmission);

module.exports = router;
