/**
 * bcryptWrapper.js
 * This is a wrapper around bcryptjs that provides the same API as bcrypt
 * Used to avoid native compilation issues in Docker
 */

const bcryptjs = require('bcryptjs');

// Configuration
const SALT_ROUNDS = 10;

/**
 * Hash a password using bcryptjs
 * @param {string} password - Plain text password to hash
 * @param {number} saltRounds - Number of salt rounds (default: 10)
 * @returns {Promise<string>} - Hashed password
 */
const hash = async (password, saltRounds = SALT_ROUNDS) => {
  return bcryptjs.hash(password, saltRounds);
};

/**
 * Compare a password with a hash
 * @param {string} password - Plain text password to compare
 * @param {string} hash - Hash to compare against
 * @returns {Promise<boolean>} - True if password matches hash
 */
const compare = async (password, hash) => {
  return bcryptjs.compare(password, hash);
};

module.exports = {
  hash,
  compare,
  // Provide direct access to bcryptjs if needed
  bcryptjs
}; 