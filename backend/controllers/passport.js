import { generateRefreshToken, generateToken, generateSessionId } from "../utils/generateToken.js";
import User from "../models/user.js";
import jwt from 'jsonwebtoken'
const sessions = new Map();

const passportController = {
  getAuthenticate: async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { user, token } = req.user; // Use the user from Google Strategy
      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        return res.status(401).json({ message: "User not found" });
      }

      const accessToken = generateToken(existingUser);
      const refreshToken = generateRefreshToken(existingUser);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const sessionId = generateSessionId();
      sessions.set(sessionId, accessToken);

      res.redirect(`http://localhost:3000/login-success?sessionId=${sessionId}`);
      next();
    } catch (error) {
      next(error);
    }
  },


getSessionId: (req, res) => {
  const sessionId = req.params.sessionId; // ✅ Read from cookies

  

  if (!sessionId) {
    return res.status(400).json({ message: "Session ID is required" });
  }

  const accessToken = sessions.get(sessionId);

  if (!accessToken) {
  
    return res.status(401).json({ message: "Invalid or expired session" });
  }

  res.json({ accessToken });
},

  getRefresh:(req,res)=>{
    
    
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    
      jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: "Forbidden" });
        }
    
        // Generate new access token
        const newAccessToken = generateToken({ id: decoded.id, email: decoded.email, name: decoded.name });
    
        res.json({ accessToken: newAccessToken });
      });
  
  }
  ,
  getUser: async (req, res) => {
    try {
      const userId = req.params.userId;
    
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const user = await User.findById(userId).select("-password"); // Exclude password for security

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
   logout :async (req, res) => {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: "Lax",
      });
  
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ error: "Logout failed" });
    }
  }
};

export default passportController;





















// 