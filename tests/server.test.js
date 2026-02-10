const request = require("supertest");
const createApp = require("../app");
const jwt = require("jsonwebtoken");

let app;

beforeAll(async () => {
  app = await createApp();
});

test("JWKS returns only unexpired keys", async () => {
  const res = await request(app).get("/jwks");
  expect(res.status).toBe(200);
  expect(res.body.keys.length).toBe(1);
  expect(res.body.keys[0].kid).toBe("active-key");
});

test("POST /auth returns valid JWT", async () => {
  const res = await request(app).post("/auth");
  expect(res.status).toBe(200);

  const token = res.text.trim();
  const decoded = jwt.decode(token, { complete: true });

  expect(decoded.header.kid).toBe("active-key");
  expect(decoded.payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
});

test("POST /auth?expired=1 returns expired JWT", async () => {
  const res = await request(app).post("/auth?expired=1");
  expect(res.status).toBe(200);

  const token = res.text.trim();
  const decoded = jwt.decode(token, { complete: true });

  expect(decoded.header.kid).toBe("expired-key");
  expect(decoded.payload.exp).toBeLessThan(Math.floor(Date.now() / 1000));
});