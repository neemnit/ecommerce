import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import router from "./config/router.js";
import passport from "passport";
import cookieParser from "cookie-parser";
import "./passportsetup.js";

const app = express();

// ✅ Middleware Setup
app.use(
  cors({
    origin: ["https://ecommerce-a2i2.vercel.app", "https://ecommerce-woad-eight.vercel.app/"],
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

// ✅ Fallback Route (For Unhandled API Requests)
app.use("*", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// ✅ Start Server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
