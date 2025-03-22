const { createEmailAndSend, changePasswordTemplate, generateOTP, resetPasswordTemplate } = require("../Helper/Email.js");
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
        const { email, isResetPassword=false } = req.body;
        const user = await User.findOne({email, isDeleted: false, isActive: true}).lean();
        if (!user) return res.status(400).json({ message: "User not found or not active , please check your email" });

        const otp = generateOTP();
        const emailTemplate = isResetPassword ? resetPasswordTemplate(user.name, user.lastName, otp) : changePasswordTemplate(user.name, user.lastName, otp);
        const subject = isResetPassword ? "Reset Password OTP" : "Password Change Request";
        try {
            await client.del(email);
            await createEmailAndSend(email, subject, emailTemplate, otp);
            // here delete all old otp from redis
            return res.status(200).json({ message: "OTP sent successfully" });
        } catch (error) {
            return res.status(500).json({ message: "Email failed to send", error });
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
