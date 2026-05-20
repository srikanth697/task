const express = require("express");
const router = express.Router();

const { updateDoctorStatus } = require("../controllers/adminController");

// Example route: update doctor status
router.put("/doctor/:id/status", updateDoctorStatus);

module.exports = router;
