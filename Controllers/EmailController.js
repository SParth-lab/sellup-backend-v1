const { createEmailAndSend, OTPTemplate, generateOTP } = require("../Helper/Email.js");
const redis = require("redis");

// Connect to Redis
const client = redis.createClient();

client.connect().catch(console.error);
// API to send OTP
const sendEmail = {
    validator: async (req, res, next) => {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });
        next();
    },
    controller: async (req, res) => {
        const { email } = req.body;
        const otp = generateOTP();
        const emailTemplate = OTPTemplate(otp);
        const subject = "Your OTP Code";
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
