const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");

// Authenticate user token and attach user to request object
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Extract token
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user from database and attach to req.user (excluding password)
            req.user = await Doctor.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ message: "User not found or authorization failed" });
            }

            next();
        } catch (error) {
            console.error("Token verification error:", error.message);
            return res.status(401).json({ message: "Not authorized, invalid token" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token provided" });
    }
};

// Check if user has admin role
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ message: "Access denied: Admins only" });
    }
};

module.exports = { protect, adminOnly };
