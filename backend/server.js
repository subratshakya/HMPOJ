const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error");
const mongoose = require("mongoose");
const { getRedisClient } = require("./utils/redisClient");
const { connectRabbitMQ } = require("./utils/rabbitmqClient");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hmp_oj")
  .then(() => console.log("MongoDb connected"))
  .catch((err) => console.log("MongoDb error", err));

// Connect to Redis (caching) and RabbitMQ (async queue) - both are optional
getRedisClient();
connectRabbitMQ();

app.use(
  cors({
    origin: [process.env.CLIENT_ORIGIN || "http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.options("*", cors());
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "5mb",
    extended: true,
  })
);
app.use(cookieParser());

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("newuser", (username) => {
    console.log(username + " joined the conversation");
    socket.broadcast.emit("update", username + " joined the conversation");
  });

  socket.on("exituser", (username) => {
    console.log(username + " left the conversation");
    socket.broadcast.emit("update", username + " left the conversation");
  });

  socket.on("chat", (message) => {
    console.log("New message:", message);
    socket.broadcast.emit("chat", message);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const problemRoutes = require("./routes/problemRoutes.js");
const blogRoutes = require("./routes/blogRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", problemRoutes);
app.use("/api", blogRoutes);
app.use("/api", submissionRoutes);

// Error middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Execute the async background worker as part of the backend instance
  require("./worker");
});
