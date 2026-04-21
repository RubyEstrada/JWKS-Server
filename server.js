require("dotenv").config();
const express = require("express");

const registerRouter = require("./register");
const authRouter = require("./auth");
const jwksRouter = require("./jwks");
const seedKeys = require("./seedKeys");
const { seedKeysIfNeeded } = require("./keystore");

const app = express();
app.use(express.json());

// mount routers
app.use(registerRouter);
app.use(authRouter);
app.use(jwksRouter);

const PORT = 8080;

// original, simple startup
seedKeys(); // fire-and-forget like before

seedKeysIfNeeded()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
      console.log("Seeded expired and valid keys into the database.");
    });
  })
  .catch((err) => {
    console.error("Startup error:", err);
  });

module.exports = app;