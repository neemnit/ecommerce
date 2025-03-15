import dotenv from "dotenv"
import jwt from 'jsonwebtoken'
dotenv.config()

const generateToken = (user) => {
    return jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "3h" } // Change to 5 minutes for testing
    );
  };
  const generateRefreshToken = (user) => {
    return jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" } // 7 days
    );
  };
  function generateSessionId() {
    return "session_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
  }
  export {generateToken,generateRefreshToken,generateSessionId}