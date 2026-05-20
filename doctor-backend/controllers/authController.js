const Doctor = require("../models/Doctor");

const bcrypt = require("bcryptjs");

exports.registerDoctor = async (
    req,
    res
) => {

    try {

        const {
            fullName,
            email,
            password,
        } = req.body;

        const existingDoctor =
        await Doctor.findOne({ email });

        if (existingDoctor) {

            return res.status(400).json({
                message: "Doctor already exists",
            });
        }

        const hashedPassword =
        await bcrypt.hash(password, 10);

        const doctor = await Doctor.create({

            fullName,

            email,

            password: hashedPassword,
        });

        res.status(201).json({

            success: true,

            message:
            "Registration submitted",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });
    }
};