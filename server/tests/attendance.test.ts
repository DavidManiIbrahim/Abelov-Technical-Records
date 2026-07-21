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
    expect(res.body.data).toHaveProperty("duration_minutes");
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
  it("should clock out after clock-in and compute duration", async () => {
    await request(app)
      .post("/api/v1/attendance/clock-in")
      .set("Authorization", `Bearer ${userToken}`);
    const res = await request(app)
      .post("/api/v1/attendance/clock-out")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("clock_out");
    expect(res.body.data).toHaveProperty("duration_minutes");
    expect(typeof res.body.data.duration_minutes).toBe("number");
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

  it("should compute duration when both clock_in and clock_out provided", async () => {
    const now = new Date().toISOString();
    const later = new Date(Date.now() + 3600000).toISOString();
    const res = await request(app)
      .post("/api/v1/attendance/mark")
      .set("Authorization", `Bearer ${secretaryToken}`)
      .send({
        user_id: userId,
        date: new Date().toISOString().slice(0, 10),
        status: "present",
        clock_in: now,
        clock_out: later,
      });
    expect(res.status).toBe(200);
    expect(res.body.data.duration_minutes).toBe(60);
  });
});

describe("GET /api/v1/attendance/stats", () => {
  it("should return attendance stats with duration fields", async () => {
    const res = await request(app)
      .get("/api/v1/attendance/stats")
      .set("Authorization", `Bearer ${secretaryToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("today");
    expect(res.body).toHaveProperty("month");
    expect(res.body.today).toHaveProperty("avgDurationMinutes");
    expect(res.body.month).toHaveProperty("avgDurationMinutes");
  });
});

describe("POST /api/v1/attendance/mark-absent", () => {
  it("should mark absent users", async () => {
    const res = await request(app)
      .post("/api/v1/attendance/mark-absent")
      .set("Authorization", `Bearer ${secretaryToken}`)
      .send({ date: new Date().toISOString().slice(0, 10) });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
});
