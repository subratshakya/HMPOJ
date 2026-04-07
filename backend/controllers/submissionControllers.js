const { publishToQueue } = require("../utils/rabbitmqClient");
const ErrorResponse = require("../utils/errorResponse");
const crypto = require("crypto");

// Endpoint to enqueue a code submission instead of blocking the request
exports.enqueueSubmission = async (req, res, next) => {
    try {
        const { problemId, code, language, contestId } = req.body;

        // We get the user ID from the JWT auth token
        const userId = req.user.id;

        // Generate a unique submission job tracking ID
        const jobId = crypto.randomUUID();

        const jobData = {
            jobId,
            userId,
            problemId,
            code,
            language,
            contestId, // Optional reference for contest submissions
        };

        // Push the heavy logic into the background queue
        const enqueued = await publishToQueue(jobData);

        if (enqueued) {
            return res.status(202).json({
                success: true,
                message: "Code submission queued for execution.",
                jobId,
            });
        } else {
            return next(new ErrorResponse("Failed to queue submission.", 500));
        }
    } catch (error) {
        next(error);
    }
};
