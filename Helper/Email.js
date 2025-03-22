require("dotenv").config();
const nodemailer = require("nodemailer");
const client = require('./Redis.js');




// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const createEmailAndSend = async (email, subject, emailTemplate, otp = null) => {
    if (!otp) otp = generateOTP();
    await client.setEx(email, 300, otp);

    // Nodemailer Transporter
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: emailTemplate,
    };
    try {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) return console.log(error);
          console.log("Email sent: " + info.response);
        });
      } catch (error) {
        console.log(error);
      }
}



const changePasswordTemplate = (name, lastName, otp) => {
    return `
 <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Change Password OTP</title>
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
            width: 150px !important;
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
            <img src="https://firebasestorage.googleapis.com/v0/b/sellup-84bb6.firebasestorage.app/o/Group%2026680.png?alt=media&token=f11ce06a-59c4-402b-9a39-0b3259fa6fcf" alt="Rentel Sell Something New">
        </div>
        <div class="content">
            <h2>Password Change Request</h2>
            <p>Dear ${name} ${lastName},</p>
            <p>We received a request to change your password. Use the OTP below to proceed:</p>
            <div class="otp-box">${otp}</div>
            <p>This OTP is valid for <strong>5 minutes</strong>. If you did not request this change, please secure your account immediately.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Rentel Sell Something New. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

    `;
}

const resetPasswordTemplate = (name, lastName, otp) => {
    // HTML OTP Template
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
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
            width: 150px !important;
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
            <img src="https://firebasestorage.googleapis.com/v0/b/sellup-84bb6.firebasestorage.app/o/Group%2026680.png?alt=media&token=f11ce06a-59c4-402b-9a39-0b3259fa6fcf" alt="Rentel Sell Something New">
        </div>
        <div class="content">
            <h2>Reset Your Password</h2>
            <p>Dear ${name} ${lastName},</p>
            <p>We received a request to reset your password. Use the OTP below to proceed:</p>
            <div class="otp-box">${otp}</div>
            <p>This OTP is valid for <strong>5 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Rentel Sell Something New. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

    `
}


module.exports = {
    createEmailAndSend,
    generateOTP,
    changePasswordTemplate,
    resetPasswordTemplate
}