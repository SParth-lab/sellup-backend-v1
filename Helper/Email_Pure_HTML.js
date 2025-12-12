/**
 * PURE HTML/CSS EMAIL TEMPLATES
 * No images, no attachments, no hosting required
 * Works everywhere including Outlook
 */

// Helper function to generate the pure HTML/CSS template
const createPureHtmlTemplate = (heading, name, lastName, otp) => {
    const fullName = lastName ? `${name} ${lastName}` : name;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
<body style="margin:0; padding:0; font-family: 'Segoe UI', Arial, sans-serif; background:#f4f4f4;">

    <!-- Outer Container -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f4f4f4; padding:40px 0;">
        <tr>
            <td align="center">

                <!-- Inner Box -->
                <table width="100%" style="max-width:600px; background:#ffffff; border-radius:10px; padding:40px;" border="0" cellspacing="0" cellpadding="0">

                    <!-- Text-based Logo with VML Fallback for Outlook -->
                    <tr>
                        <td align="center" style="padding-bottom:30px;">
                            <!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" 
                                style="height:60px;width:200px;v-text-anchor:middle;" arcsize="17%" fillcolor="#E50914" stroke="f">
                                <w:anchorlock/>
                                <center style="color:#ffffff;font-family:Arial;font-size:28px;font-weight:bold;">
                                    RENTEL
                                </center>
                            </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!-->
                            <div style="
                                display:inline-block;
                                background:#E50914;
                                color:#ffffff;
                                font-size:28px;
                                font-weight:bold;
                                padding:15px 40px;
                                border-radius:10px;
                                letter-spacing:2px;
                                text-transform:uppercase;
                            ">
                                RENTEL
                            </div>
                            <!--<![endif]-->
                        </td>
                    </tr>

                    <!-- Heading -->
                    <tr>
                        <td align="center" style="font-size:28px; font-weight:600; color:#222; line-height:1.4; padding-bottom:10px;">
                            ${heading}
                        </td>
                    </tr>

                    <!-- Subheading -->
                    <tr>
                        <td align="center" style="font-size:16px; color:#666; padding-bottom:30px;">
                            Hello ${fullName}, here is your verification code:
                        </td>
                    </tr>

                    <!-- OTP Box with VML Fallback -->
                    <tr>
                        <td align="center" style="padding-top:10px; padding-bottom:30px;">
                            <!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" 
                                style="height:80px;width:100%;v-text-anchor:middle;" arcsize="8%" fillcolor="#ffffff" strokecolor="#E50914" strokeweight="2px">
                                <w:anchorlock/>
                                <center style="color:#E50914;font-family:Arial;font-size:38px;font-weight:bold;">
                                    ${otp}
                                </center>
                            </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!-->
                            <div style="
                                background:#ffffff;
                                border:2px solid #E50914;
                                border-radius:10px;
                                padding:25px 0;
                                font-size:38px;
                                font-weight:700;
                                color:#E50914;
                                letter-spacing:8px;
                                text-align:center;
                            ">
                                ${otp}
                            </div>
                            <!--<![endif]-->
                        </td>
                    </tr>

                    <!-- Security Message -->
                    <tr>
                        <td align="center" style="font-size:14px; color:#555; padding-top:10px; line-height:1.6;">
                            🔒 Please make sure you never share this code with anyone.
                        </td>
                    </tr>

                    <!-- Expire Note -->
                    <tr>
                        <td align="center" style="font-size:14px; color:#E50914; padding-top:10px; font-weight:600;">
                            ⏰ This code expires in 5 minutes
                        </td>
                    </tr>

                    <!-- Divider Line -->
                    <tr>
                        <td style="padding-top:40px; padding-bottom:30px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="border-top:2px solid #e5e5e5;"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer Wordmark -->
                    <tr>
                        <td align="center" style="padding-bottom:10px;">
                            <span style="font-size:20px; font-weight:bold; color:#E50914; letter-spacing:1px;">RENTEL</span>
                            <br>
                            <span style="font-size:12px; color:#999; font-style:italic;">Rent Smarter, Live Better</span>
                        </td>
                    </tr>

                    <!-- Footer Text -->
                    <tr>
                        <td align="center" style="color:#777; font-size:13px; padding-top:10px; padding-bottom:20px;">
                            You received this email because you registered on our platform.
                        </td>
                    </tr>

                    <!-- Social Icons (Pure HTML/CSS Badges) -->
                    <tr>
                        <td align="center" style="padding-top:15px; padding-bottom:20px;">
                            <!-- YouTube -->
                            <a href="https://www.youtube.com/" style="text-decoration:none; margin:0 6px; display:inline-block;">
                                <!--[if mso]>
                                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" 
                                    style="height:36px;width:36px;v-text-anchor:middle;" arcsize="50%" fillcolor="#FF0000" stroke="f">
                                    <w:anchorlock/>
                                    <center style="color:#ffffff;font-family:Arial;font-size:16px;font-weight:bold;">
                                        Y
                                    </center>
                                </v:roundrect>
                                <![endif]-->
                                <!--[if !mso]><!-->
                                <span style="
                                    display:inline-block;
                                    width:36px;
                                    height:36px;
                                    line-height:36px;
                                    background:#FF0000;
                                    color:#ffffff;
                                    border-radius:50%;
                                    text-align:center;
                                    font-weight:bold;
                                    font-size:16px;
                                ">Y</span>
                                <!--<![endif]-->
                            </a>

                            <!-- Facebook -->
                            <a href="https://www.facebook.com/profile.php?id=61584278505265" style="text-decoration:none; margin:0 6px; display:inline-block;">
                                <!--[if mso]>
                                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" 
                                    style="height:36px;width:36px;v-text-anchor:middle;" arcsize="50%" fillcolor="#1877F2" stroke="f">
                                    <w:anchorlock/>
                                    <center style="color:#ffffff;font-family:Arial;font-size:16px;font-weight:bold;">
                                        f
                                    </center>
                                </v:roundrect>
                                <![endif]-->
                                <!--[if !mso]><!-->
                                <span style="
                                    display:inline-block;
                                    width:36px;
                                    height:36px;
                                    line-height:36px;
                                    background:#1877F2;
                                    color:#ffffff;
                                    border-radius:50%;
                                    text-align:center;
                                    font-weight:bold;
                                    font-size:16px;
                                ">f</span>
                                <!--<![endif]-->
                            </a>

                            <!-- Instagram -->
                            <a href="https://www.instagram.com/rentel.in/?igsh=bHRtN3JxNzd1ZHNv#" style="text-decoration:none; margin:0 6px; display:inline-block;">
                                <!--[if mso]>
                                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" 
                                    style="height:36px;width:36px;v-text-anchor:middle;" arcsize="50%" fillcolor="#E4405F" stroke="f">
                                    <w:anchorlock/>
                                    <center style="color:#ffffff;font-family:Arial;font-size:16px;font-weight:bold;">
                                        I
                                    </center>
                                </v:roundrect>
                                <![endif]-->
                                <!--[if !mso]><!-->
                                <span style="
                                    display:inline-block;
                                    width:36px;
                                    height:36px;
                                    line-height:36px;
                                    background:#E4405F;
                                    color:#ffffff;
                                    border-radius:50%;
                                    text-align:center;
                                    font-weight:bold;
                                    font-size:16px;
                                ">I</span>
                                <!--<![endif]-->
                            </a>

                            <!-- Threads -->
                            <a href="https://www.threads.com/@rentel.in" style="text-decoration:none; margin:0 6px; display:inline-block;">
                                <!--[if mso]>
                                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" 
                                    style="height:36px;width:36px;v-text-anchor:middle;" arcsize="50%" fillcolor="#000000" stroke="f">
                                    <w:anchorlock/>
                                    <center style="color:#ffffff;font-family:Arial;font-size:16px;font-weight:bold;">
                                        @
                                    </center>
                                </v:roundrect>
                                <![endif]-->
                                <!--[if !mso]><!-->
                                <span style="
                                    display:inline-block;
                                    width:36px;
                                    height:36px;
                                    line-height:36px;
                                    background:#000000;
                                    color:#ffffff;
                                    border-radius:50%;
                                    text-align:center;
                                    font-weight:bold;
                                    font-size:16px;
                                ">@</span>
                                <!--<![endif]-->
                            </a>
                        </td>
                    </tr>

                    <!-- Bottom Links -->
                    <tr>
                        <td align="center" style="padding-top:15px; font-size:12px;">
                            <a href="https://www.rentel.in/privacy-policy" style="color:#E50914; text-decoration:none; font-weight:600;">Privacy Policy</a>
                            <span style="color:#ccc; margin:0 8px;">|</span>
                            <a href="https://www.rentel.in/contact" style="color:#E50914; text-decoration:none; font-weight:600;">Help Center</a>
                        </td>
                    </tr>

                    <!-- Copyright -->
                    <tr>
                        <td align="center" style="padding-top:15px; font-size:12px; color:#999;">
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

// Export all three templates using the pure HTML approach
const changePasswordTemplate = (name, lastName, otp) => {
    return createPureHtmlTemplate('Change Password Verification', name, lastName, otp);
};

const resetPasswordTemplate = (name, lastName, otp) => {
    return createPureHtmlTemplate('Reset Password Verification', name, lastName, otp);
};

const verifyEmailTemplate = (name, otp) => {
    return createPureHtmlTemplate('Login Verification', name, '', otp);
};

module.exports = {
    changePasswordTemplate,
    resetPasswordTemplate,
    verifyEmailTemplate,
};

