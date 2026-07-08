import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../middlewares/error";
import { RequestSchema, RequestUpdateSchema } from "../types/request";
import { RequestModel } from "../models/request.model";

export const getAll = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const isAdmin = user.roles.includes("admin");
  const isTechnician = user.roles.includes("technician");

  const filter = isTechnician && !isAdmin ? { assigned_to: user.id } : {};

  const data = await RequestModel.find(filter)
    .sort({ created_at: -1 });

  res.json({ data: data.map(d => (d as any).toJSON()) });
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const user = (req as any).user;
  const isAdmin = user.roles.includes("admin");
  const isTechnician = user.roles.includes("technician");

  const entity = await RequestModel.findById(id);
  if (!entity) return next(new ApiError(404, "Request not found"));

  if (isTechnician && !isAdmin && entity.assigned_to !== user.id.toString()) {
    return next(new ApiError(403, "Forbidden - This request is not assigned to you"));
  }

  res.json({ data: (entity as any).toJSON() });
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const isTechnician = user.roles.includes("technician");
    const parsed = RequestSchema.parse(req.body);

    // Force user_id to be the authenticated user
    const entity = new RequestModel({
      ...parsed,
      user_id: user.id,
      // Auto-assign to technician when they create a request
      ...(isTechnician && {
        assigned_to: user.id,
        assigned_by: user.id,
        assigned_at: new Date().toISOString(),
        status: parsed.status || "Pending",
      }),
    });
    await entity.save();

    res.status(201).json({ data: (entity as any).toJSON() });
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const isAdmin = user.roles.includes("admin");
    const isTechnician = user.roles.includes("technician");

    const existing = await RequestModel.findById(id);
    if (!existing) return next(new ApiError(404, "Request not found"));

    // Technicians can only update requests assigned to them
    if (isTechnician && !isAdmin && existing.assigned_to !== user.id.toString()) {
      return next(new ApiError(403, "Forbidden - This request is not assigned to you"));
    }

    const parsed = RequestUpdateSchema.parse(req.body);

    // Prevent changing user_id through update
    delete (parsed as any).user_id;

    const entity = await RequestModel.findByIdAndUpdate(
      id,
      { $set: parsed },
      { new: true, runValidators: true }
    );

    res.json({ data: (entity as any).toJSON() });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const user = (req as any).user;
  const isAdmin = user.roles.includes("admin");

  if (!isAdmin) {
    return next(new ApiError(403, "Forbidden - Only admins can delete requests"));
  }

  const existing = await RequestModel.findById(id);
  if (!existing) return next(new ApiError(404, "Request not found"));

  await RequestModel.findByIdAndDelete(id);
  res.status(204).send();
};

export const recordPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const existing = await RequestModel.findById(id);
    if (!existing) return next(new ApiError(404, "Request not found"));

    if (user) {
      const isAdmin = user.roles.includes("admin") || user.roles.includes("secretary") || user.roles.includes("technician");
      if (!isAdmin && existing.user_id !== user.id.toString()) {
        return next(new ApiError(403, "Forbidden - Access denied"));
      }
    }

    const { amount } = req.body;

    const currentDeposit = existing.get("deposit_paid") || 0;
    const newDeposit = currentDeposit + amount;
    const totalCost = existing.get("total_cost") || 0;
    const newBalance = totalCost - newDeposit;
    const paymentCompleted = newBalance <= 0;

    existing.set("deposit_paid", newDeposit);
    existing.set("balance", newBalance);
    existing.set("payment_completed", paymentCompleted);
    existing.set("payment_status", paymentCompleted ? "paid" : newDeposit > 0 ? "partial" : "unpaid");

    await existing.save();

    res.json({ data: (existing as any).toJSON() });
  } catch (err) {
    next(err);
  }
};


export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const requests = await RequestModel.find({ user_id: userId });

    const stats = {
      total: requests.length,
      pending: requests.filter((r: any) => r.status === "Pending").length,
      completed: requests.filter((r: any) => r.status === "Completed").length,
      inProgress: requests.filter((r: any) => r.status === "In-Progress").length,
      unsuccessful: requests.filter((r: any) => r.status === "Unsuccessful").length,
      totalRevenue: requests.reduce((sum: number, r: any) => sum + (r.total_cost || 0), 0),
    };

    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
};

/**
 * Public Get By ID - For QR code access
 * Does NOT require authentication
 */
export const assignTechnician = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const { technician_id } = req.body;

    if (!technician_id) return next(new ApiError(400, "technician_id is required"));

    const existing = await RequestModel.findById(id);
    if (!existing) return next(new ApiError(404, "Request not found"));

    existing.set("assigned_to", technician_id);
    existing.set("assigned_by", user.id);
    existing.set("assigned_at", new Date().toISOString());
    existing.set("status", "Pending");

    await existing.save();
    res.json({ data: (existing as any).toJSON() });
  } catch (err) {
    next(err);
  }
};

export const acceptJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const existing = await RequestModel.findById(id);
    if (!existing) return next(new ApiError(404, "Request not found"));

    if (existing.assigned_to !== user.id.toString()) {
      return next(new ApiError(403, "Forbidden - This job is not assigned to you"));
    }

    existing.set("accepted_at", new Date().toISOString());
    existing.set("status", "In-Progress");

    await existing.save();
    res.json({ data: (existing as any).toJSON() });
  } catch (err) {
    next(err);
  }
};

export const updateProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const { status, technician_notes, fault_found, parts_used, repair_action } = req.body;

    const existing = await RequestModel.findById(id);
    if (!existing) return next(new ApiError(404, "Request not found"));

    if (existing.assigned_to !== user.id.toString()) {
      return next(new ApiError(403, "Forbidden - This job is not assigned to you"));
    }

    if (status) existing.set("status", status);
    if (technician_notes !== undefined) existing.set("technician_notes", technician_notes);
    if (fault_found !== undefined) existing.set("fault_found", fault_found);
    if (parts_used !== undefined) existing.set("parts_used", parts_used);
    if (repair_action !== undefined) existing.set("repair_action", repair_action);

    await existing.save();
    res.json({ data: (existing as any).toJSON() });
  } catch (err) {
    next(err);
  }
};

export const markDelivered = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const existing = await RequestModel.findById(id);
    if (!existing) return next(new ApiError(404, "Request not found"));

    if (existing.assigned_to !== user.id.toString()) {
      return next(new ApiError(403, "Forbidden - This job is not assigned to you"));
    }

    existing.set("delivered", true);
    existing.set("delivered_at", new Date().toISOString());
    existing.set("status", "Completed");

    await existing.save();
    res.json({ data: (existing as any).toJSON() });
  } catch (err) {
    next(err);
  }
};

export const getPaymentAnalytics = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const all = await RequestModel.find({});

    const totalRequests = all.length;
    const paid = all.filter((r: any) => r.payment_status === "paid").length;
    const partial = all.filter((r: any) => r.payment_status === "partial").length;
    const unpaid = all.filter((r: any) => r.payment_status === "unpaid").length;

    const totalRevenue = all.reduce((sum: number, r: any) => sum + (r.total_cost || 0), 0);
    const totalCollected = all.reduce((sum: number, r: any) => sum + (r.deposit_paid || 0), 0);
    const totalOutstanding = all.reduce((sum: number, r: any) => sum + (r.balance || 0), 0);

    const byDepartment = await RequestModel.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 }, revenue: { $sum: "$total_cost" }, collected: { $sum: "$deposit_paid" } } }
    ]);

    const byStatus = await RequestModel.aggregate([
      { $group: { _id: "$payment_status", count: { $sum: 1 }, amount: { $sum: "$balance" } } }
    ]);

    res.json({
      totalRequests,
      paid,
      partial,
      unpaid,
      totalRevenue,
      totalCollected,
      totalOutstanding,
      collectionRate: totalRevenue > 0 ? ((totalCollected / totalRevenue) * 100).toFixed(1) : "0.0",
      byDepartment,
      byStatus,
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // We only return a subset of fields for public view
    const entity = await RequestModel.findById(id).select(
      "id customer_name customer_phone customer_email device_brand device_model status " +
      "request_date total_cost deposit_paid balance payment_completed problem_description " +
      "repair_timeline accessories_received operating_system serial_number technician_name " +
      "service_charge parts_cost created_at updated_at"
    );

    if (!entity) return next(new ApiError(404, "Request not found"));

    res.json({ data: (entity as any).toJSON() });
  } catch (err) {
    next(err);
  }
};

