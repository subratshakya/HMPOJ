const express = require("express");
const http = require("http");
const https = require("https");
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

const getAllowedOrigins = () => {
  const origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://hmpoj-blue.vercel.app",
  ];
  if (process.env.CLIENT_ORIGIN) {
    origins.push(...process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim()));
  }
  return [...new Set(origins.filter(Boolean))];
};

const app = express();
const server = http.createServer(app);

// Use a more robust CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
};

app.use(cors(corsOptions));
// Handle OPTIONS preflight requests explicitly
app.options("*", cors(corsOptions));

const io = socketIO(server, {
  cors: corsOptions,
});

// Health Check & Self-Ping (to keep Render instance awake during activity)
app.get("/ping", (req, res) => res.status(200).send("pong"));

const selfPing = () => {
  const url = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}/ping`;
  const protocol = url.startsWith("https") ? https : http;
  if (url.startsWith("http")) {
    protocol.get(url, (res) => {
      if (res.statusCode === 200) console.log("✓ Self-ping successful");
    }).on("error", (err) => {
      console.warn("! Self-ping failed:", err.message);
    });
  }
};
// Ping every 10 mins
setInterval(selfPing, 600000);mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27018/hmp_oj")
  .then(() => console.log("MongoDb connected ✓"))
  .catch((err) => console.log("MongoDb error", err));

// Connect to Redis (caching) and RabbitMQ (async queue) - both are optional
getRedisClient();
connectRabbitMQ();

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
const contestRoutes = require("./routes/contestRoutes");

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", problemRoutes);
app.use("/api", blogRoutes);
app.use("/api", submissionRoutes);
app.use("/api", contestRoutes);

// Error middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Execute the async background worker as part of the backend instance
  require("./worker");
});
