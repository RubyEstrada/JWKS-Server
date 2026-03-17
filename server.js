const seedKeys = require("./seedKeys");
const express = require("express");
const { seedKeysIfNeeded } = require("./keystore");
const authRouter = require("./auth");
const jwksRouter = require("./jwks");

const app = express();

seedKeys(); // seeds the DB on startup

app.use(express.json());

app.use(authRouter);
app.use(jwksRouter);

if (require.main === module) {
  const PORT = 8080;

  seedKeysIfNeeded().then(() => {
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  });
}

module.exports = app;