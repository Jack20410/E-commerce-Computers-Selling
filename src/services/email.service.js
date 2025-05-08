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
        <p>Thank you for shopping with us! We have created an account for you to track your orders and enjoy our services.</p>
        <p>Here are your account details:</p>
        <ul>
          <li>Email: ${user.email}</li>
          <li>Temporary Password: ${user.password}</li>
        </ul>
        <p>For security reasons, please change your password when you first log in.<br>
        You can do this by going to your Profile Settings after logging in.</p>
        <p>With this account, you can:</p>
        <ul>
          <li>Track your order status</li>
          <li>View your order history</li>
          <li>Manage your addresses</li>
          <li>Earn and use loyalty points</li>
        </ul>
        <p>If you didn't place an order with us, please contact our support team immediately.</p>
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

const sendOrderConfirmationEmail = async (orderData) => {
  try {
    // Format currency to VND
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    };

    // Generate items HTML
    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>${item.productSnapshot.name}</strong><br>
          <small>Brand: ${item.productSnapshot.brand}</small><br>
          <small>Model: ${item.productSnapshot.model}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: orderData.user.email,
      subject: `Order Confirmation #${orderData._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank You for Your Order!</h2>
          <p>Dear ${orderData.user.fullName},</p>
          <p>We have received your order and are processing it. Here are your order details:</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> #${orderData._id}</p>
            <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleString('vi-VN')}</p>
            <p><strong>Status:</strong> ${orderData.currentStatus}</p>
            <p><strong>Payment Method:</strong> ${orderData.paymentMethod.toUpperCase()}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3>Shipping Address</h3>
            <p>
              ${orderData.shippingAddress.name}<br>
              ${orderData.shippingAddress.street}<br>
              ${orderData.shippingAddress.ward}, ${orderData.shippingAddress.district}<br>
              ${orderData.shippingAddress.city}<br>
            </p>
          </div>

          <div style="margin: 20px 0;">
            <h3>Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Quantity</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                  <td style="padding: 10px; text-align: right;">${formatCurrency(orderData.subtotal)}</td>
                </tr>
                ${orderData.loyaltyPointsUsed ? `
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right;"><strong>Loyalty Points Used:</strong></td>
                  <td style="padding: 10px; text-align: right;">-${formatCurrency(orderData.loyaltyPointsUsed * 1000)}</td>
                </tr>
                ` : ''}
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total Amount:</strong></td>
                  <td style="padding: 10px; text-align: right; font-weight: bold;">${formatCurrency(orderData.totalAmount)}</td>
                </tr>
                ${orderData.loyaltyPointsEarned ? `
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right;"><strong>Loyalty Points Earned:</strong></td>
                  <td style="padding: 10px; text-align: right;">${orderData.loyaltyPointsEarned} points</td>
                </tr>
                ` : ''}
              </tfoot>
            </table>
          </div>

          <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
            <h3>Payment Instructions</h3>
            ${orderData.paymentMethod === 'cod' ? `
              <p>You have chosen Cash on Delivery. Please prepare ${formatCurrency(orderData.totalAmount)} when receiving your order.</p>
            ` : orderData.paymentMethod === 'banking' ? `
              <p>Please transfer ${formatCurrency(orderData.totalAmount)} to our bank account:</p>
              <p>
                Bank: VietcomBank<br>
                Account Number: 1027492553<br>
                Account Name: Ho Pham Duc Linh<br>
                Reference: ORDER ${orderData._id}
                - Your donation would mean a lot to me. -
              </p>
            ` : `
              <p>Please complete your payment via MoMo to:</p>
              <p>
                MoMo Number: 0938992857<br>
                Account Name: Ho Pham Duc Linh<br>
                Amount: ${formatCurrency(orderData.totalAmount)}<br>
                Reference: ORDER ${orderData._id}
                - Your donation would mean a lot to me. -
              </p>
            `}
          </div>

          <div style="margin: 20px 0;">
            <p>You can track your order status by logging into your account on our website.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Thank you for shopping with us!</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            <p>This is an automated email, please do not reply directly to this message.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendRecoveryEmail,
  sendOrderConfirmationEmail
}; 