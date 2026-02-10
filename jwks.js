module.exports = (keystore) => {
  return (req, res) => {
    const keys = keystore.getUnexpiredPublicKeys();
    res.json({ keys });
  };
};