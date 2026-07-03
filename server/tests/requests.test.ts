import request from "supertest";
import { Express } from "express";
import { createTestUser, createToken, getApp } from "./setup";

let app: Express;
let secretaryToken: string;
let secretaryId: string;
let technicianToken: string;
let technicianId: string;

beforeAll(async () => {
  app = await getApp();
  const secretary = await createTestUser({ email: "sec@abelov.ng", roles: ["secretary"] });
  secretaryId = secretary.id;
  secretaryToken = createToken(secretaryId, "sec@abelov.ng");
  const tech = await createTestUser({ email: "tech@abelov.ng", roles: ["technician"] });
  technicianId = tech.id;
  technicianToken = createToken(technicianId, "tech@abelov.ng");
});

describe("POST /api/v1/requests", () => {
  it("should create a request as secretary", async () => {
    const res = await request(app)
      .post("/api/v1/requests")
      .set("Authorization", `Bearer ${secretaryToken}`)
      .send({ customer_name: "John Doe", device_model: "MacBook Pro" });
    expect(res.status).toBe(201);
    expect(res.body.data.customer_name).toBe("John Doe");
  });

  it("should reject create as technician", async () => {
    const res = await request(app)
      .post("/api/v1/requests")
      .set("Authorization", `Bearer ${technicianToken}`)
      .send({ customer_name: "Hacker", device_model: "Hack" });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/v1/requests", () => {
  it("should list requests", async () => {
    await request(app)
      .post("/api/v1/requests")
      .set("Authorization", `Bearer ${secretaryToken}`)
      .send({ customer_name: "Jane", device_model: "Dell" });
    const res = await request(app)
      .get("/api/v1/requests")
      .set("Authorization", `Bearer ${secretaryToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Technician operations", () => {
  let requestId: string;

  beforeEach(async () => {
    const createRes = await request(app)
      .post("/api/v1/requests")
      .set("Authorization", `Bearer ${secretaryToken}`)
      .send({ customer_name: "Tech Job", device_model: "HP" });
    requestId = createRes.body.data.id;

    await request(app)
      .patch(`/api/v1/requests/${requestId}/assign`)
      .set("Authorization", `Bearer ${secretaryToken}`)
      .send({ technician_id: technicianId });
  });

  it("technician can accept assigned job", async () => {
    const res = await request(app)
      .patch(`/api/v1/requests/${requestId}/accept`)
      .set("Authorization", `Bearer ${technicianToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("In-Progress");
  });

  it("technician can update progress", async () => {
    await request(app)
      .patch(`/api/v1/requests/${requestId}/accept`)
      .set("Authorization", `Bearer ${technicianToken}`);
    const res = await request(app)
      .patch(`/api/v1/requests/${requestId}/progress`)
      .set("Authorization", `Bearer ${technicianToken}`)
      .send({ technician_notes: "Fixed the issue", fault_found: "Broken screen" });
    expect(res.status).toBe(200);
    expect(res.body.data.technician_notes).toBe("Fixed the issue");
  });

  it("technician can mark delivered", async () => {
    await request(app)
      .patch(`/api/v1/requests/${requestId}/accept`)
      .set("Authorization", `Bearer ${technicianToken}`);
    const res = await request(app)
      .patch(`/api/v1/requests/${requestId}/deliver`)
      .set("Authorization", `Bearer ${technicianToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("Completed");
    expect(res.body.data.delivered).toBe(true);
  });

  it("technician cannot accept unassigned job", async () => {
    const otherTech = await createTestUser({ email: "other@abelov.ng", roles: ["technician"] });
    const otherToken = createToken(otherTech.id, "other@abelov.ng");
    const res = await request(app)
      .patch(`/api/v1/requests/${requestId}/accept`)
      .set("Authorization", `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });
});

describe("GET /api/v1/requests/analytics/payments", () => {
  it("should return payment analytics", async () => {
    const res = await request(app)
      .get("/api/v1/requests/analytics/payments")
      .set("Authorization", `Bearer ${secretaryToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalRequests");
  });
});
