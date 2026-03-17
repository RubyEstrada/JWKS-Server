const request = require("supertest");
const express = require("express");
const jwksRoutes = require("../jwks");

const app = express();
app.use(jwksRoutes);

describe("GET /.well-known/jwks.json", () => {
  test("returns a JWKS with valid keys", async () => {
    const res = await request(app).get("/.well-known/jwks.json");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("keys");
    expect(Array.isArray(res.body.keys)).toBe(true);

    const key = res.body.keys[0];
    expect(key).toHaveProperty("kty", "RSA");
    expect(key).toHaveProperty("n");
    expect(key).toHaveProperty("e");
    expect(key).toHaveProperty("kid");
  });
});