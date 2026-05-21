const Doctor = require("../models/Doctor");
const generateDoctorId = require("../utils/generateDoctorId");
const { sendApprovalMail, sendRejectionMail } = require("../services/mailService");

// Get Pending Doctors (Admin Panel / Protected)
exports.getPendingDoctors = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        
        // Base query to fetch pending doctors
        const filter = { status: "pending", role: "doctor" };

        // Search functionality
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { specialization: { $regex: search, $options: "i" } },
            ];
        }

        // Pagination calculations
        const skip = (Number(page) - 1) * Number(limit);
        const total = await Doctor.countDocuments(filter);

        const doctors = await Doctor.find(filter)
            .select("-password") // Do not send password hashes
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
            data: doctors,
        });
    } catch (error) {
        console.error("Error fetching pending doctors:", error.message);
        res.status(500).json({ message: "Internal server error: " + error.message });
    }
};

// Get Doctor Details (Admin Panel / Protected)
exports.getDoctorDetails = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).select("-password");

        if (!doctor || doctor.role !== "doctor") {
            return res.status(404).json({ message: "Doctor profile not found" });
        }

        res.status(200).json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        console.error("Error fetching doctor details:", error.message);
        res.status(500).json({ message: "Internal server error: " + error.message });
    }
};

// Approve Doctor Application (Admin Panel / Protected)
exports.approveDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor || doctor.role !== "doctor") {
            return res.status(404).json({ message: "Doctor profile not found" });
        }

        if (doctor.status !== "pending") {
            return res.status(400).json({ message: `Cannot approve doctor with status: ${doctor.status}` });
        }

        // Generate custom unique Doctor ID
        const generatedId = await generateDoctorId();

        // Update doctor profile status
        doctor.status = "approved";
        doctor.doctorId = generatedId;
        await doctor.save();

        await sendApprovalMail(
            doctor.email,
            doctor.fullName,
            generatedId
        );

        res.status(200).json({
            success: true,
            message: "Doctor registration application approved successfully.",
            data: {
                id: doctor._id,
                fullName: doctor.fullName,
                email: doctor.email,
                status: doctor.status,
                doctorId: doctor.doctorId,
            },
        });
    } catch (error) {
        console.error("Error approving doctor:", error.message);
        res.status(500).json({ message: "Internal server error: " + error.message });
    }
};

// Reject Doctor Application (Admin Panel / Protected)
exports.rejectDoctor = async (req, res) => {
    try {
        const { rejectionReason } = req.body || {};

        if (!rejectionReason || rejectionReason.trim() === "") {
            return res.status(400).json({ message: "Rejection reason is required" });
        }

        const doctor = await Doctor.findById(req.params.id);

        if (!doctor || doctor.role !== "doctor") {
            return res.status(404).json({ message: "Doctor profile not found" });
        }

        if (doctor.status !== "pending") {
            return res.status(400).json({ message: `Cannot reject doctor with status: ${doctor.status}` });
        }

        // Update status and store rejection reason
        doctor.status = "rejected";
        doctor.rejectionReason = rejectionReason;
        await doctor.save();

        await sendRejectionMail(
            doctor.email,
            doctor.fullName,
            rejectionReason
        );

        res.status(200).json({
            success: true,
            message: "Doctor registration application rejected.",
            data: {
                id: doctor._id,
                fullName: doctor.fullName,
                email: doctor.email,
                status: doctor.status,
                rejectionReason: doctor.rejectionReason,
            },
        });
    } catch (error) {
        console.error("Error rejecting doctor:", error.message);
        res.status(500).json({ message: "Internal server error: " + error.message });
    }
};

// Get all users/doctors (Admin Panel / Protected)
exports.getAllUsers = async (req, res) => {
    try {
        const { role, status, search, page = 1, limit = 10 } = req.query;
        const query = {};

        // Apply filters
        if (role) query.role = role;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { specialization: { $regex: search, $options: "i" } },
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Doctor.countDocuments(query);
        
        const users = await Doctor.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: users,
        });
    } catch (error) {
        console.error("Error fetching all users:", error.message);
        res.status(500).json({ message: "Internal server error: " + error.message });
    }
};

// Delete User/Doctor (Admin Panel / Protected)
exports.deleteUser = async (req, res) => {
    try {
        const user = await Doctor.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent admin from deleting themselves (safety check)
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "Access denied: Admins cannot delete their own accounts via this endpoint." });
        }

        await Doctor.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: `User ${user.fullName} (${user.email}) deleted successfully.`,
        });
    } catch (error) {
        console.error("Error deleting user:", error.message);
        res.status(500).json({ message: "Internal server error: " + error.message });
    }
};
