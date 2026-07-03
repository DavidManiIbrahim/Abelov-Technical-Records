import request from "supertest";
import { Express } from "express";
import { createTestUser, createToken, getApp } from "./setup";

let app: Express;
let academyToken: string;
let academyId: string;

beforeAll(async () => {
  app = await getApp();
  const acad = await createTestUser({ email: "acad@abelov.ng", roles: ["academy"] });
  academyId = acad.id;
  academyToken = createToken(academyId, "acad@abelov.ng");
});

describe("Academy CRUD", () => {
  let courseId: string;

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/v1/academy")
      .set("Authorization", `Bearer ${academyToken}`)
      .send({ user_id: academyId, title: "Web Development 101", description: "Learn HTML, CSS, JS", category: "Web", instructor: "John", duration: "3 months", price: 50000, level: "beginner", syllabus: "HTML basics" });
    courseId = res.body.data.id;
  });

  it("should create a course", async () => {
    const res = await request(app)
      .post("/api/v1/academy")
      .set("Authorization", `Bearer ${academyToken}`)
      .send({ user_id: academyId, title: "Web Development 101", description: "Learn HTML, CSS, JS", category: "Web", instructor: "John", duration: "3 months", price: 50000, level: "beginner", syllabus: "HTML basics" });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Web Development 101");
  });

  it("should list courses", async () => {
    const res = await request(app)
      .get("/api/v1/academy?user_id=" + academyId)
      .set("Authorization", `Bearer ${academyToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should get course by id", async () => {
    const res = await request(app)
      .get(`/api/v1/academy/${courseId}`)
      .set("Authorization", `Bearer ${academyToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(courseId);
  });

  it("should update course", async () => {
    const res = await request(app)
      .put(`/api/v1/academy/${courseId}`)
      .set("Authorization", `Bearer ${academyToken}`)
      .send({ price: 45000 });
    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(45000);
  });

  it("should delete course", async () => {
    const res = await request(app)
      .delete(`/api/v1/academy/${courseId}`)
      .set("Authorization", `Bearer ${academyToken}`);
    expect(res.status).toBe(204);
  });
});
