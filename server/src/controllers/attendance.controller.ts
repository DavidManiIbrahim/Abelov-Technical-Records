import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../middlewares/error";
import { AttendanceModel } from "../models/attendance.model";
import { UserModel } from "../models/user.model";

const LATE_THRESHOLD_HOUR = parseInt(process.env.LATE_THRESHOLD_HOUR || "10", 10);

function getLocalHour(timezone: string): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: timezone,
  });
  return parseInt(formatter.format(now), 10);
}

function computeDuration(clockIn: string, clockOut: string): number {
  const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

export const clockIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    const existing = await AttendanceModel.findOne({ user_id: user.id, date: today });
    if (existing) {
      throw new ApiError(400, "Already clocked in today");
    }

    const tz = user.timezone || "Africa/Lagos";
    const hour = getLocalHour(tz);
    const status = hour >= LATE_THRESHOLD_HOUR ? "late" : "present";

    const record = await AttendanceModel.create({
      user_id: user.id,
      date: today,
      clock_in: now,
      status,
    });

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
    record.duration_minutes = record.clock_in ? computeDuration(record.clock_in, now) : null;
    await record.save();

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

    const filter: any = {};
    if (user_id) filter.user_id = user_id;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }

    const targetDate = from || new Date().toISOString().slice(0, 10);
    const allUsers = await UserModel.find(
      { roles: { $nin: ["admin"] }, is_active: true },
      "id email username roles department timezone"
    );

    const records = await AttendanceModel.find({ date: targetDate });
    const recordMap = new Map(records.map((r: any) => [r.user_id, r.toJSON()]));

    const merged = allUsers.map((u: any) => {
      const record = recordMap.get(u.id);
      return {
        id: record?._id || null,
        user_id: u.id,
        user_email: u.email,
        user_name: u.username || u.email?.split("@")[0] || "Unknown",
        user_roles: u.roles || [],
        user_department: u.department || "",
        date: targetDate,
        clock_in: record?.clock_in || null,
        clock_out: record?.clock_out || null,
        duration_minutes: record?.duration_minutes || null,
        status: record?.status || null,
        notes: record?.notes || "",
        face_image: record?.face_image || null,
      };
    });

    res.json({ data: merged, total: merged.length });
  } catch (err) {
    next(err);
  }
};

export const getAttendanceStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const monthStart = startOfMonth.toISOString().slice(0, 10);

    const [
      totalToday, presentToday, lateToday, absentToday,
      totalMonth, presentMonth, lateMonth, absentMonth,
      avgDurationToday, avgDurationMonth,
    ] = await Promise.all([
      AttendanceModel.countDocuments({ date: today }),
      AttendanceModel.countDocuments({ date: today, status: "present" }),
      AttendanceModel.countDocuments({ date: today, status: "late" }),
      AttendanceModel.countDocuments({ date: today, status: "absent" }),
      AttendanceModel.countDocuments({ date: { $gte: monthStart, $lte: today } }),
      AttendanceModel.countDocuments({ date: { $gte: monthStart, $lte: today }, status: "present" }),
      AttendanceModel.countDocuments({ date: { $gte: monthStart, $lte: today }, status: "late" }),
      AttendanceModel.countDocuments({ date: { $gte: monthStart, $lte: today }, status: "absent" }),
      AttendanceModel.aggregate([
        { $match: { date: today, duration_minutes: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: "$duration_minutes" } } },
      ]),
      AttendanceModel.aggregate([
        { $match: { date: { $gte: monthStart, $lte: today }, duration_minutes: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: "$duration_minutes" } } },
      ]),
    ]);

    const totalUsers = await UserModel.countDocuments({ is_active: true });

    res.json({
      today: {
        total: totalToday,
        present: presentToday,
        late: lateToday,
        absent: absentToday,
        avgDurationMinutes: Math.round(avgDurationToday[0]?.avg || 0),
      },
      month: {
        total: totalMonth,
        present: presentMonth,
        late: lateMonth,
        absent: absentMonth,
        avgDurationMinutes: Math.round(avgDurationMonth[0]?.avg || 0),
      },
      totalUsers,
    });
  } catch (err) {
    next(err);
  }
};

export const markAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id, date, status, clock_in, clock_out } = req.body;

    if (!user_id || !date || !status) {
      throw new ApiError(400, "user_id, date, and status are required");
    }

    const targetUser = await UserModel.findById(user_id).select("roles timezone");
    if (!targetUser) throw new ApiError(404, "User not found");
    if (targetUser.roles.includes("admin")) {
      throw new ApiError(400, "Cannot mark attendance for admin users");
    }

    let resolvedStatus = status;
    if (clock_in && !status) {
      const tz = targetUser.timezone || "Africa/Lagos";
      const hour = getLocalHour(tz);
      resolvedStatus = hour >= LATE_THRESHOLD_HOUR ? "late" : "present";
    }

    const validStatuses = ["present", "late", "absent", "half_day"];
    if (!validStatuses.includes(resolvedStatus)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const duration_minutes = clock_in && clock_out ? computeDuration(clock_in, clock_out) : null;

    const record = await AttendanceModel.findOneAndUpdate(
      { user_id, date },
      {
        $set: {
          user_id,
          date,
          status: resolvedStatus,
          ...(clock_in !== undefined && { clock_in }),
          ...(clock_out !== undefined && { clock_out }),
          ...(duration_minutes !== null && { duration_minutes }),
        },
      },
      { upsert: true, new: true }
    );

    res.json({ data: (record as any).toJSON() });
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

    const finalClockIn = record.get("clock_in") as string | null;
    const finalClockOut = record.get("clock_out") as string | null;
    if (finalClockIn && finalClockOut) {
      record.set("duration_minutes", computeDuration(finalClockIn, finalClockOut));
    } else {
      record.set("duration_minutes", null);
    }

    await record.save();
    res.json({ data: (record as any).toJSON() });
  } catch (err) {
    next(err);
  }
};

export const markAbsent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().slice(0, 10);

    const allUsers = await UserModel.find(
      { roles: { $nin: ["admin"] }, is_active: true },
      "id"
    );

    const existingRecords = await AttendanceModel.find({ date: targetDate });
    const existingUserIds = new Set(existingRecords.map((r: any) => r.user_id));

    const absentUsers = allUsers.filter((u: any) => !existingUserIds.has(u.id));

    if (absentUsers.length === 0) {
      return res.json({ data: [], message: "All users already have attendance records" });
    }

    const absentRecords = await AttendanceModel.insertMany(
      absentUsers.map((u: any) => ({
        user_id: u.id,
        date: targetDate,
        status: "absent",
        clock_in: null,
        clock_out: null,
        duration_minutes: null,
        notes: "Auto-marked absent",
      }))
    );

    res.json({
      data: absentRecords.map((r: any) => r.toJSON()),
      message: `Marked ${absentRecords.length} users as absent for ${targetDate}`,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyFace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { face_image } = req.body;

    if (!face_image) {
      throw new ApiError(400, "face_image is required (base64 encoded image)");
    }

    const { detectFaces } = await import("../services/face-detection.service");
    const result = await detectFaces(face_image);

    res.json({
      data: {
        faces_detected: result.faceCount,
        is_valid: result.faceCount > 0,
        confidence: result.confidence,
      },
    });
  } catch (err) {
    next(err);
  }
};
