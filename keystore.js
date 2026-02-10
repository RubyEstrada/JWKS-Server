const jose = require("node-jose");

class KeyStore {
  constructor() {
    this.keys = [];
  }

  async init() {
    const now = Math.floor(Date.now() / 1000);
    // Active key (expires in 1 hour)
    const active = await this.generateKey("active-key", now + 3600);

    // Expired key (expired 1 hour ago)
    const expired = await this.generateKey("expired-key", now - 3600);

    this.keys.push(active, expired);
  }

  async generateKey(kid, expiresAt) {
    const keystore = jose.JWK.createKeyStore();
    const key = await keystore.generate("RSA", 2048, { kid, alg: "RS256", use: "sig" });

    return {
      kid,
      expiresAt,
      privateKey: key,
      publicKey: key.toJSON(),
    };
  }

  getActiveKey() {
    return this.keys.find(k => k.kid === "active-key");
  }

  getExpiredKey() {
    return this.keys.find(k => k.kid === "expired-key");
  }

  getUnexpiredPublicKeys() {
    const now = Math.floor(Date.now() / 1000);
    return this.keys
      .filter(k => k.expiresAt > now)
      .map(k => k.publicKey);
  }
}

module.exports = KeyStore;