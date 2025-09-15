const crypto = require('crypto');
const qs = require('qs');

class VNPayService {
  constructor() {
    this.vnp_TmnCode = process.env.VNP_TMN_CODE;
    this.vnp_HashSecret = process.env.VNP_HASH_SECRET;
    this.vnp_Url = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    this.vnp_ReturnUrl = process.env.VNP_RETURN_URL || 'http://localhost:3000/payment/vnpay-return';
    this.vnp_Api = process.env.VNP_API || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';
  }

  /**
   * Create VNPay payment URL
   * @param {Object} params Payment parameters
   * @returns {String} Payment URL
   */
  createPaymentUrl(params) {
    const {
      orderId,
      amount,
      orderInfo,
      ipAddr = '127.0.0.1'
    } = params;

    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100, // VNPay expects amount in xu (1 VND = 100 xu)
      vnp_ReturnUrl: this.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: this.formatDate(new Date()),
      vnp_ExpireDate: this.formatDate(new Date(Date.now() + 15 * 60 * 1000)) // 15 minutes
    };

    // Sort parameters
    const sortedParams = this.sortObject(vnp_Params);
    
    // Create query string
    const signData = qs.stringify(sortedParams, { encode: false });
    
    // Create secure hash
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    sortedParams.vnp_SecureHash = signed;
    
    return this.vnp_Url + '?' + qs.stringify(sortedParams, { encode: false });
  }

  /**
   * Verify VNPay return data
   * @param {Object} vnp_Params Parameters from VNPay return
   * @returns {Object} Verification result
   */
  verifyReturnUrl(vnp_Params) {
    const secureHash = vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    const sortedParams = this.sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const isValid = secureHash === signed;
    const rspCode = vnp_Params.vnp_ResponseCode;

    return {
      isValid,
      isSuccess: isValid && rspCode === '00',
      responseCode: rspCode,
      message: this.getResponseMessage(rspCode),
      data: {
        orderId: vnp_Params.vnp_TxnRef,
        amount: parseInt(vnp_Params.vnp_Amount) / 100, // Convert back from xu to VND
        transactionId: vnp_Params.vnp_TransactionNo,
        bankCode: vnp_Params.vnp_BankCode,
        payDate: vnp_Params.vnp_PayDate
      }
    };
  }

  /**
   * Query transaction status from VNPay
   * @param {Object} params Query parameters
   * @returns {Object} Query result
   */
  async queryTransaction(params) {
    const {
      orderId,
      transactionDate,
      ipAddr = '127.0.0.1'
    } = params;

    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'querydr',
      vnp_TmnCode: this.vnp_TmnCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Query transaction ${orderId}`,
      vnp_TransactionDate: transactionDate,
      vnp_CreateDate: this.formatDate(new Date()),
      vnp_IpAddr: ipAddr
    };

    const sortedParams = this.sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    sortedParams.vnp_SecureHash = signed;

    try {
      const response = await fetch(this.vnp_Api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: qs.stringify(sortedParams)
      });

      const result = await response.text();
      return this.parseQueryResponse(result);
    } catch (error) {
      console.error('VNPay query error:', error);
      return {
        isSuccess: false,
        message: 'Query failed',
        error: error.message
      };
    }
  }

  /**
   * Sort object by keys
   * @param {Object} obj Object to sort
   * @returns {Object} Sorted object
   */
  sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  /**
   * Format date for VNPay
   * @param {Date} date Date to format
   * @returns {String} Formatted date string
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Get response message based on response code
   * @param {String} code Response code
   * @returns {String} Response message
   */
  getResponseMessage(code) {
    const messages = {
      '00': 'Transaction successful',
      '07': 'Deduct money successfully. Transaction suspected (related to fraud, unusual transaction)',
      '09': 'Customer\'s card/account has not registered for InternetBanking service at bank',
      '10': 'Customer authentication information is incorrect (OTP, card verification,...)',
      '11': 'Transaction timeout. Please try again',
      '12': 'Customer\'s card/account is locked',
      '13': 'Customer entered wrong transaction password too many times',
      '24': 'Customer canceled transaction',
      '51': 'Insufficient account balance',
      '65': 'Customer\'s account has exceeded the daily transaction limit',
      '75': 'Payment Bank is under maintenance',
      '79': 'Customer entered payment password incorrectly too many times',
      '99': 'Other errors (remaining errors not listed above)'
    };

    return messages[code] || 'Unknown error';
  }

  /**
   * Parse query response from VNPay
   * @param {String} responseText Response text
   * @returns {Object} Parsed response
   */
  parseQueryResponse(responseText) {
    try {
      const params = qs.parse(responseText);
      return {
        isSuccess: params.vnp_ResponseCode === '00',
        responseCode: params.vnp_ResponseCode,
        message: this.getResponseMessage(params.vnp_ResponseCode),
        data: params
      };
    } catch (error) {
      return {
        isSuccess: false,
        message: 'Failed to parse response',
        error: error.message
      };
    }
  }
}

module.exports = new VNPayService();
