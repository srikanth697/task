const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendWelcomeMail } = require("../services/mailService");

// Register Doctor (Frontend / Doctor facing)
exports.registerDoctor = async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            mobileNumber,
            gender,
            experience,
            specialization,
            licenseNumber,
        } = req.body;

        // Fallbacks mapping for API parameter resilience
        const mappedFullName = fullName || req.body.name;
        const mappedMobileNumber = mobileNumber || req.body.mobile || req.body.phone;

        // Custom validation check listing missing parameters explicitly
        const missingFields = [];
        if (!mappedFullName) missingFields.push("fullName (or 'name')");
        if (!email) missingFields.push("email");
        if (!password) missingFields.push("password");
        if (!mappedMobileNumber) missingFields.push("mobileNumber (or 'mobile'/'phone')");
        if (!gender) missingFields.push("gender");
        if (!experience) missingFields.push("experience");
        if (!specialization) missingFields.push("specialization");
        if (!licenseNumber) missingFields.push("licenseNumber");

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required registration fields: ${missingFields.join(", ")}`
            });
        }

        // Resilient parsing of experience value (handles strings like "5years" -> 5)
        const parsedExperience = parseInt(experience, 10);
        if (isNaN(parsedExperience)) {
            return res.status(400).json({
                message: "Experience must be a valid numeric value representing years of practice (e.g. 5)"
            });
        }

        // Email uniqueness check
        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ message: "An account with this email already exists" });
        }

        // Document upload validation
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one document/license file is required for verification" });
        }

        // Get relative file paths for uploaded documents
        const documents = req.files.map((file) => `uploads/${file.filename}`);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create doctor record in "pending" status
        const doctor = await Doctor.create({
            fullName: mappedFullName,
            email,
            password: hashedPassword,
            mobileNumber: mappedMobileNumber,
            gender,
            experience: parsedExperience,
            specialization,
            licenseNumber,
            documents,
            status: "pending",
            role: "doctor",
        });

        // Send welcome/acknowledgement email in the background (prevents blocking during SMTP timeouts on Render)
        sendWelcomeMail(email, mappedFullName).catch((err) => {
            console.error(`Email delivery failed to ${email}:`, err.message);
        });

        res.status(201).json({
            success: true,
            message: "Doctor registration submitted successfully. Your account is pending verification.",
            data: {
                id: doctor._id,
                fullName: doctor.fullName,
                email: doctor.email,
                status: doctor.status,
            },
        });
    } catch (error) {
        console.error("Registration error:", error.message);
        res.status(500).json({ message: "Internal server error: " + error.message });
    }
};

// Login API (Doctor & Admin unified auth)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Fetch user from DB
        const user = await Doctor.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Verify password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Access checks for doctors
        if (user.role === "doctor") {
            if (user.status === "pending") {
                return res.status(403).json({
                    message: "Access Denied: Your registration is still pending administrator approval.",
                    status: user.status,
                });
            } else if (user.status === "rejected") {
                return res.status(403).json({
                    message: `Access Denied: Your registration has been rejected. Reason: ${user.rejectionReason || "Credentials validation failed."}`,
                    status: user.status,
                    rejectionReason: user.rejectionReason,
                });
            }
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                status: user.status,
                doctorId: user.doctorId || null,
            },
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: "Internal server error: " + error.message });
    }
};