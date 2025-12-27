const { createEmailAndSend, changePasswordTemplate, generateOTP, resetPasswordTemplate, verifyEmailTemplate } = require("../Helper/Email.js");
const { createAuditContext } = require("../Helper/AuditService.js");
const client = require('../Helper/Redis.js');
const User = require("../Models/User.js");

// API to send OTP
const sendEmail = {
    validator: async (req, res, next) => {
        const { email, isResetPassword } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });
        next();
    },
    controller: async (req, res) => {
        const { email, isResetPassword = false, isForgotPassword = false } = req.body;

        // Create audit context with request information
        const auditContext = createAuditContext({
            triggeredBy: req.user?.id || req.user?._id || 'anonymous',
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
            purpose: isResetPassword ? 'reset_password' : isForgotPassword ? 'change_password' : 'login_verification'
        });

        const otp = generateOTP();
        const name = email.split("@")[0];
        let emailTemplate = verifyEmailTemplate(name, otp);

        if (isResetPassword || isForgotPassword) {
            const user = await User.findOne({ email, isDeleted: false, isActive: true }).lean();
            if (!user) return res.status(400).json({ message: "User not found or not active, please check your email" });

            emailTemplate = isResetPassword ? resetPasswordTemplate(user.name, user.lastName, otp) : changePasswordTemplate(user.name, user.lastName, otp);
        }
        
        const subject = isResetPassword 
            ? `OTP for ${otp} - Reset Your Password` 
            : isForgotPassword 
                ? `OTP for ${otp} - Change Your Password` 
                : `OTP for ${otp} - Verify Your Email`;
        
        try {
            await client.del(email);
            // Pass audit context to createEmailAndSend
            await createEmailAndSend(email, subject, emailTemplate, otp, auditContext);
            return res.status(200).json({ message: "OTP sent successfully" });
        } catch (error) {
            console.error("❌ Email send failed:", error);
            // Audit is already logged in createEmailAndSend for failures
            return res.status(500).json({ message: "Email failed to send", error: error.message });
        }
    }
};

// API to verify OTP
const verifyOTP = {
    validator: async (req, res, next) => {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });
        next();
    },
    controller: async (req, res) => {
        const { email, otp } = req.body;
        const storedOTP = await client.get(email);
        if (!storedOTP) return res.status(400).json({ message: "OTP expired or invalid" });

        if (storedOTP+"" === otp+"") {
            await client.del(email); // Remove OTP after successful verification
            return res.json({ message: "OTP verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid OTP" });
        }
    }
};

module.exports = { sendEmail, verifyOTP };
