const request = require("supertest");
const express = require("express");
const authRoutes = require("../auth");
const db = require("../db");

const app = express();
app.use(authRoutes);

describe("POST /auth", () => {
  test("returns a valid JWT", async () => {
    const res = await request(app).post("/auth");

    expect(res.status).toBe(200);
    expect(typeof res.text).toBe("string");
    expect(res.text.split(".").length).toBe(3); // header.payload.signature
  });

  test("returns a JWT signed with expired key", async () => {
    const res = await request(app).post("/auth?expired=true");

    expect(res.status).toBe(200);
    expect(res.text.split(".").length).toBe(3);
  });
});