const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    experience: {
        type: Number,
        required: true,
    },
    specialization: {
        type: String,
        required: true,
    },
    licenseNumber: {
        type: String,
        required: true,
    },
    documents: [{
        type: String,
    }],
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    doctorId: {
        type: String,
        unique: true,
        sparse: true,
    },
    rejectionReason: {
        type: String,
    },
    role: {
        type: String,
        enum: ["doctor", "admin"],
        default: "doctor",
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Doctor", doctorSchema);