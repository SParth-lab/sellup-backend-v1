const { createEmailAndSend, changePasswordTemplate, generateOTP, resetPasswordTemplate, verifyEmailTemplate } = require("../Helper/Email.js");
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
                : `OTP for Login ${otp} - Verify Your Email`;
        
        try {
            await client.del(email);
            await createEmailAndSend(email, subject, emailTemplate, otp);
            return res.status(200).json({ message: "OTP sent successfully" });
        } catch (error) {
            console.error("❌ Email send failed:", error);
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
