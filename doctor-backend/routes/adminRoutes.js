const express = require("express");
const router = express.Router();
const {
    getPendingDoctors,
    getDoctorDetails,
    approveDoctor,
    rejectDoctor,
    getAllUsers,
    deleteUser,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All admin panel routes require JWT token authentication and "admin" role
router.use(protect, adminOnly);

// Route to get all pending doctors with optional search/filter and pagination
router.get("/pending", getPendingDoctors);

// Route to view detailed information for a specific doctor
router.get("/doctors/:id", getDoctorDetails);

// Route to approve a doctor application (generate ID, change status, send confirmation email)
router.put("/approve/:id", approveDoctor);

// Route to reject a doctor application (store rejection reason, change status, send rejection email)
router.put("/reject/:id", rejectDoctor);

// Route to list all users/doctors with filtering/search/pagination
router.get("/users", getAllUsers);

// Route to delete a user/doctor by ID
router.delete("/users/:id", deleteUser);

module.exports = router;
