require("dotenv").config();
const request = require("supertest");
const express = require("express");
const jwksRoutes = require("../jwks");

const app = express();
app.use(jwksRoutes);

describe("GET /jwks", () => {
  test("returns a JWKS with valid keys", async () => {
    const res = await request(app).get("/jwks");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("keys");
    expect(Array.isArray(res.body.keys)).toBe(true);

    const key = res.body.keys[0];
    expect(key).toHaveProperty("kty", "RSA");
    expect(key).toHaveProperty("alg", "RS256");
    expect(key).toHaveProperty("kid");
    expect(key).toHaveProperty("use", "sig");
  });
});