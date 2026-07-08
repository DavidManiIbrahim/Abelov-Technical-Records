import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../middlewares/error";
import { UserModel } from "../models/user.model";
import { RequestModel } from "../models/request.model";

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserModel.find({}, 'id email roles department is_active created_at');

    const userStats = await Promise.all(
      users.map(async (user: any) => ({
        id: user.id,
        email: user.email,
        is_active: user.is_active,
        roles: user.roles || [],
        department: user.department || "",
        created_at: user.created_at,
        ticketCount: await RequestModel.countDocuments({ assigned_to: user.id }),
      }))
    );

    res.json({ data: userStats });
  } catch (err) {
    next(err);
  }
};

export const assignTechnicianRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      throw new ApiError(400, "Role is required");
    }

    const validRoles = ["technician", "secretary"];
    if (!validRoles.includes(role)) {
      throw new ApiError(403, "You can only assign 'technician' or 'secretary' roles");
    }

    const user = await UserModel.findById(id);
    if (!user) throw new ApiError(404, "User not found");

    user.roles = [role];
    await user.save();

    res.json({ message: `User role updated to '${role}'`, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};
