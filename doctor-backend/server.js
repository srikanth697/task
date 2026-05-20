const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Initialize Database connection & seed admin
connectDB();

// Ensure the local uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve files in the uploads folder statically
app.use("/uploads", express.static(uploadDir));

// Routes Configuration
app.use("/api/auth", authRoutes);     // Frontend / Doctor facing endpoints
app.use("/api/admin", adminRoutes);   // Admin Panel facing endpoints

app.get("/", (req, res) => {
    res.send("Doctor Registration & Approval System API Running");
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error("Express Error:", err.stack);
    
    // Handle Multer upload errors gracefully
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File upload failed: File size exceeds the 5MB limit" });
    }
    
    res.status(err.status || 500).json({
        message: err.message || "Internal server error occurred",
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});