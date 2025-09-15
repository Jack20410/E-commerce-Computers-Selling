# VNPay Integration Guide

This document explains how to integrate VNPay payment gateway with the E-commerce application.

## Overview

VNPay is a popular payment gateway in Vietnam that supports multiple payment methods including:
- Bank transfers
- ATM cards
- Credit/Debit cards
- QR code payments
- Mobile banking

## Setup Instructions

### 1. VNPay Account Registration

1. Visit [VNPay](https://vnpay.vn/) and register for a merchant account
2. Complete the business verification process
3. Obtain your Terminal Code (`vnp_TmnCode`) and Hash Secret (`vnp_HashSecret`)

### 2. Environment Configuration

Add the following environment variables to your `.env` file:

```env
# VNPay Configuration
VNP_TMN_CODE=your_vnpay_terminal_code
VNP_HASH_SECRET=your_vnpay_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3000/payment/vnpay-return
VNP_API=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction

# For Production
# VNP_URL=https://vnpayment.vn/paymentv2/vpcpay.html
# VNP_API=https://vnpayment.vn/merchant_webapi/api/transaction
# VNP_RETURN_URL=https://your-domain.com/payment/vnpay-return
```

### 3. VNPay Merchant Portal Configuration

1. Log into your VNPay merchant portal
2. Configure the return URL to match your `VNP_RETURN_URL`
3. Set up webhook endpoints if needed
4. Configure allowed payment methods

## Implementation Details

### Backend Components

#### 1. VNPay Service (`src/services/vnpayService.js`)
- Handles payment URL generation
- Verifies payment return data
- Manages transaction queries
- Implements VNPay security protocols

#### 2. Order Controller Updates
- Modified `createOrder` and `createGuestOrder` to handle VNPay payments
- Added `handleVNPayReturn` for processing payment returns
- Added `queryVNPayTransaction` for checking payment status

#### 3. Order Model Updates
- Added `paymentStatus` field (pending, paid, failed)
- Added `vnpayTransactionId` field
- Updated `paymentMethod` enum to include 'vnpay'

#### 4. Routes
- `GET /api/order/vnpay-return` - Handle VNPay payment returns
- `GET /api/order/vnpay-query/:orderId` - Query transaction status

### Frontend Components

#### 1. Checkout Page (`frontend/src/pages/CheckoutPage.jsx`)
- Added VNPay as payment method option
- Handles redirect to VNPay payment gateway
- Prevents cart clearing until payment is confirmed

#### 2. VNPay Return Page (`frontend/src/pages/VNPayReturnPage.jsx`)
- Processes VNPay payment returns
- Shows payment success/failure status
- Redirects to appropriate pages based on payment result

#### 3. Order Success Page Updates
- Displays VNPay payment status
- Shows transaction ID for completed payments

## Payment Flow

### For Authenticated Users

1. User selects VNPay as payment method
2. User submits order form
3. Backend creates order with 'pending' status
4. Backend generates VNPay payment URL
5. User is redirected to VNPay payment gateway
6. User completes payment on VNPay
7. VNPay redirects user to return URL with payment result
8. Backend verifies payment and updates order status
9. User sees payment confirmation

### For Guest Users

Same flow as authenticated users, but a temporary user account is created.

## Security Features

- HMAC SHA512 signature verification
- Timestamp validation
- Order amount verification
- Transaction ID tracking
- Payment status validation

## Error Handling

- Invalid signature detection
- Payment timeout handling
- Failed payment processing
- Stock restoration for failed payments
- User-friendly error messages

## Testing

### Sandbox Testing

Use VNPay sandbox environment for testing:
- URL: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- Test cards and accounts provided by VNPay documentation

### Test Scenarios

1. Successful payment flow
2. Failed payment handling
3. Payment timeout scenarios
4. Invalid signature handling
5. Duplicate transaction prevention

## Production Deployment

### Checklist

- [ ] Update environment variables with production VNPay credentials
- [ ] Configure production return URL in VNPay merchant portal
- [ ] Test payment flow in production environment
- [ ] Set up monitoring for payment transactions
- [ ] Configure email notifications for failed payments

### Security Considerations

- Keep Hash Secret secure and never expose in frontend
- Use HTTPS for all payment-related endpoints
- Implement rate limiting for payment endpoints
- Log all payment transactions for audit trail
- Monitor for unusual payment patterns

## Troubleshooting

### Common Issues

1. **Invalid Signature Error**
   - Check Hash Secret configuration
   - Verify parameter sorting and encoding

2. **Payment URL Not Working**
   - Check VNP_URL environment variable
   - Verify Terminal Code is correct

3. **Return URL Issues**
   - Ensure return URL is properly configured in VNPay portal
   - Check frontend routing for VNPay return page

4. **Transaction Not Found**
   - Check order ID format
   - Verify transaction date format

### Debugging

- Enable detailed logging in VNPay service
- Check VNPay merchant portal for transaction logs
- Monitor browser network requests for API calls
- Verify environment variables are loaded correctly

## Support

For technical issues:
- Check VNPay documentation: [VNPay Developer](https://sandbox.vnpayment.vn/apis/)
- Contact VNPay technical support
- Review application logs for error details
