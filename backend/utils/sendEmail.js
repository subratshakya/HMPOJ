const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    let transporter;

    // Use real credentials if provided in .env
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: "gmail", // Can be configured to other services
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    } else {
        // Generate a test SMTP service account from ethereal.email for local development
        console.log("Notice: No EMAIL_USER and EMAIL_PASS set in .env. Using Ethereal test email.");
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    const mailOptions = {
        from: `"HMP OJ" <${process.env.EMAIL_USER || "test@hmpoj.local"}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);

    // If we used a test account, log the URL to view the fake email in the browser
    let previewUrl = null;
    if (!process.env.EMAIL_USER) {
        previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("-----------------------------------------");
        console.log("Email sent! Preview URL: %s", previewUrl);
        console.log("-----------------------------------------");
    }

    return previewUrl;
};

module.exports = sendEmail;
