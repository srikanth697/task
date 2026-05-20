const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Doctor = require("../models/Doctor");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        // Seed default administrator if not present
        const adminEmail = "admin@task.com";
        const adminExists = await Doctor.findOne({ email: adminEmail });
        
        if (!adminExists) {
            console.log("Seeding default admin account...");
            const hashedAdminPassword = await bcrypt.hash("adminpassword123", 10);
            
            await Doctor.create({
                fullName: "Super Admin",
                email: adminEmail,
                password: hashedAdminPassword,
                mobileNumber: "0000000000",
                gender: "other",
                experience: 0,
                specialization: "Administration",
                licenseNumber: "ADMIN-000",
                status: "approved",
                role: "admin",
            });
            console.log("Default admin seeded successfully (admin@task.com / adminpassword123)");
        }
    } catch (error) {
        console.error("Database connection or seeding failed:", error);
        process.exit(1);
    }
};

module.exports = connectDB;