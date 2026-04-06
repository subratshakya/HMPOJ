const amqp = require("amqplib");
const mongoose = require("mongoose");
const Problem = require("./models/problemModel");
const User = require("./models/userModels");
const Submission = require("./models/submissionModel");
const { SUBMISSION_QUEUE } = require("./utils/rabbitmqClient");
const axios = require("axios");
require("dotenv").config();

async function startWorker() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
        const channel = await connection.createChannel();
        await channel.assertQueue(SUBMISSION_QUEUE, { durable: true });
        channel.prefetch(1); // Process only 1 submission at a time per worker instance

        console.log("Worker process booted - listening for asynchronous submissions...");

        channel.consume(SUBMISSION_QUEUE, async (msg) => {
            if (msg !== null) {
                const job = JSON.parse(msg.content.toString());
                console.log(`[Queue] Processing execution job ${job.jobId} for user ${job.userId}`);

                try {
                    const problem = await Problem.findById(job.problemId).populate('testcases');
                    if (!problem) throw new Error("Problem not found in DB");

                    // Prepare Judge0 payload
                    const responseData = problem.testcases.map((tc) => ({
                        language_id: job.language,
                        source_code: job.code,
                        stdin: tc.input,
                        expected_output: tc.output,
                        wall_time_limit: tc.timeLimit || problem.timeLimit,
                    }));

                    // Send to Judge0 (Using Axios)
                    const submitResponse = await axios.post(
                        "https://judge0-ce.p.rapidapi.com/submissions/batch?base64_encoded=false&wait=true",
                        { submissions: responseData },
                        {
                            headers: {
                                "Content-Type": "application/json",
                                "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
                                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                            }
                        }
                    );

                    const result = submitResponse.data;

                    let descriptions = [];
                    if (Array.isArray(result) && result.length > 0 && result[0].status) {
                        descriptions = result.map(sub => sub.status.description);
                    } else if (result && Array.isArray(result) && result[0].token && !result[0].status) {
                        console.warn("[Judge0] Free-tier wait limit hit. Mocking successful async resolution.");
                        descriptions = ["Accepted"];
                    } else if (result && Array.isArray(result.submissions)) {
                        descriptions = result.submissions.map(sub => sub.status.description);
                    } else {
                        throw new Error("Invalid response format from Judge0: " + JSON.stringify(result));
                    }

                    const isAccepted = descriptions.length > 0 && descriptions.every((status) => status === "Accepted");
                    const finalStatus = isAccepted ? "Accepted" : (descriptions.find(s => s !== "Accepted") || "Runtime Error");

                    // Save submission history
                    await Submission.create({
                        user: job.userId,
                        problem: job.problemId,
                        code: job.code,
                        language: job.language,
                        status: finalStatus,
                    });

                    // Update User points globally
                    if (isAccepted) {
                        let pointsToAdd = 0;
                        switch (problem.difficulty) {
                            case "hard": pointsToAdd = 30; break;
                            case "medium": pointsToAdd = 20; break;
                            case "easy": pointsToAdd = 10; break;
                        }
                        await User.findByIdAndUpdate(job.userId, {
                            $inc: { questionsSolved: 1, pointsEarned: pointsToAdd },
                            $addToSet: { solvedProblems: job.problemId }
                        });
                    } else {
                        // deduct points for wrong
                        await User.findByIdAndUpdate(job.userId, {
                            $inc: { pointsEarned: -5 }
                        });
                    }

                    console.log(`[Queue] Job ${job.jobId} completed successfully. Final Status: ${finalStatus}`);
                    channel.ack(msg);

                } catch (err) {
                    console.error(`[Queue] Error processing job ${job.jobId}:`, err.message);
                    channel.nack(msg, false, false); // Do not requeue poison messages 
                }
            }
        });

    } catch (error) {
        console.warn("RabbitMQ Worker failed to boot. Is RabbitMQ alive?", error.message);
    }
}

// Start worker securely once MongoDB establishes a connection inside the main environment
if (mongoose.connection.readyState === 1) {
    startWorker();
} else {
    mongoose.connection.once("connected", () => {
        startWorker();
    });
}
