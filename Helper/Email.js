require("dotenv").config();
const nodemailer = require("nodemailer");
const client = require("./Redis.js");

// Generate OTP
const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

const createEmailAndSend = async (email, subject, emailTemplate, otp = null) => {
    if (!otp) otp = generateOTP();
    await client.setEx(email, 300, otp);

    // Plain text version of the email
    const plainText = `Dear customer, ${otp} is your one time password (OTP), Please do not share the OTP with others. Regards, Team Rentel`;

    // Nodemailer Transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: `Rentel <${process.env.SMTP_USER}>`,
        to: email,
        subject: subject,
        text: plainText,
        html: emailTemplate,
    };

    try {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("❌ Email send error:", error);
                return;
            }
            console.log("✅ Email sent successfully:", info.response);
        });
    } catch (error) {
        console.error("❌ Email send exception:", error);
        throw error;
    }
};

// Base email template with configurable heading
const baseEmailTemplate = (heading, otp) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 10px;">
        <tr>
            <td align="center">

                <!-- Main Container -->
                <table width="100%" cellpadding="0" cellspacing="0"
                    style="max-width:600px;background:#ffffff;border-radius:10px;padding:30px;">

                    <!-- Top Logo -->
                    <tr>
                        <td align="center" style="padding-bottom:20px;">
                            <img src="https://rentel.in/blog/wp-content/uploads/2025/12/Rentel-05.png" width="60"
                                style="display:block;height:auto;margin:0 auto;" />
                        </td>
                    </tr>

                    <!-- Heading -->
                    <tr>
                        <td align="center" style="font-size:24px;font-weight:bold;color:#222;line-height:1.4;">
                            ${heading}
                        </td>
                    </tr>

                    <!-- OTP -->
                    <tr>
                        <td align="center" style="padding:25px 0;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="border:1px solid #ddd;border-radius:12px;
                           padding:20px;font-size:34px;font-weight:700;
                           color:#e50914;">
                                        ${otp}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Notes -->
                    <tr>
                        <td align="center" style="font-size:14px;color:#555;">
                            Please make sure you never share this code with anyone.
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="font-size:14px;color:#555;padding-top:8px;">
                            <strong>Note:</strong> The code will expire in 5 minutes.
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding-top:30px;">
                            <hr style="border:0;border-top:1px solid #e5e5e5;" />
                        </td>
                    </tr>

                    <!-- Bottom Logo -->
                    <tr>
                        <td align="center" style="padding:20px 0;">
                            <img src="https://rentel.in/blog/wp-content/uploads/2025/12/Rentel-06-scaled.png"
                                width="140" style="display:block;height:auto;margin:0 auto;" />
                        </td>
                    </tr>

                    <!-- Footer Text -->
                    <tr>
                        <td align="center" style="font-size:13px;color:#777;line-height:1.5;">
                            You have received this email because you registered on our platform.
                        </td>
                    </tr>

                    <!-- Social Icons -->
                    <tr>
                        <td align="center" style="padding-top:15px; font-size:0;">

                            <a href="https://www.facebook.com/profile.php?id=61584278505265"
                                style="margin:0 3px; display:inline-block; text-decoration:none;">
                                <img src="https://ci3.googleusercontent.com/meips/ADKq_NZ9w3VNimD2su1Wk1oqCYBPo30cIO7UcQFwXBu8eRgHA2FMdJGiHWj2qsi1NrJ0QytZsveT3PZfyzVyMdyk5TyHcdzWii2S4Soi0nTq9UPrrbc9Q1HiOQM_CCU--bhyATeWOy3BejMGKA-_nFG8IrPJ4X84t2vX9KQBDamvrFcP8VGBSjYRRvVz5g4=s0-d-e1-ft#https://cdn.braze.eu/appboy/communication/assets/image_assets/images/682c73f049ba220086fb6cd2/original.png?1747743728" alt="Facebook" width="24" height="24" style="display:block" />
                            </a>

                            <a href="https://www.instagram.com/rentel.in/?igsh=bHRtN3JxNzd1ZHNv#"
                                style="margin:0 3px; display:inline-block; text-decoration:none;">
                                <img src="https://ci3.googleusercontent.com/meips/ADKq_NYaVKKPiPo4NQ3FLG-qo4aw9YVmKuJc1HuP9oAgrHIyxnglcy-uL2zsxlVFV12HfBj40UXaDj3OJH9HnQ8Rb0NV_P6VkFMdIRwK86qCtOgXm0xIAsQGeIwDeJqQQ52mk-kAit5ByKQaG58-Pww16XKUQXklVzLhaSHFEF2bAmXR4CKNpRMmqnUcCPM=s0-d-e1-ft#https://cdn.braze.eu/appboy/communication/assets/image_assets/images/682c73f05a0c32050bd2f4cc/original.png?1747743728" alt="Instagram" width="24" height="24" style="display:block" />
                            </a>

                        </td>
                    </tr>


                    <!-- Links -->
                    <tr>
                        <td align="center" style="font-size:12px;padding-top:10px;">
                            <a href="https://www.rentel.in/privacy-policy"
                                style="color:#6c63ff;text-decoration:none;">Privacy policy</a> |
                            <a href="https://www.rentel.in/contact" style="color:#6c63ff;text-decoration:none;">Help
                                center</a>
                        </td>
                    </tr>

                    <!-- Copyright -->
                    <tr>
                        <td align="center" style="font-size:12px;color:#999;padding-top:12px;">
                            © 2025 Rentel | All Rights Reserved.
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>`;
};

// Template for Change Password emails
const changePasswordTemplate = (name, lastName, otp) => {
    return baseEmailTemplate("Here is your Change Password Verification Code:", otp);
};

// Template for Reset Password emails
const resetPasswordTemplate = (name, lastName, otp) => {
    return baseEmailTemplate("Here is your Reset Password Verification Code:", otp);
};

// Template for Verify Email / Login emails
const verifyEmailTemplate = (name, otp) => {
    return baseEmailTemplate("Here is your Login Verification Code:", otp);
};

module.exports = {
    createEmailAndSend,
    generateOTP,
    changePasswordTemplate,
    resetPasswordTemplate,
    verifyEmailTemplate,
};

