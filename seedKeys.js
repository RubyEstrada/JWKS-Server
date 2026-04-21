const { encryptPrivateKey } = require("./cryptoUtil");
const crypto = require("crypto");
const db = require("./db");

function generatePrivateKeyPEM() {
  const { privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

  return privateKey.export({
    type: "pkcs1",
    format: "pem",
  });
}

async function seedKeys() {
  const now = Math.floor(Date.now() / 1000);

  // Generate two PEM private keys
  const expiredKeyPEM = generatePrivateKeyPEM();
  const validKeyPEM = generatePrivateKeyPEM();

// Insert expired key
await new Promise((resolve, reject) => {
  const { ciphertext, iv } = encryptPrivateKey(expiredKeyPEM);

  db.run(
    `INSERT INTO keys (key, iv, exp) VALUES (?, ?, ?)`,
    [ciphertext, iv, now - 10],
    (err) => (err ? reject(err) : resolve())
  );
});

// Insert valid key
await new Promise((resolve, reject) => {
  const { ciphertext, iv } = encryptPrivateKey(validKeyPEM);

  db.run(
    `INSERT INTO keys (key, iv, exp) VALUES (?, ?, ?)`,
    [ciphertext, iv, now + 3600],
    (err) => (err ? reject(err) : resolve())
  );
});

  console.log("Seeded expired and valid keys into the database.");
}

module.exports = seedKeys;