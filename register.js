const express = require("express");
const { v4: uuidv4 } = require("uuid");
const argon2 = require("argon2");
const db = require("./db");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email } = req.body || {};

  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  try {
    const password = uuidv4();

    const passwordHash = await argon2.hash(password, {
      timeCost: 3,
      memoryCost: 2 ** 16,
      parallelism: 1,
      type: argon2.argon2id,
    });

    db.run(
      "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)",
      [username, passwordHash, email || null],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(409).json({ error: "username or email already exists" });
          }
          return res.status(500).json({ error: "DB error" });
        }

        return res.status(201).json({ password });
      }
    );
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

module.exports = router;