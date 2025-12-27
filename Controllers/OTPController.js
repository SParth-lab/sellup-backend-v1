const { generateOTP } = require("../Helper/Email.js");
const { createAuditContext } = require("../Helper/AuditService.js");
const client = require("../Helper/Redis.js");
const { sendOtpViaWhatsapp } = require("../Helper/SendOTP.js");
const User = require("../Models/User.js");

// API to send OTP
const viaWhatsapp = {
    validator: async (req, res, next) => {
        const { phoneNumber, isWhatsapp, isFrom = "login" } = req.body;
        if (!phoneNumber) return res.status(400).json({ message: "Phone number is required" });
        next();
    },
    controller: async (req, res) => {
        const { phoneNumber, isWhatsapp = false, isFrom = "login" } = req.body;

        // Create audit context with request information
        const auditContext = createAuditContext({
            triggeredBy: req.user?.id || req.user?._id || 'anonymous',
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
            purpose: isFrom === 'login' ? 'login_verification' : 'phone_verification'
        });

        // const user = await User.findOne({ phoneNumber, isDeleted: false, isActive: true }).lean();
        // if (!user) return res.status(400).json({ message: "User not found or not active , please check your phone number" });
        // if (user.isPhoneVerified) return res.status(400).json({ message: "Phone number already verified" });

        const otp = generateOTP();
        await client.del(phoneNumber);
        
        try {
            // Pass audit context to sendOtpViaWhatsapp
            const data = await sendOtpViaWhatsapp(phoneNumber, otp, auditContext);
            
            if (data.status === "success") {
                await client.setEx(phoneNumber, 600, otp);
                return res.status(200).json({ message: "OTP sent successfully" });
            }
            return res.status(400).json({ message: "Failed to send OTP" });
        } catch (err) {
            console.error(err);
            // Audit is already logged in sendOtpViaWhatsapp for failures
            return res.status(500).json({ message: "Failed to send OTP", error: err.message });
        }
    }
};


const verifyOTP = {
    validator: async (req, res, next) => {
        const { phoneNumber, otp } = req.body;
        if (!phoneNumber || !otp) return res.status(400).json({ message: "Phone number and OTP are required" });
        next();
    },
    controller: async (req, res) => {
        const { phoneNumber, otp } = req.body;
        const storedOTP = await client.get(phoneNumber);
        if (!storedOTP) return res.status(400).json({ message: "OTP expired" });
        if (storedOTP !== otp) return res.status(400).json({ message: "Invalid OTP" });

        // const user = await User.findOne({ phoneNumber, isDeleted: false, isActive: true }).lean();
        // if (!user) return res.status(400).json({ message: "User not found or not active , please check your phone number" });
        // if (user.isPhoneVerified) return res.status(400).json({ message: "Phone number already verified" });

        // if (user) {
            await client.del(phoneNumber);
            // const updatedUser = await User.updateOne({ phoneNumber }, { isPhoneVerified: true }).lean();
            return res.status(200).json({ message: "OTP verified successfully" });
        // }
        // return res.status(400).json({ message: "User not found or not active , please check your phone number" });
    }
}

module.exports = { viaWhatsapp, verifyOTP };
