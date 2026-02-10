const createApp = require("./app");

(async () => {
  const app = await createApp();
  app.listen(8080, () => console.log("Server running on port 8080"));
})();