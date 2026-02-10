const jwt = require("jsonwebtoken");

module.exports = (keystore) => {
  return (req, res) => {
    const expired = req.query.expired !== undefined;

    const key = expired ? keystore.getExpiredKey() : keystore.getActiveKey();

    const exp = expired
      ? Math.floor(Date.now() / 1000) - 300   // expired 5 minutes ago
      : Math.floor(Date.now() / 1000) + 1800; // expires in 30 minutes

    const token = jwt.sign(
      { sub: "fake-user", exp },
      key.privateKey.toPEM(true),
      { algorithm: "RS256", header: { kid: key.kid } }
    );

    res.send(token);
  };
};