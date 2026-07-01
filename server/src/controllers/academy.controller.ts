import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../middlewares/error";
import { AcademyModel } from "../models/academy.model";

function userId(req: Request): string {
  return ((req as any).user?.id || "").toString();
}

export const academyGetAll = async (req: Request, res: Response) => {
  const { user_id } = req.query;
  const filter: any = {};
  if (user_id) filter.user_id = user_id;
  const data = await AcademyModel.find(filter).sort({ created_at: -1 });
  res.json({ data: data.map((d: any) => d.toJSON()) });
};

export const academyGetById = async (req: Request, res: Response, next: NextFunction) => {
  const entity = await AcademyModel.findById(req.params.id);
  if (!entity) return next(new ApiError(404, "Academy course not found"));
  res.json({ data: entity.toJSON() });
};

export const academyCreate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = new AcademyModel({ ...req.body, user_id: userId(req) });
    await entity.save();
    res.status(201).json({ data: entity.toJSON() });
  } catch (err) {
    next(err);
  }
};

export const academyUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = await AcademyModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!entity) return next(new ApiError(404, "Academy course not found"));
    res.json({ data: entity.toJSON() });
  } catch (err) {
    next(err);
  }
};

export const academyDelete = async (req: Request, res: Response, next: NextFunction) => {
  const entity = await AcademyModel.findByIdAndDelete(req.params.id);
  if (!entity) return next(new ApiError(404, "Academy course not found"));
  res.status(204).send();
};
