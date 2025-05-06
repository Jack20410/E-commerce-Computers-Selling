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

module.exports = {
  sendWelcomeEmail
}; 