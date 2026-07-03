import request from "supertest";
import { Express } from "express";
import { createTestUser, createToken, getApp } from "./setup";

let app: Express;
let salesToken: string;
let salesId: string;
let adminToken: string;

beforeAll(async () => {
  app = await getApp();
  const sales = await createTestUser({ email: "sales@abelov.ng", roles: ["sales"] });
  salesId = sales.id;
  salesToken = createToken(salesId, "sales@abelov.ng");
  const admin = await createTestUser({ email: "admin@abelov.ng", roles: ["admin"] });
  adminToken = createToken(admin.id, "admin@abelov.ng");
});

describe("Goods CRUD", () => {
  let goodsId: string;

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/v1/goods")
      .set("Authorization", `Bearer ${salesToken}`)
      .send({ name: "Laptop", sku: "LAP-001", price: 500000, quantity: 10, category: "Electronics" });
    goodsId = res.body.data.id;
  });

  it("should create goods", async () => {
    const res = await request(app)
      .post("/api/v1/goods")
      .set("Authorization", `Bearer ${salesToken}`)
      .send({ name: "Laptop", sku: "LAP-001", price: 500000, quantity: 10, category: "Electronics" });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Laptop");
  });

  it("should list goods", async () => {
    const res = await request(app)
      .get("/api/v1/goods?user_id=" + salesId)
      .set("Authorization", `Bearer ${salesToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("should get goods by id", async () => {
    const res = await request(app)
      .get(`/api/v1/goods/${goodsId}`)
      .set("Authorization", `Bearer ${salesToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(goodsId);
  });

  it("should update goods", async () => {
    const res = await request(app)
      .put(`/api/v1/goods/${goodsId}`)
      .set("Authorization", `Bearer ${salesToken}`)
      .send({ price: 550000 });
    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(550000);
  });

  it("should delete goods", async () => {
    const res = await request(app)
      .delete(`/api/v1/goods/${goodsId}`)
      .set("Authorization", `Bearer ${salesToken}`);
    expect(res.status).toBe(204);
  });
});

describe("Orders CRUD", () => {
  it("should create and list orders", async () => {
    const createRes = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${salesToken}`)
      .send({ customer_name: "Buyer", total_amount: 100000, items: [{ name: "Item", quantity: 1, price: 100000 }] });
    expect(createRes.status).toBe(201);

    const listRes = await request(app)
      .get("/api/v1/orders?user_id=" + salesId)
      .set("Authorization", `Bearer ${salesToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Purchases CRUD", () => {
  it("should create and list purchases", async () => {
    const createRes = await request(app)
      .post("/api/v1/purchases")
      .set("Authorization", `Bearer ${salesToken}`)
      .send({ supplier: "Supplier Co", total_amount: 50000, items: [{ name: "Part", quantity: 5, price: 10000 }] });
    expect(createRes.status).toBe(201);

    const listRes = await request(app)
      .get("/api/v1/purchases?user_id=" + salesId)
      .set("Authorization", `Bearer ${salesToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Expenses CRUD", () => {
  it("should create and list expenses", async () => {
    const createRes = await request(app)
      .post("/api/v1/expenses")
      .set("Authorization", `Bearer ${salesToken}`)
      .send({ category: "Utilities", description: "Electric bill", amount: 15000 });
    expect(createRes.status).toBe(201);

    const listRes = await request(app)
      .get("/api/v1/expenses?user_id=" + salesId)
      .set("Authorization", `Bearer ${salesToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Credits CRUD", () => {
  it("should create and list credits", async () => {
    const createRes = await request(app)
      .post("/api/v1/credits")
      .set("Authorization", `Bearer ${salesToken}`)
      .send({ customer_name: "Credit Customer", amount: 200000 });
    expect(createRes.status).toBe(201);

    const listRes = await request(app)
      .get("/api/v1/credits?user_id=" + salesId)
      .set("Authorization", `Bearer ${salesToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Authorization", () => {
  it("should reject non-sales user from sales routes", async () => {
    const { createTestUser: ctu, createToken: ct } = await import("./setup");
    const tech = await ctu({ email: "tech2@abelov.ng", roles: ["technician"] });
    const techToken = ct(tech.id, "tech2@abelov.ng");
    const res = await request(app)
      .get("/api/v1/goods?user_id=" + tech.id)
      .set("Authorization", `Bearer ${techToken}`);
    expect(res.status).toBe(403);
  });
});
