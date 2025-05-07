const nodemailer = require('nodemailer');

/**
 * EMAIL SERVICE DEPLOYMENT NOTES:
 * 
 * 1. Environment Variables Required:
 *    - EMAIL_USER: Your Gmail address (e.g., your-store@gmail.com)
 *                  (DO NOT use student account (ex 522k0002@tdtu.edu.vn))
 *    - EMAIL_PASSWORD: Your Gmail App Password (not your regular Gmail password)
 * 
 * 2. Gmail Setup Required:
 *    a. Enable 2-Step Verification:
 *       - Go to Google Account > Security > 2-Step Verification
 *    b. Create App Password:
 *       - Go to Google Account > Security > App passwords
 *       - Select "Mail" and "Other (Custom name)"
 *       - Use this password in EMAIL_PASSWORD
 * 
 * 3. Security Notes:
 *    - Never commit .env file to git
 *    - Use a dedicated Gmail account for your application
 *    - Regularly rotate your App Password
 *    - Monitor email sending limits (Gmail: 500 emails/day for free)
 * 
 * 4. Production Checklist:
 *    - Configure EMAIL_USER and EMAIL_PASSWORD
 *    - Test email sending before going live
 *    - Monitor email delivery rates
 * 
 * 5. Common Issues:
 *    - "Invalid login": Check if App Password is correct
 *    - "Message not sent": Check Gmail sending limits
 *    - "Connection refused": Check if port 587 is open
 */

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Welcome to Our Store - Your Account Information',
      html: `
        <h2>Welcome to Our Store!</h2>
        <p>Dear ${user.fullName},</p>
        <p>Thank you for creating an account with Our Store!</p>
        <p>Here are your account details:</p>
        <ul>
          <li>Email: ${user.email}</li>
          <li>Temporary Password: ${user.password}</li>
        </ul>
        <p>For security reasons, please change your password when you first log in.<br>
        You can do this by going to your Profile Settings after logging in.</p>
        <p>If you didn't create this account, please contact our support team immediately.</p>
        <p>Best regards,<br>The Store Team</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error.message);
    return false;
  }
};

const sendRecoveryEmail = async ({ email, fullName, tempPassword }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Recovery - Your Temporary Password',
      html: `
        <h2>Password Recovery</h2>
        <p>Dear ${fullName},</p>
        <p>We received a request to reset your password.</p>
        <p>Here is your temporary password: <strong>${tempPassword}</strong></p>
        <p>For security reasons, you will be required to change this password when you next log in.<br>
        If you did not request this password reset, please contact our support team immediately.</p>
        <p>Best regards,<br>The Store Team</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Recovery email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending recovery email:', error.message);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendRecoveryEmail
}; 