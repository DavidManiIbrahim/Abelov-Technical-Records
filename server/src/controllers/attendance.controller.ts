import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../middlewares/error";
import { AttendanceModel } from "../models/attendance.model";
import { UserModel } from "../models/user.model";
import { getCache, setCache, delCachePattern } from "../utils/cache";

export const clockIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    const existing = await AttendanceModel.findOne({ user_id: user.id, date: today });
    if (existing) {
      throw new ApiError(400, "Already clocked in today");
    }

    const hour = new Date().getHours();
    const status = hour >= 9 ? "late" : "present";

    const record = await AttendanceModel.create({
      user_id: user.id,
      date: today,
      clock_in: now,
      status
    } as any);

    await delCachePattern("attendance:*");
    res.status(201).json({ data: (record as any).toJSON() });
  } catch (err) {
    next(err);
  }
};

export const clockOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    const record = await AttendanceModel.findOne({ user_id: user.id, date: today });
    if (!record) {
      throw new ApiError(400, "Not clocked in today");
    }
    if (record.clock_out) {
      throw new ApiError(400, "Already clocked out today");
    }

    record.clock_out = now;
    await record.save();
    await delCachePattern("attendance:*");
    res.json({ data: (record as any).toJSON() });
  } catch (err) {
    next(err);
  }
};

export const getMyAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { from, to, limit = 50, offset = 0 } = req.query;

    const filter: any = { user_id: user.id };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }

    const total = await AttendanceModel.countDocuments(filter);
    const records = await AttendanceModel.find(filter)
      .sort({ date: -1 })
      .limit(Math.min(parseInt(limit as string) || 50, 1000))
      .skip(parseInt(offset as string) || 0);

    res.json({ data: records.map((r: any) => r.toJSON()), total });
  } catch (err) {
    next(err);
  }
};

export const getAllAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to, user_id, limit = 50, offset = 0 } = req.query;
    const cacheKey = `attendance:all:${from || ""}:${to || ""}:${user_id || ""}:${limit}:${offset}`;

    const forceRefresh = req.query.forceRefresh === "true";
    if (!forceRefresh) {
      const cached = await getCache<any>(cacheKey);
      if (cached) return res.json(cached);
    }

    const filter: any = {};
    if (user_id) filter.user_id = user_id;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }

    const total = await AttendanceModel.countDocuments(filter);
    const records = await AttendanceModel.find(filter)
      .sort({ date: -1 })
      .limit(Math.min(parseInt(limit as string) || 50, 1000))
      .skip(parseInt(offset as string) || 0);

    const enriched = await Promise.all(
      records.map(async (r: any) => {
        const u = await UserModel.findById(r.user_id).select("email username roles department");
        const obj = r.toJSON();
        obj.user_email = u?.email || "Unknown";
        obj.user_name = u?.username || u?.email?.split("@")[0] || "Unknown";
        obj.user_roles = u?.roles || [];
        obj.user_department = u?.department || "";
        return obj;
      })
    );

    const result = { data: enriched, total };
    await setCache(cacheKey, result, 30);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getAttendanceStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const forceRefresh = req.query.forceRefresh === "true";
    if (!forceRefresh) {
      const cached = await getCache<any>("attendance:stats");
      if (cached) return res.json(cached);
    }

    const today = new Date().toISOString().slice(0, 10);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const monthStart = startOfMonth.toISOString().slice(0, 10);

    const [totalToday, presentToday, lateToday, totalMonth, presentMonth, lateMonth, absentMonth] = await Promise.all([
      AttendanceModel.countDocuments({ date: today }),
      AttendanceModel.countDocuments({ date: today, status: "present" }),
      AttendanceModel.countDocuments({ date: today, status: "late" }),
      AttendanceModel.countDocuments({ date: { $gte: monthStart, $lte: today } }),
      AttendanceModel.countDocuments({ date: { $gte: monthStart, $lte: today }, status: "present" }),
      AttendanceModel.countDocuments({ date: { $gte: monthStart, $lte: today }, status: "late" }),
      AttendanceModel.countDocuments({ date: { $gte: monthStart, $lte: today }, status: "absent" }),
    ]);

    const totalUsers = await UserModel.countDocuments({ is_active: true });

    const result = {
      today: { total: totalToday, present: presentToday, late: lateToday, absent: totalToday - presentToday - lateToday },
      month: { total: totalMonth, present: presentMonth, late: lateMonth, absent: absentMonth },
      totalUsers,
    };
    await setCache("attendance:stats", result, 30);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes, clock_in, clock_out } = req.body;

    const record = await AttendanceModel.findById(id);
    if (!record) throw new ApiError(404, "Attendance record not found");

    if (status) record.set("status", status);
    if (notes !== undefined) record.set("notes", notes);
    if (clock_in) record.set("clock_in", clock_in);
    if (clock_out) record.set("clock_out", clock_out);

    await record.save();
    await delCachePattern("attendance:*");
    res.json({ data: (record as any).toJSON() });
  } catch (err) {
    next(err);
  }
};
