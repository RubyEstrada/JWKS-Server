const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db");
const crypto = require("crypto");

const router = express.Router();

router.post("/auth", (req, res) => {
  const wantExpired = "expired" in req.query;
  const now = Math.floor(Date.now() / 1000);

  const sql = wantExpired
    ? "SELECT kid, key, exp FROM keys WHERE exp <= ? ORDER BY exp DESC LIMIT 1"
    : "SELECT kid, key, exp FROM keys WHERE exp > ? ORDER BY exp ASC LIMIT 1";

  db.get(sql, [now], (err, row) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!row) return res.status(500).json({ error: "No key found" });

    const pem = row.key.toString();
    const kid = row.kid;

    // ⭐ Convert PEM string → RSA private key object
    const privateKey = crypto.createPrivateKey({
      key: pem,
      format: "pem",
      type: "pkcs1",
    });

    // ⭐ Sign the JWT using the real private key
    const token = jwt.sign(
      { sub: "fake-user" },
      privateKey,
      {
        algorithm: "RS256",
        header: { kid },
        expiresIn: "1h",
      }
    );

    res.send(token);
  });
});

module.exports = router;