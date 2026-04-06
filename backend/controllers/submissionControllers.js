const { publishToQueue } = require("../utils/rabbitmqClient");
const ErrorResponse = require("../utils/errorResponse");
const crypto = require("crypto");

// Endpoint to enqueue a code submission instead of blocking the request
exports.enqueueSubmission = async (req, res, next) => {
    try {
        const { problemId, code, language, isAccepted } = req.body;

        // In a real production system, the frontend shouldn't pass 'isAccepted'. 
        // The worker should figure it out! But for now we just pass along the payload so the backend executes it exactly the same.

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
            // Temporarily letting frontend pass testcase variables or just passing the raw code to the worker. 
            // The logic here is that the frontend sends the code, and the backend says "Got it!"
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
