import request from "supertest";
import { Express } from "express";
import { createTestUser, createToken, getApp } from "./setup";

let app: Express;
let adminToken: string;
let adminId: string;
let secretaryToken: string;

beforeAll(async () => {
  app = await getApp();
  const admin = await createTestUser({ email: "admin@abelov.ng", roles: ["admin"] });
  adminId = admin.id;
  adminToken = createToken(adminId, "admin@abelov.ng");
  const sec = await createTestUser({ email: "sec@abelov.ng", roles: ["secretary"] });
  secretaryToken = createToken(sec.id, "sec@abelov.ng");
});

describe("GET /api/v1/admin/module-stats", () => {
  it("should return module stats for admin", async () => {
    const res = await request(app)
      .get("/api/v1/admin/module-stats")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("repairs");
    expect(res.body).toHaveProperty("sales");
    expect(res.body).toHaveProperty("academy");
    expect(res.body).toHaveProperty("attendance");
    expect(res.body).toHaveProperty("users");
  });

  it("should reject non-admin user", async () => {
    const res = await request(app)
      .get("/api/v1/admin/module-stats")
      .set("Authorization", `Bearer ${secretaryToken}`);
    expect(res.status).toBe(403);
  });
});

describe("GET /api/v1/admin/stats", () => {
  it("should return global stats", async () => {
    const res = await request(app)
      .get("/api/v1/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalUsers");
    expect(res.body).toHaveProperty("totalTickets");
  });
});

describe("GET /api/v1/admin/users", () => {
  it("should list all users with stats", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });
});

describe("POST /api/v1/admin/users", () => {
  it("should create a new user", async () => {
    const res = await request(app)
      .post("/api/v1/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "newstaff@abelov.ng", password: "StrongP@ss1", roles: ["technician"], department: "engineering" });
    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe("newstaff@abelov.ng");
  });
});

describe("GET /api/v1/admin/logs", () => {
  it("should return activity logs", async () => {
    const res = await request(app)
      .get("/api/v1/admin/logs")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});

describe("POST /api/v1/admin/init", () => {
  it("should initialize admin", async () => {
    const res = await request(app)
      .post("/api/v1/admin/init")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(201);
  });
});

describe("Health check", () => {
  it("should return ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
