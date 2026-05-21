const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY,
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    dnsTimeout: 30000,
    family: 4,
});

transporter.verify((error, success) => {
    if (error) {
        console.log("SMTP VERIFY ERROR:", error);
    } else {
        console.log("SMTP SERVER READY");
    }
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
        console.error("FULL EMAIL ERROR:", error);
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

            <div style="margin-top: 25px;">
                <a href="${process.env.FRONTEND_URL || 'https://YOUR_FRONTEND_URL'}/login"
                style="
                background:#2ECC71;
                color:white;
                padding:12px 22px;
                text-decoration:none;
                border-radius:6px;
                font-weight:bold;
                display:inline-block;
                ">
                Login Now
                </a>
            </div>
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