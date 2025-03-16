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

// ✅ CORS setup (must include credentials)
app.use(
  cors({
    origin: "https://ecommerce-a2i2.vercel.app", // Allow frontend requests
    credentials: true, // Required if using cookies or authentication headers
     // Ensure correct methods are allowed
     // Include necessary headers
  })
);

// ✅ Handle OPTIONS preflight requests explicitly



app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

app.use(cookieParser()); // ✅ Place BEFORE `router` to ensure cookies are parsed
app.use(passport.initialize());

app.use(router); // ✅ Move router setup AFTER cookieParser

connectDB();

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server connected on port ${port}`));
