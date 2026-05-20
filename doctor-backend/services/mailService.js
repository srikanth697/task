const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_SMTP_USER || process.env.BREVO_EMAIL,
        pass: process.env.BREVO_SMTP_KEY,
    },
});

/**
 * Base function to send raw emails
 */
const sendMail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"Doctor Portal" <${process.env.BREVO_EMAIL}>`,
            to,
            subject,
            html,
        });
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error(`Email delivery failed to ${to}:`, error.message);
    }
};

/**
 * Sends a welcome email immediately upon registration
 */
const sendWelcomeMail = async (to, name) => {
    const subject = "Registration Submitted - Doctor Portal";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #4A90E2; text-align: center;">Welcome to the Doctor Portal!</h2>
            <p>Dear Dr. ${name},</p>
            <p>Thank you for registering with our system. Your application has been successfully received.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 5px solid #4A90E2; margin: 20px 0;">
                <strong>Current Status:</strong> Pending Verification
            </div>
            <p>Our administrators are reviewing your documents and medical credentials. We will notify you via email as soon as your account is approved.</p>
            <p>Please note that you will not be able to log in to your account until the verification is complete.</p>
            <br>
            <p>Best regards,<br><strong>The Admin Team</strong></p>
        </div>
    `;
    await sendMail(to, subject, html);
};

/**
 * Sends an email when a doctor's registration is approved
 */
const sendApprovalMail = async (to, name, doctorId) => {
    const subject = "Application Approved - Welcome Onboard!";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2ECC71; text-align: center;">Congratulations!</h2>
            <p>Dear Dr. ${name},</p>
            <p>We are pleased to inform you that your registration has been <strong>approved</strong> by our medical administrative board.</p>
            <div style="background-color: #f1faf5; padding: 15px; border-left: 5px solid #2ECC71; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0; font-size: 16px;"><strong>Your Unique Doctor ID:</strong> <span style="font-family: monospace; font-size: 18px; color: #27AE60; font-weight: bold;">${doctorId}</span></p>
            </div>
            <p>You now have full access to the portal. You can log in using your registered email and password.</p>
            <br>
            <p>Best regards,<br><strong>The Admin Team</strong></p>
        </div>
    `;
    await sendMail(to, subject, html);
};

/**
 * Sends an email when a doctor's registration is rejected
 */
const sendRejectionMail = async (to, name, reason) => {
    const subject = "Application Status Update - Doctor Portal";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #E74C3C; text-align: center;">Application Status Update</h2>
            <p>Dear Dr. ${name},</p>
            <p>Thank you for your interest in joining the Doctor Portal. After reviewing your credentials and submitted documents, we regret to inform you that we cannot approve your application at this time.</p>
            <div style="background-color: #fdf2f2; padding: 15px; border-left: 5px solid #E74C3C; margin: 20px 0; border-radius: 5px;">
                <strong>Reason for Rejection:</strong><br>
                <p style="margin-top: 5px; color: #c0392b;">${reason}</p>
            </div>
            <p>If you believe this decision was made in error or wish to re-submit your credentials, please contact our support team.</p>
            <p><strong>Support Email:</strong> support@task.com<br><strong>Support Helpline:</strong> +1 (800) 555-0199</p>
            <br>
            <p>Best regards,<br><strong>The Admin Team</strong></p>
        </div>
    `;
    await sendMail(to, subject, html);
};

module.exports = {
    sendMail,
    sendWelcomeMail,
    sendApprovalMail,
    sendRejectionMail,
};