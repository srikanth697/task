const express = require("express");
const router = express.Router();
const { registerDoctor, login } = require("../controllers/authController");
const upload = require("../middleware/uploadMiddleware");

// Route for doctor registration (frontend facing) with file uploads (up to 5 documents)
router.post("/register", upload.array("documents", 5), registerDoctor);

// Route for doctor and admin login (unified endpoint)
router.post("/login", login);

module.exports = router;