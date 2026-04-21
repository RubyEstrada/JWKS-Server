const { decryptPrivateKey } = require("./cryptoUtil");
const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db");
const crypto = require("crypto");

const router = express.Router();

router.post("/auth", (req, res) => {
  try {
    const wantExpired = "expired" in req.query;
    const now = Math.floor(Date.now() / 1000);

    const sql = wantExpired
      ? "SELECT kid, key, iv, exp FROM keys WHERE exp <= ? ORDER BY exp DESC LIMIT 1"
      : "SELECT kid, key, iv, exp FROM keys WHERE exp > ? ORDER BY exp ASC LIMIT 1";

    db.get(sql, [now], (err, row) => {
      if (err || !row) {
        console.error("AUTH ERROR: key retrieval failed:", err);
        return res.status(500).json({ error: "Key retrieval error" });
      }

      // Decrypt private key
      let pem;
      try {
        pem = decryptPrivateKey(row.key, row.iv);
      } catch (e) {
        console.error("AUTH ERROR: decrypt failed:", e);
        return res.status(500).json({ error: "Key decryption error" });
      }

      let privateKey;
      try {
        privateKey = crypto.createPrivateKey({
          key: pem,
          format: "pem",
          type: "pkcs1",
        });
      } catch (e) {
        console.error("AUTH ERROR: createPrivateKey failed:", e);
        return res.status(500).json({ error: "Private key creation error" });
      }

      // Sign JWT
      let token;
      try {
        token = jwt.sign(
          { sub: "fake-user" },
          privateKey,
          {
            algorithm: "RS256",
            header: { kid: row.kid },
            expiresIn: "1h",
          }
        );
      } catch (e) {
        console.error("AUTH ERROR: jwt.sign failed:", e);
        return res.status(500).json({ error: "JWT signing error" });
      }

      res.send(token);
    });
  } catch (err) {
    console.error("AUTH ERROR (outer):", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;