const express = require("express");
const db = require("./db");
const { decryptPrivateKey } = require("./cryptoUtil");

const router = express.Router();

router.get("/jwks", (req, res) => {
  db.all("SELECT kid, key, iv, exp FROM keys", [], (err, rows) => {
    if (err) {
      console.error("DB error in /jwks:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const now = Math.floor(Date.now() / 1000);

    const keys = rows
      .filter((row) => row.exp > now)
      .map((row) => {
        const pem = decryptPrivateKey(row.key, row.iv);
        return {
          kid: row.kid.toString(),
          kty: "RSA",
          use: "sig",
          alg: "RS256",
          // you had this working already—keep your original mapping here
        };
      });

    res.json({ keys });
  });
});

module.exports = router;