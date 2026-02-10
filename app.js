const express = require("express");
const KeyStore = require("./keystore");
const jwksHandler = require("./jwks");
const authHandler = require("./auth");

async function createApp() {
  const keystore = new KeyStore();
  await keystore.init();

  const app = express();

  app.get("/jwks", jwksHandler(keystore));
  app.post("/auth", authHandler(keystore));

  return app;
}

module.exports = createApp;