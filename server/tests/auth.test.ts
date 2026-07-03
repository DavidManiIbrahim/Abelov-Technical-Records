import request from "supertest";
import { Express } from "express";
import { createTestUser, createToken, getApp } from "./setup";

let app: Express;

beforeAll(async () => {
  app = await getApp();
});

describe("POST /api/v1/auth/signup", () => {
  it("should create a new user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email: "newuser@abelov.ng", password: "StrongP@ss1", role: "secretary", department: "" });
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe("newuser@abelov.ng");
  });

  it("should reject non-abelov.ng email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email: "test@gmail.com", password: "StrongP@ss1" });
    expect(res.status).toBe(400);
  });

  it("should reject duplicate email", async () => {
    await createTestUser({ email: "dup@abelov.ng" });
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email: "dup@abelov.ng", password: "StrongP@ss1" });
    expect(res.status).toBe(409);
  });

  it("should reject weak password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email: "weak@abelov.ng", password: "short" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/auth/login", () => {
  it("should login with valid credentials", async () => {
    await createTestUser({ email: "login@abelov.ng" });
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "login@abelov.ng", password: "Test@1234" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("login@abelov.ng");
  });

  it("should reject invalid credentials", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "nonexist@abelov.ng", password: "WrongPass@1" });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/auth/me", () => {
  it("should return current user with valid token", async () => {
    const user = await createTestUser();
    const token = createToken(user.id);
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("test@abelov.ng");
  });

  it("should reject without token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/v1/auth/logout", () => {
  it("should clear token cookie", async () => {
    const res = await request(app).post("/api/v1/auth/logout");
    expect(res.status).toBe(200);
  });
});
