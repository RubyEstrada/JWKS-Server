require("dotenv").config();
const request = require("supertest");
const express = require("express");
const authRoutes = require("../auth");
const seedKeys = require("../seedKeys");
const { seedKeysIfNeeded } = require("../keystore");

const app = express();
app.use(express.json());   // <-- REQUIRED
app.use(authRoutes);

beforeAll(async () => {
  await seedKeys();
  await seedKeysIfNeeded();
});

describe("POST /auth", () => {
  test("returns a valid JWT", async () => {
    const res = await request(app).post("/auth");

    expect(res.status).toBe(200);
    expect(typeof res.text).toBe("string");
    expect(res.text.split(".").length).toBe(3);
  });

  test("returns a JWT signed with expired key", async () => {
    const res = await request(app).post("/auth?expired=true");

    expect(res.status).toBe(200);
    expect(res.text.split(".").length).toBe(3);
  });
});