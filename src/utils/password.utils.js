const bcrypt = require('bcryptjs');

const passwordUtils = {
  // Kiểm tra độ mạnh của mật khẩu
  validatePassword: (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) {
      errors.push(`Mật khẩu phải có ít nhất ${minLength} ký tự`);
    }
    if (!hasUpperCase) {
      errors.push('Mật khẩu phải chứa ít nhất một chữ hoa');
    }
    if (!hasLowerCase) {
      errors.push('Mật khẩu phải chứa ít nhất một chữ thường');
    }
    if (!hasNumbers) {
      errors.push('Mật khẩu phải chứa ít nhất một số');
    }
    if (!hasSpecialChar) {
      errors.push('Mật khẩu phải chứa ít nhất một ký tự đặc biệt');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Tạo mật khẩu tạm thời
  generateTempPassword: () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  },

  // Hash mật khẩu
  hashPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  // So sánh mật khẩu
  comparePassword: async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
  }
};

module.exports = passwordUtils; 