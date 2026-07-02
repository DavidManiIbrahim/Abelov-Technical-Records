import { Router } from "express";
import * as ctrl from "../controllers/attendance.controller";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

// Self-service (all authenticated users)
router.post("/clock-in", ctrl.clockIn);
router.post("/clock-out", ctrl.clockOut);
router.get("/me", ctrl.getMyAttendance);

// Secretary/Admin management
router.get("/all", authorize(["secretary", "admin"]), ctrl.getAllAttendance);
router.get("/stats", authorize(["secretary", "admin"]), ctrl.getAttendanceStats);
router.put("/:id", authorize(["secretary", "admin"]), ctrl.updateAttendance);

export default router;
