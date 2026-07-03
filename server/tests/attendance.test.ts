import request from "supertest";
import { Express } from "express";
import { createTestUser, createToken, getApp } from "./setup";

let app: Express;
let secretaryToken: string;
let secretaryId: string;
let userToken: string;
let userId: string;

beforeAll(async () => {
  app = await getApp();
  const sec = await createTestUser({ email: "sec@abelov.ng", roles: ["secretary"] });
  secretaryId = sec.id;
  secretaryToken = createToken(secretaryId, "sec@abelov.ng");
  const user = await createTestUser({ email: "staff@abelov.ng", roles: ["technician"] });
  userId = user.id;
  userToken = createToken(userId, "staff@abelov.ng");
});

describe("POST /api/v1/attendance/clock-in", () => {
  it("should clock in the user", async () => {
    const res = await request(app)
      .post("/api/v1/attendance/clock-in")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("clock_in");
  });

  it("should reject double clock-in", async () => {
    await request(app)
      .post("/api/v1/attendance/clock-in")
      .set("Authorization", `Bearer ${userToken}`);
    const res = await request(app)
      .post("/api/v1/attendance/clock-in")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/attendance/clock-out", () => {
  it("should clock out after clock-in", async () => {
    await request(app)
      .post("/api/v1/attendance/clock-in")
      .set("Authorization", `Bearer ${userToken}`);
    const res = await request(app)
      .post("/api/v1/attendance/clock-out")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("clock_out");
  });

  it("should reject clock-out without clock-in", async () => {
    const res = await request(app)
      .post("/api/v1/attendance/clock-out")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(400);
  });
});

describe("Mark and get attendance", () => {
  it("secretary can mark attendance", async () => {
    const res = await request(app)
      .post("/api/v1/attendance/mark")
      .set("Authorization", `Bearer ${secretaryToken}`)
      .send({ user_id: userId, date: new Date().toISOString().slice(0, 10), status: "present" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("present");
  });
});

describe("GET /api/v1/attendance/stats", () => {
  it("should return attendance stats", async () => {
    const res = await request(app)
      .get("/api/v1/attendance/stats")
      .set("Authorization", `Bearer ${secretaryToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("today");
    expect(res.body).toHaveProperty("month");
  });
});
