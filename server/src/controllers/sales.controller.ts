import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../middlewares/error";
import { GoodsModel } from "../models/goods.model";
import { OrderModel } from "../models/order.model";
import { PurchaseModel } from "../models/purchase.model";
import { ExpenseModel } from "../models/expense.model";
import { CreditModel } from "../models/credit.model";

function userId(req: Request): string {
  return ((req as any).user?.id || "").toString();
}

// ---- Goods ----

export const goodsGetAll = async (req: Request, res: Response) => {
  const { user_id } = req.query;
  const filter: any = {};
  if (user_id) filter.user_id = user_id;
  const data = await GoodsModel.find(filter).sort({ created_at: -1 });
  res.json({ data: data.map((d: any) => d.toJSON()) });
};

export const goodsGetById = async (req: Request, res: Response, next: NextFunction) => {
  const entity = await GoodsModel.findById(req.params.id);
  if (!entity) return next(new ApiError(404, "Goods not found"));
  res.json({ data: entity.toJSON() });
};

export const goodsCreate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = new GoodsModel({ ...req.body, user_id: userId(req) });
    await entity.save();
    res.status(201).json({ data: entity.toJSON() });
  } catch (err) {
    next(err);
  }
};

export const goodsUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = await GoodsModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!entity) return next(new ApiError(404, "Goods not found"));
    res.json({ data: entity.toJSON() });
  } catch (err) {
    next(err);
  }
};

export const goodsDelete = async (req: Request, res: Response, next: NextFunction) => {
  const entity = await GoodsModel.findByIdAndDelete(req.params.id);
  if (!entity) return next(new ApiError(404, "Goods not found"));
  res.status(204).send();
};

// ---- Orders ----

export const ordersGetAll = async (req: Request, res: Response) => {
  const { user_id } = req.query;
  const filter: any = {};
  if (user_id) filter.user_id = user_id;
  const data = await OrderModel.find(filter).sort({ created_at: -1 });
  res.json({ data: data.map((d: any) => d.toJSON()) });
};

export const ordersGetById = async (req: Request, res: Response, next: NextFunction) => {
  const entity = await OrderModel.findById(req.params.id);
  if (!entity) return next(new ApiError(404, "Order not found"));
  res.json({ data: entity.toJSON() });
};

export const ordersCreate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = new OrderModel({ ...req.body, user_id: userId(req) });
    await entity.save();
    res.status(201).json({ data: entity.toJSON() });
  } catch (err) {
    next(err);
  }
};

export const ordersUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!entity) return next(new ApiError(404, "Order not found"));
    res.json({ data: entity.toJSON() });
  } catch (err) {
    next(err);
  }
};

export const ordersDelete = async (req: Request, res: Response, next: NextFunction) => {
  const entity = await OrderModel.findByIdAndDelete(req.params.id);
  if (!entity) return next(new ApiError(404, "Order not found"));
  res.status(204).send();
};

// ---- Purchases ----

export const purchasesGetAll = async (req: Request, res: Response) => {
  const { user_id } = req.query;
  const filter: any = {};
  if (user_id) filter.user_id = user_id;
  const data = await PurchaseModel.find(filter).sort({ created_at: -1 });
  res.json({ data: data.map((d: any) => d.toJSON()) });
};

export const purchasesGetById = async (req: Request, res: Response, next: NextFunction) => {
  const entity = await PurchaseModel.findById(req.params.id);
  if (!entity) return next(new ApiError(404, "Purchase not found"));
  res.json({ data: entity.toJSON() });
};

export const purchasesCreate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = new PurchaseModel({ ...req.body, user_id: userId(req) });
    await entity.save();
    res.status(201).json({ data: entity.toJSON() });
  } catch (err) {
    next(err);
  }
};

export const purchasesUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = await PurchaseModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!entity) return next(new ApiError(404, "Purchase not found"));
    res.json({ data: entity.toJSON() });
  } catch (err) {
    next(err);
  }
};

export const purchasesDelete = async (req: Request, res: Response, next: NextFunction) => {
  const entity = await PurchaseModel.findByIdAndDelete(req.params.id);
  if (!entity) return next(new ApiError(404, "Purchase not found"));
  res.status(204).send();
};

// ---- Expenses ----

export const expensesGetAll = async (req: Request, res: Response) => {
  const { user_id } = req.query;
  const filter: any = {};
  if (user_id) filter.user_id = user_id;
  const data = await ExpenseModel.find(filter).sort({ created_at: -1 });
  res.json({ data: data.map((d: any) => d.toJSON()) });
};

export const expensesGetById = async (req: Request, res: Response, next: NextFunction) => {
  const entity = await ExpenseModel.findById(req.params.id);
  if (!entity) return next(new ApiError(404, "Expense not found"));
  res.json({ data: entity.toJSON() });
};

export const expensesCreate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = new ExpenseModel({ ...req.body, user_id: userId(req) });
    await entity.save();
    res.status(201).json({ data: entity.toJSON() });
  } catch (err) {
    next(err);
  }
};

export const expensesUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = await ExpenseModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!entity) return next(new ApiError(404, "Expense not found"));
    res.json({ data: entity.toJSON() });
  } catch (err) {
    next(err);
  }
};

export const expensesDelete = async (req: Request, res: Response, next: NextFunction) => {
  const entity = await ExpenseModel.findByIdAndDelete(req.params.id);
  if (!entity) return next(new ApiError(404, "Expense not found"));
  res.status(204).send();
};

// ---- Credits ----

export const creditsGetAll = async (req: Request, res: Response) => {
  const { user_id } = req.query;
  const filter: any = {};
  if (user_id) filter.user_id = user_id;
  const data = await CreditModel.find(filter).sort({ created_at: -1 });
  res.json({ data: data.map((d: any) => d.toJSON()) });
};

export const creditsGetById = async (req: Request, res: Response, next: NextFunction) => {
  const entity = await CreditModel.findById(req.params.id);
  if (!entity) return next(new ApiError(404, "Credit not found"));
  res.json({ data: entity.toJSON() });
};

export const creditsCreate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = new CreditModel({ ...req.body, user_id: userId(req) });
    await entity.save();
    res.status(201).json({ data: entity.toJSON() });
  } catch (err) {
    next(err);
  }
};

export const creditsUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = await CreditModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!entity) return next(new ApiError(404, "Credit not found"));
    res.json({ data: entity.toJSON() });
  } catch (err) {
    next(err);
  }
};

export const creditsDelete = async (req: Request, res: Response, next: NextFunction) => {
  const entity = await CreditModel.findByIdAndDelete(req.params.id);
  if (!entity) return next(new ApiError(404, "Credit not found"));
  res.status(204).send();
};
