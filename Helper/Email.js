require("dotenv").config();
const nodemailer = require("nodemailer");
const client = require("./Redis.js");
const fs = require("fs");
const path = require("path");

// Load and convert images to base64
// NOTE: Base64 data URIs work in most modern email clients but some (Outlook, Gmail mobile)
// may block them or show broken images. This is a client-side limitation, not a code issue.
const imagePath = path.join(__dirname, "../imges");

let topLogo, bottomLogo, youtubeIcon, facebookIcon, instagramIcon, threadsIcon;

try {
    topLogo = fs.readFileSync(path.join(imagePath, "top_logo.png")).toString("base64");
    bottomLogo = fs.readFileSync(path.join(imagePath, "bottom_logo.png")).toString("base64");
    youtubeIcon = fs.readFileSync(path.join(imagePath, "youtube.png")).toString("base64");
    facebookIcon = fs.readFileSync(path.join(imagePath, "facebook.png")).toString("base64");
    instagramIcon = fs.readFileSync(path.join(imagePath, "Instagram.png")).toString("base64");
    threadsIcon = fs.readFileSync(path.join(imagePath, "threads.png")).toString("base64");

    // Debug logs to verify base64 encoding
    console.log("✅ Email images loaded successfully:");
    console.log(`   - topLogo: ${topLogo.length} chars`);
    console.log(`   - bottomLogo: ${bottomLogo.length} chars`);
    console.log(`   - youtubeIcon: ${youtubeIcon.length} chars`);
    console.log(`   - facebookIcon: ${facebookIcon.length} chars`);
    console.log(`   - instagramIcon: ${instagramIcon.length} chars`);
    console.log(`   - threadsIcon: ${threadsIcon.length} chars`);
} catch (error) {
    console.error("❌ Error loading email images:", error.message);
    console.error("   Images will not display in emails. Check the 'imges' folder path.");
    // Set empty strings as fallback
    topLogo = bottomLogo = youtubeIcon = facebookIcon = instagramIcon = threadsIcon = "";
}

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

    // Debug: Validate base64 images are in the template
    if (debug || process.env.DEBUG_EMAIL === "true") {
        console.log("\n📧 Email Debug Info:");
        console.log(`   To: ${email}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Template length: ${emailTemplate.length} chars`);
        console.log(`   Contains topLogo: ${emailTemplate.includes("data:image/png;base64")}`);
        console.log(`   Base64 images count: ${(emailTemplate.match(/data:image\/png;base64/g) || []).length}`);
        
        // Save debug HTML file for browser inspection
        saveDebugEmail(emailTemplate, `debug_email_${Date.now()}.html`);
    }

    // Nodemailer Transporter
    // For Gmail
    // const transporter = nodemailer.createTransport({
    //     service: "gmail",
    //     auth: {
    //         user: process.env.EMAIL_USER,
    //         pass: process.env.EMAIL_PASS,
    //     },
    // });

    // For Hostinger
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
        from: process.env.SMTP_USER,
        to: email,
        subject: subject,
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

const changePasswordTemplate = (name, lastName, otp) => {
    return `
 
<!DOCTYPE html>
<html lang="en">

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
                            <img src="data:image/png;base64,${topLogo}" alt="Rentel Logo" style="width:auto; height:55px;" />
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
                        <td align="center" style="padding-top:20px;">
                            <img src="data:image/png;base64,${bottomLogo}" alt="Rentel" style="max-width:180px; height:auto;" />
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
                            <a href="https://www.youtube.com/" style="margin:0 8px; display:inline-block;">
                                <img src="data:image/png;base64,${youtubeIcon}" alt="YouTube" style="width:32px; height:32px;" />
                            </a>
                            <a href="https://www.facebook.com/profile.php?id=61584278505265"
                                style="margin:0 8px; display:inline-block;">
                                <img src="data:image/png;base64,${facebookIcon}" alt="Facebook" style="width:32px; height:32px;" />
                            </a>
                            <a href="https://www.instagram.com/rentel.in/?igsh=bHRtN3JxNzd1ZHNv#"
                                style="margin:0 8px; display:inline-block;">
                                <img src="data:image/png;base64,${instagramIcon}" alt="Instagram" style="width:32px; height:32px;" />
                            </a>
                            <a href="https://www.threads.com/@rentel.in" style="margin:0 8px; display:inline-block;">
                                <img src="data:image/png;base64,${threadsIcon}" alt="Threads" style="width:32px; height:32px;" />
                            </a>
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
    // HTML OTP Template
    return `
    
<!DOCTYPE html>
<html lang="en">

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
                            <img src="data:image/png;base64,${topLogo}" alt="Rentel Logo" style="width:auto; height:55px;" />
                        </td>
                    </tr>
                    <!-- Heading -->
                    <tr>
                        <td align="center" style="font-size:32px; font-weight:500; color:#222;">
                            Here is your Reset Password Verification Code:
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
                        <td align="center" style="padding-top:20px;">
                            <img src="data:image/png;base64,${bottomLogo}" alt="Rentel" style="max-width:180px; height:auto;" />
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
                            <a href="https://www.youtube.com/" style="margin:0 8px; display:inline-block;">
                                <img src="data:image/png;base64,${youtubeIcon}" alt="YouTube" style="width:32px; height:32px;" />
                            </a>
                            <a href="https://www.facebook.com/profile.php?id=61584278505265"
                                style="margin:0 8px; display:inline-block;">
                                <img src="data:image/png;base64,${facebookIcon}" alt="Facebook" style="width:32px; height:32px;" />
                            </a>
                            <a href="https://www.instagram.com/rentel.in/?igsh=bHRtN3JxNzd1ZHNv#"
                                style="margin:0 8px; display:inline-block;">
                                <img src="data:image/png;base64,${instagramIcon}" alt="Instagram" style="width:32px; height:32px;" />
                            </a>
                            <a href="https://www.threads.com/@rentel.in" style="margin:0 8px; display:inline-block;">
                                <img src="data:image/png;base64,${threadsIcon}" alt="Threads" style="width:32px; height:32px;" />
                            </a>
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

const verifyEmailTemplate = (name, otp) => {
    return `
    
<!DOCTYPE html>
<html lang="en">

<body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#ffffff;">

    <!-- Outer Container -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding:40px 0;">
        <tr></tr>
            <td align="center">

                <!-- Inner Box -->
                <table width="100%" style="max-width:600px; background:#ffffff; border-radius:10px; padding:40px;">

                    <!-- Top Logo -->
                    <tr>
                        <td style="padding-bottom:20px; text-align:center;">
                            <img src="data:image/png;base64,${topLogo}" alt="Rentel Logo" style="width:auto; height:55px;" />
                        </td>
                    </tr>
                    <!-- Heading -->
                    <tr>
                        <td align="center" style="font-size:31px; font-weight:500; color:#222;">
                            Here is your Login Verification Code:
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
                        <td align="center" style="padding-top:20px;">
                            <img src="data:image/png;base64,${bottomLogo}" alt="Rentel" style="max-width:180px; height:auto;" />
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
                            <a href="https://www.youtube.com/" style="margin:0 8px; display:inline-block;">
                                <img src="data:image/png;base64,${youtubeIcon}" alt="YouTube" style="width:32px; height:32px;" />
                            </a>
                            <a href="https://www.facebook.com/profile.php?id=61584278505265"
                                style="margin:0 8px; display:inline-block;">
                                <img src="data:image/png;base64,${facebookIcon}" alt="Facebook" style="width:32px; height:32px;" />
                            </a>
                            <a href="https://www.instagram.com/rentel.in/?igsh=bHRtN3JxNzd1ZHNv#"
                                style="margin:0 8px; display:inline-block;">
                                <img src="data:image/png;base64,${instagramIcon}" alt="Instagram" style="width:32px; height:32px;" />
                            </a>
                            <a href="https://www.threads.com/@rentel.in" style="margin:0 8px; display:inline-block;">
                                <img src="data:image/png;base64,${threadsIcon}" alt="Threads" style="width:32px; height:32px;" />
                            </a>
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

module.exports = {
    createEmailAndSend,
    generateOTP,
    changePasswordTemplate,
    resetPasswordTemplate,
    verifyEmailTemplate,
    saveDebugEmail,
};
