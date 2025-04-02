import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import cors from "cors";
import router from "./config/router.js";
import passport from "passport";
import cookieParser from "cookie-parser";
import "./passportsetup.js";

// ✅ Initialize Express & HTTP Server
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://ecommerce-a2i2.vercel.app", "https://ecommerce-woad-eight.vercel.app"],
    credentials: true,
  },
});

// ✅ Middleware Setup
app.use(
  cors({
    origin: ["https://ecommerce-a2i2.vercel.app", "https://ecommerce-woad-eight.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(router);

// ✅ Connect to MongoDB
connectDB();

// ✅ Handle Socket.io Connections
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // Listen for custom events from frontend
  socket.on("add_data", (data) => {
    console.log("📩 Admin added data:", data);
    io.emit("data_added", data); // Broadcast to all clients
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ✅ Pass Socket.io instance to routes/controllers
app.set("io", io);

// ✅ Fallback Route (For Unhandled API Requests)


// ✅ Start Server
const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
