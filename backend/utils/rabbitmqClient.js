const amqplib = require("amqplib");

let connection = null;
let channel = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const SUBMISSION_QUEUE = "submission_queue";

const connectRabbitMQ = async () => {
    try {
        connection = await amqplib.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(SUBMISSION_QUEUE, { durable: true });
        console.log("RabbitMQ connected - worker queue ready ✓");
        return channel;
    } catch (err) {
        console.warn("Could not connect to RabbitMQ. Async queue disabled:", err.message);
        return null;
    }
};

const getChannel = () => channel;

const publishToQueue = async (data) => {
    if (!channel) return false;
    try {
        channel.sendToQueue(
            SUBMISSION_QUEUE,
            Buffer.from(JSON.stringify(data)),
            { persistent: true }
        );
        return true;
    } catch (err) {
        console.error("Failed to publish to RabbitMQ queue:", err.message);
        return false;
    }
};

module.exports = { connectRabbitMQ, getChannel, publishToQueue, SUBMISSION_QUEUE };
