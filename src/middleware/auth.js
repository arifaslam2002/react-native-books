import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        console.log("Auth header received:", authHeader);
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }
        
        // Extract token by removing "Bearer " prefix
        const token = authHeader.replace("Bearer ", "");
        console.log("Extracted token:", token.substring(0, 20) + "...");
        
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token decoded successfully, user ID:", decoded.id);
        
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        
        req.user = user;
        console.log("User authenticated:", user._id);
        next();
        
    } catch (error) {
        console.log("Error in protecting route:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

export default protectRoute;