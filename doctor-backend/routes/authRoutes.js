const express = require("express");

const router = express.Router();

const {
    registerDoctor,
} = require("../controllers/authController");

router.post(
    "/register",
    registerDoctor
);

module.exports = router;