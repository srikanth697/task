const Doctor = require("../models/Doctor");

exports.updateDoctorStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		const doctor = await Doctor.findByIdAndUpdate(
			id,
			{ status },
			{ new: true }
		);

		if (!doctor) {
			return res.status(404).json({ message: "Doctor not found" });
		}

		res.status(200).json({
			success: true,
			message: "Doctor status updated",
			doctor,
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
