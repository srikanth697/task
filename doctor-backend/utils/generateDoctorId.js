const Doctor = require("../models/Doctor");

/**
 * Generates a unique Doctor ID in the format: DOC-YYYY-NNNN
 * Verifies with the database to prevent duplicate collisions.
 */
const generateDoctorId = async () => {
    let isUnique = false;
    let doctorId = "";
    const currentYear = new Date().getFullYear();

    while (!isUnique) {
        const randomNum = Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit number
        doctorId = `DOC-${currentYear}-${randomNum}`;
        
        const existingDoctor = await Doctor.findOne({ doctorId });
        if (!existingDoctor) {
            isUnique = true;
        }
    }

    return doctorId;
};

module.exports = generateDoctorId;
