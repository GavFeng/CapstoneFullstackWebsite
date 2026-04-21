require("dotenv").config();
const crypto = require('crypto');


const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const ivSize = 16;

const encrypt = (text) => {
  if (!text) return text;
  const iv = crypto.randomBytes(ivSize);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // Return IV + Encrypted data so we can decrypt it later
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
  if (!text || !text.includes(':')) return text;
  const [ivHex, encryptedText] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const createBlindIndex = (text) => {
  if (!text) return null;
  return crypto
    .createHmac('sha256', process.env.BLIND_INDEX_SECRET)
    .update(text.toLowerCase().trim())
    .digest('hex');
};

module.exports = { encrypt, decrypt, createBlindIndex };