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
        from: process.env.SMTP_USER,
        to: email,
        subject: subject,
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
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background:#f5f5f5;">
    
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f5f5f5;">
        <tr>
            <td align="center" style="padding:40px 20px;">
                
                <!-- Main Content Container -->
                <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background:#ffffff; border-radius:8px;">
                    
                    <!-- Logo Section -->
                    <tr>
                        <td align="center" style="padding:40px 20px 30px;">
                            <!-- Outlook VML fallback + HTML logo -->
                            <!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                                href="https://rentel.in"
                                style="height:56px;v-text-anchor:middle;width:220px;" arcsize="10%"
                                strokecolor="#e50914" fillcolor="#e50914">
                                <w:anchorlock/>
                                <center style="color:#ffffff;font-family:Arial;font-size:18px;font-weight:700;">
                                    RENTEL
                                </center>
                            </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!-->
                            <a href="https://rentel.in" style="text-decoration:none;display:inline-block;" title="Rentel" aria-label="Rentel">
                                <div style="display:inline-block;padding:12px 20px;border-radius:8px;background:#e50914;color:#fff;font-weight:700;font-size:20px;font-family:Arial, sans-serif;">
                                    RENTEL
                                </div>
                            </a>
                            <!--<![endif]-->
                            <!-- Fallback text branding -->
                            <div style="font-family:Arial;font-size:12px;color:#111;font-weight:bold;margin-top:8px;">
                                RENTEL
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Heading -->
                    <tr>
                        <td align="center" style="padding:0 20px 10px; font-size:24px; font-weight:700; color:#222;">
                            Change Password Verification
                        </td>
                    </tr>
                    
                    <!-- Subheading -->
                    <tr>
                        <td align="center" style="padding:0 20px 30px; font-size:15px; color:#666; line-height:1.5;">
                            Hello ${fullName}, here is your verification code:
                        </td>
                    </tr>
                    
                    <!-- OTP Code -->
                    <tr>
                        <td align="center" style="padding:0 20px 30px;">
                            <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="border:3px solid #e50914; border-radius:8px; padding:20px 40px; background:#fff;">
                                        <div style="font-size:36px; font-weight:700; color:#e50914; letter-spacing:6px; font-family:Courier New, monospace;">
                                            ${otp}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Security Message -->
                    <tr>
                        <td align="center" style="padding:0 20px 10px; font-size:14px; color:#555;">
                            🔒 Please never share this code with anyone.
                        </td>
                    </tr>
                    
                    <!-- Expiry Notice -->
                    <tr>
                        <td align="center" style="padding:0 20px 40px; font-size:13px; color:#e50914; font-weight:600;">
                            ⏰ This code expires in 5 minutes
                        </td>
                    </tr>
                    
                    <!-- Divider -->
                    <tr>
                        <td style="padding:0 20px;">
                            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="border-top:1px solid #e0e0e0;"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer Branding -->
                    <tr>
                        <td align="center" style="padding:30px 20px 10px;">
                            <div style="font-size:18px; font-weight:700; color:#e50914; letter-spacing:1px;">RENTEL</div>
                            <div style="font-size:12px; color:#999; margin-top:5px; font-style:italic;">Rent Smarter, Live Better</div>
                        </td>
                    </tr>
                    
                    <!-- Footer Text -->
                    <tr>
                        <td align="center" style="padding:10px 20px 20px; font-size:13px; color:#777;">
                            You received this email because you registered on our platform.
                        </td>
                    </tr>
                    
                    <!-- Social Icons -->
                    <tr>
                        <td align="center" style="padding:20px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding:0 6px;">
                                        <a href="https://www.youtube.com/" style="text-decoration:none;" title="YouTube" aria-label="YouTube">
                                            <div style="width:36px;height:36px;border-radius:50%;background:#FF0000;color:#fff;font-weight:700;text-align:center;line-height:36px;font-size:14px;">
                                                ▶
                                            </div>
                                        </a>
                                    </td>
                                    <td style="padding:0 6px;">
                                        <a href="https://www.facebook.com/profile.php?id=61584278505265" style="text-decoration:none;" title="Facebook" aria-label="Facebook">
                                            <div style="width:36px;height:36px;border-radius:50%;background:#1877F2;color:#fff;font-weight:700;text-align:center;line-height:36px;font-size:14px;">
                                                f
                                            </div>
                                        </a>
                                    </td>
                                    <td style="padding:0 6px;">
                                        <a href="https://www.instagram.com/rentel.in/?igsh=bHRtN3JxNzd1ZHNv#" style="text-decoration:none;" title="Instagram" aria-label="Instagram">
                                            <div style="width:36px;height:36px;border-radius:50%;background:#C13584;color:#fff;font-weight:700;text-align:center;line-height:36px;font-size:14px;">
                                                ⓘ
                                            </div>
                                        </a>
                                    </td>
                                    <td style="padding:0 6px;">
                                        <a href="https://www.threads.com/@rentel.in" style="text-decoration:none;" title="Threads" aria-label="Threads">
                                            <div style="width:36px;height:36px;border-radius:50%;background:#000;color:#fff;font-weight:700;text-align:center;line-height:36px;font-size:14px;">
                                                @
                                            </div>
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Links -->
                    <tr>
                        <td align="center" style="padding:10px 20px; font-size:12px;">
                            <a href="https://www.rentel.in/privacy-policy" style="color:#e50914; text-decoration:none; font-weight:600;">Privacy Policy</a>
                            <span style="color:#ccc; margin:0 10px;">|</span>
                            <a href="https://www.rentel.in/contact" style="color:#e50914; text-decoration:none; font-weight:600;">Help Center</a>
                        </td>
                    </tr>
                    
                    <!-- Copyright -->
                    <tr>
                        <td align="center" style="padding:10px 20px 40px; font-size:12px; color:#999;">
                            © 2025 Rentel. All Rights Reserved.
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
        .replace('Change Password Verification', 'Reset Password Verification');
};

const verifyEmailTemplate = (name, otp) => {
    return changePasswordTemplate(name, '', otp)
        .replace('<title>Change Password - Rentel</title>', '<title>Verify Email - Rentel</title>')
        .replace('Change Password Verification', 'Email Verification')
        .replace(`Hello ${name} ,`, `Hello ${name},`);
};

module.exports = {
    createEmailAndSend,
    generateOTP,
    changePasswordTemplate,
    resetPasswordTemplate,
    verifyEmailTemplate,
    saveDebugEmail,
};

