require("dotenv").config();
const nodemailer = require("nodemailer");
const redisClient = require('./Redis.js');




// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const createEmailAndSend = async (email, subject, emailTemplate, otp = null) => {
    if (!otp) otp = generateOTP();

    console.log("🪩🪩🪩 -=-=-=-=-=-= ", otp)
    await redisClient.setEx(email, 300, otp);

    // Nodemailer Transporter
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    console.log("🪩🪩🪩 transporter -=-=-=-=-=-= ", transporter)


    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: emailTemplate,
    };
    console.log("🪩🪩🪩 mailOptions -=-=-=-=-=-= ", mailOptions)

    try {
        transporter.sendMail(mailOptions, (error, info) => {
            console.log("error, info  -=-=-=-=-=-=-=-=-=-=-= ", error, info)
          if (error) return console.log(error);
          console.log("Email sent: " + info.response);
        });
      } catch (error) {
        console.log(error);
      }
}



const OTPTemplate = (otp) => {
    // HTML OTP Template
    return `
 <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; text-align: center; border: 1px solid #ddd; border-radius: 10px;">
     <h2 style="color: #007BFF;">Your OTP Code</h2>
     <p style="font-size: 16px;">Use the OTP below to complete your verification. This OTP is valid for <strong>5 minutes</strong>.</p>
     <div style="font-size: 24px; font-weight: bold; background: #f3f3f3; padding: 10px; border-radius: 5px; display: inline-block; margin: 10px 0;">
         ${otp}
     </div>
     <p>If you didn’t request this, please ignore this email.</p>
     <hr style="margin-top: 20px;">
     <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
 </div>
`;
}

const UserVerificationTemplate = (name, lastName, otp) => {
    // HTML OTP Template
    return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email Address</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 10px 0;
        }
        .header img {
            width: 250px !important;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content h1 {
            color: #333333;
        }
        .content p {
            color: #666666;
        }
        .otp-box {
            font-size: 24px;
            font-weight: bold;
            background: #f3f3f3;
            padding: 10px;
            border-radius: 5px;
            display: inline-block;
            margin: 10px 0;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #aaaaaa;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://descube.in/wp-content/uploads/2023/09/Descube-Logo-01.png" alt="Descube IT Solution">
        </div>
        <div class="content">
            <h2>Email Verification Required</h2>
            <p>Dear ${name} ${lastName},</p>
            <p>Thank you for registering with SellUp. To complete your registration, please use the OTP below:</p>
            <div class="otp-box">${otp}</div>
            <p>This OTP and verification link are valid for the next <strong>5 minutes</strong>.</p>
            <p>If you did not create an account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Descube IT Solution. All rights reserved.</p>
            <p>Descube IT Solution, 641, MBC, Lajamni Chowk, opposite Opera Business center, Shanti Niketan Society, Mota Varachha, Surat, Gujarat 394105</p>
        </div>
    </div>
</body>
</html>`
}


module.exports = {
    createEmailAndSend,
    OTPTemplate,
    generateOTP,
    UserVerificationTemplate
}