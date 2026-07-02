import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../middlewares/error";
import { RequestModel } from "../models/request.model";
import { UserModel } from "../models/user.model";
import { GoodsModel } from "../models/goods.model";
import { OrderModel } from "../models/order.model";
import { PurchaseModel } from "../models/purchase.model";
import { ExpenseModel } from "../models/expense.model";
import { CreditModel } from "../models/credit.model";
import { AcademyModel } from "../models/academy.model";
import { hashPassword } from "../utils/auth";
import { SignupSchema } from "../types/auth";
import { env } from "../config/env";


export const initAdmin = async (_req: Request, res: Response) => {
  const adminEmail = env.ADMIN_EMAIL || "admin@abelov.com";
  const adminPassword = env.ADMIN_PASSWORD || "admin123";

  let adminCreated = false;
  let requestCreated = false;

  // Check if admin exists
  let admin = await UserModel.findOne({ email: adminEmail });

  if (!admin) {
    // Create admin user
    const { salt, hash } = hashPassword(adminPassword);
    admin = await UserModel.create({
      email: adminEmail,
      password_hash: hash,
      password_salt: salt,
      roles: ["admin"],
      is_active: true,
    } as any);
    adminCreated = true;
  }

  // Check if there are any service requests
  const requestCount = await RequestModel.countDocuments();
  let sampleRequest = null;

  if (requestCount === 0) {
    // Create a sample service request
    sampleRequest = await RequestModel.create({
      shop_name: "Abelov Technical Records",
      technician_name: "Admin Technician",
      request_date: new Date().toISOString().slice(0, 10),
      customer_name: "",
      customer_phone: "+234-000-0000",
      customer_email: "john.doe@example.com",
      customer_address: "123 Main Street, Lagos",
      device_model: "MacBook Pro",
      device_brand: "Apple",
      serial_number: "C02ABC123XYZ",
      operating_system: "macOS Sonoma",
      accessories_received: "Charger, USB-C Cable",
      problem_description: "Screen flickering and battery not charging properly",
      diagnosis_date: new Date().toISOString().slice(0, 10),
      diagnosis_technician: "Admin Technician",
      fault_found: "Faulty display cable and battery connector",
      parts_used: "Display cable, Battery connector",
      repair_action: "Replaced display cable and battery connector. Tested thoroughly.",
      status: "Completed",
      service_charge: 15000,
      parts_cost: 25000,
      total_cost: 40000,
      deposit_paid: 20000,
      balance: 20000,
      payment_completed: false,
      user_id: admin.id,
    });
    requestCreated = true;
  }

  const status = adminCreated || requestCreated ? 201 : 200;
  res.status(status).json({
    admin: admin.toJSON(),
    request: sampleRequest ? (sampleRequest as any).toJSON() : null
  });
};

export const getGlobalStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Get total users from User model
    const totalUsers = await UserModel.countDocuments();

    const totalTickets = await RequestModel.countDocuments();
    const pendingTickets = await RequestModel.countDocuments({ status: "Pending" });
    const inProgressTickets = await RequestModel.countDocuments({ status: "In-Progress" });
    const completedTickets = await RequestModel.countDocuments({ status: "Completed" });
    const unsuccessfulTickets = await RequestModel.countDocuments({ status: "Unsuccessful" });

    const totalRevenueResult = await RequestModel.aggregate([
      { $group: { _id: null, total: { $sum: "$total_cost" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    res.json({
      totalUsers,
      totalTickets,
      pendingTickets,
      completedTickets,
      inProgressTickets,
      unsuccessfulTickets,
      totalRevenue,
    });
  } catch (err) {
    next(err);
  }
};

export const getModuleStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalTickets, pendingTickets, inProgressTickets, completedTickets, unsuccessfulTickets, totalRevenueResult] = await Promise.all([
      UserModel.countDocuments(),
      RequestModel.countDocuments(),
      RequestModel.countDocuments({ status: "Pending" }),
      RequestModel.countDocuments({ status: "In-Progress" }),
      RequestModel.countDocuments({ status: "Completed" }),
      RequestModel.countDocuments({ status: "Unsuccessful" }),
      RequestModel.aggregate([{ $group: { _id: null, total: { $sum: "$total_cost" } } }]),
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const [totalGoods, totalOrders, totalPurchases, totalExpenses, totalCredits, ordersRevenue, purchasesCost, totalCourses, publishedCourses] = await Promise.all([
      GoodsModel.countDocuments(),
      OrderModel.countDocuments(),
      PurchaseModel.countDocuments(),
      ExpenseModel.countDocuments(),
      CreditModel.countDocuments(),
      OrderModel.aggregate([{ $group: { _id: null, total: { $sum: "$total_amount" } } }]),
      PurchaseModel.aggregate([{ $group: { _id: null, total: { $sum: "$total_amount" } } }]),
      AcademyModel.countDocuments(),
      AcademyModel.countDocuments({ status: "published" }),
    ]);

    const salesRevenue = ordersRevenue[0]?.total || 0;
    const salesCost = purchasesCost[0]?.total || 0;

    res.json({
      repairs: { totalTickets, pendingTickets, inProgressTickets, completedTickets, unsuccessfulTickets, totalRevenue },
      sales: { totalGoods, totalOrders, totalPurchases, totalExpenses, totalCredits, salesRevenue, salesCost },
      academy: { totalCourses, publishedCourses },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Get ALL users from the User model - no role filtering
    const users = await UserModel.find({}, 'id email roles department is_active created_at');

    const userStats = await Promise.all(
      users.map(async (user: any) => ({
        id: user.id,
        email: user.email,
        full_name: null,
        company_name: null,
        is_active: user.is_active,
        roles: user.roles || [],
        department: user.department || "",
        created_at: user.created_at,
        ticketCount: await RequestModel.countDocuments({ user_id: user.id }),
        totalRevenue: await RequestModel.aggregate([
          { $match: { user_id: user.id } },
          { $group: { _id: null, total: { $sum: '$total_cost' } } }
        ]).then(result => result[0]?.total || 0),
        pendingTickets: await RequestModel.countDocuments({ user_id: user.id, status: "Pending" }),
        completedTickets: await RequestModel.countDocuments({ user_id: user.id, status: "Completed" }),
        lastActivityDate: await RequestModel.findOne({ user_id: user.id }, {}, { sort: { updated_at: -1 } }).then(doc => doc?.updated_at || null),
      }))
    );

    res.json({ data: userStats });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, roles, department } = req.body;

    SignupSchema.parse({ email, password });

    const exists = await UserModel.findOne({ email });
    if (exists) throw new ApiError(409, "User with this email already exists");

    const { salt, hash } = hashPassword(password);
    const user = await UserModel.create({
      email,
      password_hash: hash,
      password_salt: salt,
      roles: roles || ["secretary"],
      department: department || "",
      is_active: true
    } as any);

    res.status(201).json({
      message: "User created successfully",
      data: user.toJSON()
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);
    if (!user) throw new ApiError(404, "User not found");

    // Prevent deleting yourself (the current admin)
    const currentUser = (req as any).user;
    if (user.id === currentUser.id.toString()) {
      throw new ApiError(400, "You cannot delete your own admin account");
    }

    await UserModel.findByIdAndDelete(id);

    // Also cleanup requests associated with this user? 
    // Usually better to keep them or reassign, but I'll leave them for now unless asked.

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const assignRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      throw new ApiError(400, "Role is required");
    }

    const user = await UserModel.findById(id);
    if (!user) throw new ApiError(404, "User not found");

    // Replace existing roles with the new role to ensure consistency with single-role UI
    user.roles = [role];
    await user.save();

    res.json({ message: `User role updated to '${role}'`, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

export const removeRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, role } = req.params;

    const user = await UserModel.findById(id);
    if (!user) throw new ApiError(404, "User not found");

    const initialRoleCount = user.roles.length;
    user.roles = user.roles.filter((r: string) => r !== role);

    if (user.roles.length === initialRoleCount) {
      throw new ApiError(404, `Role '${role}' not found for this user`);
    }

    await user.save();

    res.json({ message: `Role '${role}' removed from user successfully`, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

export const toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);
    if (!user) throw new ApiError(404, "User not found");

    user.is_active = !user.is_active;
    await user.save();

    res.json({ message: `User status toggled to ${user.is_active ? 'active' : 'inactive'} successfully`, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

export const getAllRequests = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const { limit = 20, offset = 0, status } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 20, 1000);
    const offsetNum = parseInt(offset as string) || 0;

    const filter: any = {};
    if (status) filter.status = status;

    const total = await RequestModel.countDocuments(filter);
    const requests = await RequestModel.find(filter)
      .sort({ created_at: -1 })
      .limit(limitNum)
      .skip(offsetNum);

    res.json({
      data: requests,
      total,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (err) {
    next(err);
  }
};

export const searchRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, limit = 50, offset = 0 } = req.query;
    const query = q as string;
    if (!query) {
      return res.json({ data: [], total: 0 });
    }

    const limitNum = Math.min(parseInt(limit as string) || 50, 1000);
    const offsetNum = parseInt(offset as string) || 0;

    const searchFilter = {
      $or: [
        { customer_name: { $regex: query, $options: "i" } },
        { customer_phone: { $regex: query, $options: "i" } },
        { customer_email: { $regex: query, $options: "i" } },
        { serial_number: { $regex: query, $options: "i" } },
      ],
    };

    const total = await RequestModel.countDocuments(searchFilter);
    const requests = await RequestModel.find(searchFilter)
      .sort({ created_at: -1 })
      .limit(limitNum)
      .skip(offsetNum);

    res.json({
      data: requests,
      total,
    });
  } catch (err) {
    next(err);
  }
};

export const getActivityLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 50, 1000);
    const offsetNum = parseInt(offset as string) || 0;

    // Return recent requests as activity logs
    const logs = await RequestModel.find()
      .sort({ updated_at: -1 })
      .limit(limitNum)
      .skip(offsetNum)
      .select("user_id customer_name status created_at updated_at");

    const total = await RequestModel.countDocuments();

    res.json({
      data: logs.map((log: any) => ({
        id: log._id,
        user: log.user_id,
        action: "request_update",
        resource: `Request: ${log.customer_name}`,
        status: log.status,
        timestamp: log.updated_at,
      })),
      total,
    });
  } catch (err) {
    next(err);
  }
};

