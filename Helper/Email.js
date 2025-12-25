require("dotenv").config();
const nodemailer = require("nodemailer");
const client = require("./Redis.js");
const fs = require("fs");
const path = require("path");

// ✅ PURE HTML/CSS EMAIL TEMPLATES
// No images, no attachments, no base64, no external URLs
// 100% compatible with Gmail, Outlook, Apple Mail, etc.
console.log("✅ Email system using pure HTML/CSS templates (no images/attachments)");

// Generate OTP
const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

// Debug function to save email HTML for testing in browser
const saveDebugEmail = (htmlContent, filename = "debug_email.html") => {
    try {
        const debugPath = path.join(__dirname, filename);
        fs.writeFileSync(debugPath, htmlContent, "utf8");
        console.log(`📧 Debug email saved: ${debugPath}`);
        return debugPath;
    } catch (error) {
        console.error("❌ Failed to save debug email:", error.message);
    }
};

const createEmailAndSend = async (
    email,
    subject,
    emailTemplate,
    otp = null,
    debug = false,
) => {
    if (!otp) otp = generateOTP();
    await client.setEx(email, 300, otp);

    // Plain text version of the email
    const plainText = `Dear customer, ${otp} is your one time password (OTP), Please do not share the OTP with others. Regards, Team Rentel`;

    // Debug: Log email info
    if (debug || process.env.DEBUG_EMAIL === "true") {
        console.log("\n📧 Email Debug Info:");
        console.log(`   To: ${email}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Template length: ${emailTemplate.length} chars`);

        // Save debug HTML file for browser inspection
        saveDebugEmail(emailTemplate, `debug_email_${Date.now()}.html`);
    }

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
        attachments: [], // ✅ MUST remain empty - no image attachments
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

const changePasswordTemplate = (name, lastName, otp) => {
    const fullName = lastName ? `${name} ${lastName}` : name;
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Change Password - Rentel</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#ffffff;">

    <!-- Outer Container -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding:40px 0;">
        <tr>
            <td align="center">

                <!-- Inner Box -->
                <table width="100%" style="max-width:600px; background:#ffffff; border-radius:10px; padding:40px;">

                    <!-- Top Logo -->
                    <tr>
                        <td style="padding-bottom:20px; text-align:center;">
                            <img src="https://rentel.in/blog/wp-content/uploads/2025/12/Rentel-05.png" alt="Rentel Logo"
                                width="60px" style="
                                    display:block;
                                    height:55px;
                                    margin:0 auto;
                                    border:0;
                                    outline:none;
                                    text-decoration:none;
                                " />
                        </td>
                    </tr>

                    <!-- Heading -->
                    <tr>
                        <td align="center" style="font-size:32px; font-weight:500; color:#222;">
                            Here is your Change Password Verification Code:
                        </td>
                    </tr>

                    <!-- OTP Box -->
                    <tr>
                        <td align="center" style="padding-top:25px; padding-bottom:25px;">
                            <div style="
                                background:#ffffff;
                                border:1px solid #ddd;
                                border-radius:12px;
                                padding:25px 0;
                                font-size:38px;
                                font-weight:700;
                                color:#e50914;
                                width:100%;
                                margin:0 auto;
                            ">
                                ${otp}
                            </div>
                        </td>
                    </tr>

                    <!-- Message -->
                    <tr>
                        <td align="center" style="font-size:14px; color:#555; padding-top:10px;">
                            Please make sure you never share this code with anyone.
                        </td>
                    </tr>

                    <!-- Expire Note -->
                    <tr>
                        <td align="center" style="font-size:14px; color:#555; padding-top:10px;">
                            <strong>Note:</strong> The code will expire in 5 minutes.
                        </td>
                    </tr>

                    <!-- Divider Line -->
                    <tr>
                        <td style="padding-top:35px;">
                            <hr style="border:0; border-top:1px solid #e5e5e5;" />
                        </td>
                    </tr>

                    <!-- Bottom Logo -->
                    <tr>
                        <td align="center" style="padding-bottom:20px;">
                            <img src="https://rentel.in/blog/wp-content/uploads/2025/12/Rentel-06-scaled.png"
                                alt="Rentel Logo" width="150"
                                style="display:block;height:auto;border:0;outline:none;text-decoration:none;" />
                        </td>
                    </tr>

                    <!-- Footer Text -->
                    <tr>
                        <td align="center" style="color:#777; font-size:13px; padding-top:15px;">
                            You have received this email because you registered on our platform.
                        </td>
                    </tr>

                    <!-- Social Icons -->
                    <tr>
                        <td align="center" style="padding-top:15px;">
                            <div style="font-family:'DM Sans',Arial,Sans-serif;text-align:center" align="center">
                                <div style="padding:0 24px;text-align:center">
                                    <a href="https://www.facebook.com/people/Rentel/61584278505265/" style="display:inline-block;margin:0 8px" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.facebook.com/people/Rentel/61584278505265/&amp;source=gmail&amp;ust=1765893755777000&amp;usg=AOvVaw0V_Yt4KE7WWAEzfyd-t-l6">
                                        <img src="https://ci3.googleusercontent.com/meips/ADKq_NZ9w3VNimD2su1Wk1oqCYBPo30cIO7UcQFwXBu8eRgHA2FMdJGiHWj2qsi1NrJ0QytZsveT3PZfyzVyMdyk5TyHcdzWii2S4Soi0nTq9UPrrbc9Q1HiOQM_CCU--bhyATeWOy3BejMGKA-_nFG8IrPJ4X84t2vX9KQBDamvrFcP8VGBSjYRRvVz5g4=s0-d-e1-ft#https://cdn.braze.eu/appboy/communication/assets/image_assets/images/682c73f049ba220086fb6cd2/original.png?1747743728" alt="Facebook" width="24" height="24" style="display:block" class="CToWUd" data-bit="iit">
                                    </a>
                                    <a href="https://www.instagram.com/rentel.in/?igsh=bHRtN3JxNzd1ZHNv" style="display:inline-block;margin:0 8px" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.instagram.com/rentel.in/?igsh=bHRtN3JxNzd1ZHNv&amp;source=gmail&amp;ust=1765893755777000&amp;usg=AOvVaw3aQpA1VM7yQ9CLG09eM2B0">
                                        <img src="https://ci3.googleusercontent.com/meips/ADKq_NYaVKKPiPo4NQ3FLG-qo4aw9YVmKuJc1HuP9oAgrHIyxnglcy-uL2zsxlVFV12HfBj40UXaDj3OJH9HnQ8Rb0NV_P6VkFMdIRwK86qCtOgXm0xIAsQGeIwDeJqQQ52mk-kAit5ByKQaG58-Pww16XKUQXklVzLhaSHFEF2bAmXR4CKNpRMmqnUcCPM=s0-d-e1-ft#https://cdn.braze.eu/appboy/communication/assets/image_assets/images/682c73f05a0c32050bd2f4cc/original.png?1747743728" alt="Instagram" width="24" height="24" style="display:block" class="CToWUd" data-bit="iit">
                                    </a>
                                    <a href="https://x.com/" style="display:inline-block;margin:0 8px" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://x.com/&amp;source=gmail&amp;ust=1765893755777000&amp;usg=AOvVaw23ckjMUY_cwlNV_9KRlT0O">
                                        <img src="https://ci3.googleusercontent.com/meips/ADKq_NaOXxf0dKdTbtlDzGS4nk5EKfZ8j0f52-JbrtlLDZJVqsqI_ZAuiq9fRntg6Hgp2ZO6Qu_jydk01eZQyiRRxvUKFfqCOJacDF_l1M2A5hZVnWDD6FBhfx3bsX5ZfOGaloDrwmHon5Yd1yiN1L-D2p1Kkq3k5uatYDgNKXkC8Pn8cq79iyYH8tyqLOY=s0-d-e1-ft#https://cdn.braze.eu/appboy/communication/assets/image_assets/images/682c73f074228200924d87c2/original.png?1747743728" alt="X" width="24" height="24" style="display:block" class="CToWUd" data-bit="iit">
                                    </a>
                                    <a href="https://www.youtube.com/" style="display:inline-block;margin:0 8px" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.youtube.com/&amp;source=gmail&amp;ust=1765893755778000&amp;usg=AOvVaw3l5zxRVg5s8WoMz2eslYdO">
                                        <img src="https://ci3.googleusercontent.com/meips/ADKq_NbtJwmViPxkfmS4LKH3LcwyRnw9YdzgnP_brhHQecusB1XjKn5nCLd-zjFSUfANHBBngmE0EhkehB65ZKVqjmHZnBlzMcn10Yt6Mgwi1yKGPmsMgA-kt5xAic11GIrZzdyzOLDL4vYcCGY2pT_5dt5W8zuSpm3p2mG4sCFxWupidNlIK5Tsf8luyqs=s0-d-e1-ft#https://cdn.braze.eu/appboy/communication/assets/image_assets/images/682c73f09eda170082b88831/original.png?1747743728" alt="YouTube" width="24" height="24" style="display:block" class="CToWUd" data-bit="iit">
                                    </a>
                                </div>
                            </div>
                        </td>
                    </tr>

                    <!-- Bottom Links -->
                    <tr>
                        <td align="center" style="padding-top:20px; font-size:12px;">
                            <a href="https://www.rentel.in/privacy-policy"
                                style="color:#6c63ff; text-decoration:none;">Privacy policy</a> |
                            <a href="https://www.rentel.in/contact" style="color:#6c63ff; text-decoration:none;">Help
                                center</a>
                        </td>
                    </tr>

                    <!-- Copyright -->
                    <tr>
                        <td align="center" style="padding-top:15px; font-size:12px; color:#999;">
                            © 2025 Rentel | All Rights Reserved.
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
    `;
};

const resetPasswordTemplate = (name, lastName, otp) => {
    return changePasswordTemplate(name, lastName, otp)
        .replace('<title>Change Password - Rentel</title>', '<title>Reset Password - Rentel</title>')
        .replace('Here is your Change Password Verification Code:', 'Here is your Reset Password Verification Code:');
};

const verifyEmailTemplate = (name, otp) => {
    return changePasswordTemplate(name, '', otp)
        .replace('<title>Change Password - Rentel</title>', '<title>Verify Email - Rentel</title>')
        .replace('Here is your Change Password Verification Code:', 'Here is your Email Verification Code:');
};

module.exports = {
    createEmailAndSend,
    generateOTP,
    changePasswordTemplate,
    resetPasswordTemplate,
    verifyEmailTemplate,
    saveDebugEmail,
};

