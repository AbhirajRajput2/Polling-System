// server/index.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import Poll from "./models/Question.js";
import connectDB from "./utils/db.js";
import questrouter from "./routes/questionRoutes.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Use CORS middleware with env
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use("/api/questions", questrouter);

// Connect to MongoDB
connectDB();

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

let currentQuestion = null;
let answers = {};

io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  socket.on("join", (data) => {
    if (!data) return console.error("Join event received without data");
    const { name, role } = data;
    if (!name || !role) return console.error("Invalid join payload:", data);

    console.log(`👤 ${name} joined as ${role}`);
    socket.data.name = name;
    socket.data.role = role;

    io.emit("participants", getAllParticipants());
  });

  socket.on("sendMessage", (messageData) => {
    io.emit("receiveMessage", messageData);
  });

  socket.on("kickStudent", (studentSocketId) => {
    if (socket.data.role !== "teacher") return;
    const target = io.sockets.sockets.get(studentSocketId);
    if (target) {
      target.emit("kicked", { reason: "You were removed by the teacher." });
      setTimeout(() => target.disconnect(true), 300);
    }
    io.emit("participants", getAllParticipants());
  });

  socket.on("new-question", async (poll) => {
    try {
      currentQuestion = poll;
      answers = {};
      io.emit("receive-question", poll);

      const thisPoll = poll;
      setTimeout(async () => {
        if (!thisPoll) return;

        const resultsCount = thisPoll.options.map(() => 0);
        Object.values(answers).forEach((opt) => resultsCount[opt]++);

        try {
          const savedPoll = new Poll({
            question: thisPoll.question,
            options: thisPoll.options,
            duration: thisPoll.duration,
            results: resultsCount,
          });
          await savedPoll.save();
        } catch (err) {
          console.error("❌ Error saving poll:", err);
        }

        currentQuestion = null;
        io.emit("poll-ended", {
          question: thisPoll.question,
          options: thisPoll.options,
          results: resultsCount,
        });
      }, (thisPoll.duration || 60) * 1000);
    } catch (err) {
      console.error("❌ new-question error:", err);
    }
  });

  socket.on("submit-answer", ({ name, selectedOption }) => {
    if (!currentQuestion) return;
    if (answers[name] !== undefined) return;

    answers[name] = selectedOption;

    const resultsCount = currentQuestion.options.map(() => 0);
    Object.values(answers).forEach((opt) => resultsCount[opt]++);
    io.emit("live-results", resultsCount);
  });

  socket.on("get-poll-history", async () => {
    try {
      const history = await Poll.find().sort({ createdAt: -1 }).lean();
      socket.emit("poll-history", history);
    } catch (err) {
      console.error("❌ get-poll-history error:", err);
      socket.emit("poll-history", []);
    }
  });

  socket.on("disconnect", () => {
    console.log("❎ User disconnected:", socket.id);
    io.emit("participants", getAllParticipants());
  });

  function getAllParticipants() {
    return Array.from(io.sockets.sockets.values()).map((s) => ({
      id: s.id,
      name: s.data?.name || "Unknown",
      role: s.data?.role || "student",
    }));
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
