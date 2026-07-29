import { beforeAll, afterAll, afterEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { hashPassword, createToken as ct } from "../src/utils/auth";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.RATE_LIMIT_WINDOW_MS = "60000";
  process.env.RATE_LIMIT_MAX = "1000";
  process.env.AUTH_SECRET = "test-secret-at-least-thirty-two-chars!!";

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  const preserve = new Set(["users"]);
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (!preserve.has(key)) {
      await collections[key].deleteMany({});
    }
  }
});

export const createTestUser = async (overrides: Record<string, any> = {}) => {
  const { UserModel } = await import("../src/models/user.model");
  const { salt, hash } = hashPassword("Test@1234");
  return UserModel.create({
    email: "test@abelov.ng",
    password_hash: hash,
    password_salt: salt,
    roles: ["secretary"],
    department: "",
    is_active: true,
    ...overrides,
  } as any);
};

export const createToken = (userId: string, email = "test@abelov.ng") => {
  return ct({ sub: userId, email }, 3600);
};

export const getApp = async () => {
  const { createApp } = await import("../src/app");
  return createApp();
};
