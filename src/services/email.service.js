const sendWelcomeEmail = async (user) => {
  try {
    console.log(`
      ==== MOCK EMAIL SENT ====
      To: ${user.email}
      Subject: Welcome to Our Store - Your Account Information
      
      Dear ${user.fullName},
      
      Thank you for creating an account with Our Store! 
      
      Here are your account details:
      - Email: ${user.email}
      - Temporary Password: ${user.password}
      
      For security reasons, please change your password when you first log in.
      You can do this by going to your Profile Settings after logging in.
      
      If you didn't create this account, please contact our support team immediately.
      
      Best regards,
      The Store Team
      ==== END OF MOCK EMAIL ====
    `);
    
    // Simulate async process
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error.message);
    return false;
  }
};

const sendRecoveryEmail = async ({ email, fullName, tempPassword }) => {
  try {
    console.log(`
      ==== MOCK RECOVERY EMAIL SENT ====
      To: ${email}
      Subject: Password Recovery - Your Temporary Password
      
      Dear ${fullName},
      
      We received a request to reset your password.
      
      Here is your temporary password: ${tempPassword}
      
      For security reasons, you will be required to change this password when you next log in.
      If you did not request this password reset, please contact our support team immediately.
      
      Best regards,
      The Store Team
      ==== END OF MOCK EMAIL ====
    `);
    
    // Simulate async process
    await new Promise(resolve => setTimeout(resolve, 500));
    
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