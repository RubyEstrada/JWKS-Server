const crypto = require("crypto");

const ALGO = "aes-256-gcm";

function getAesKey() {
  const secret = process.env.NOT_MY_KEY;
  return crypto.createHash("sha256").update(secret).digest();
}

function encryptPrivateKey(pem) {
  const key = getAesKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);

  const encrypted = Buffer.concat([cipher.update(pem, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    ciphertext: Buffer.concat([encrypted, tag]),
    iv
  };
}

function decryptPrivateKey(ciphertext, iv) {
  const key = getAesKey();
  const tag = ciphertext.slice(ciphertext.length - 16);
  const data = ciphertext.slice(0, ciphertext.length - 16);

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}

module.exports = { encryptPrivateKey, decryptPrivateKey };