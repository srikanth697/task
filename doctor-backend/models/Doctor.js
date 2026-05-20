const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({

    fullName: String,

    email: {
        type: String,
        unique: true,
    },

    password: String,

    status: {
        type: String,
        default: "pending",
    },

    doctorId: String,

    rejectionReason: String,

}, {
    timestamps: true,
});

module.exports =
mongoose.model("Doctor", doctorSchema);