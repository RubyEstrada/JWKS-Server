const { encryptPrivateKey } = require("./cryptoUtil");
const crypto = require("crypto");
const db = require("./db");

function generatePrivateKey(expSecondsFromNow) {
  const { privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

  const pem = privateKey.export({
    type: "pkcs1",
    format: "pem",
  });

  const exp = Math.floor(Date.now() / 1000) + expSecondsFromNow;

  return { pem, exp };
}

function insertKey(pem, exp) {
  const { ciphertext, iv } = encryptPrivateKey(pem);

  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO keys (key, iv, exp) VALUES (?, ?, ?)",
      [ciphertext, iv, exp],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      } 
    );
  });
}

async function seedKeysIfNeeded() {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) AS count FROM keys", [], async (err, row) => {
      if (err) return reject(err);
      if (row.count > 0) return resolve();

      const expired = generatePrivateKey(-3600); // expired 1 hr ago
      const valid = generatePrivateKey(3600);    // valid 1 hr from now

      try {
        await insertKey(expired.pem, expired.exp);
        await insertKey(valid.pem, valid.exp);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
}

module.exports = {
  seedKeysIfNeeded,
};