const express = require("express");
const db = require("./db");
const crypto = require("crypto");

const router = express.Router();

function pemToJwk(pem, kid) {
  const privateKey = crypto.createPrivateKey(pem);
  const publicKey = crypto.createPublicKey(privateKey);
  const jwk = publicKey.export({ format: "jwk" });

  return {
    kty: jwk.kty,
    n: jwk.n,
    e: jwk.e,
    alg: "RS256",
    use: "sig",
    kid: String(kid),
  };
}

router.get("/.well-known/jwks.json", (req, res) => {
  const now = Math.floor(Date.now() / 1000);

  db.all("SELECT kid, key FROM keys WHERE exp > ?", [now], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });

    const keys = rows.map((row) =>
      pemToJwk(row.key.toString(), row.kid)
    );

    res.json({ keys });
  });
});

module.exports = router;