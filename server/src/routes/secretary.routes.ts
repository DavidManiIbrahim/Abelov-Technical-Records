import { Router } from "express";
import * as ctrl from "../controllers/secretary.controller";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.use(authenticate);
router.use(authorize(["secretary", "admin"]));

router.get("/users", ctrl.getUsers);
router.post("/users/:id/role", ctrl.assignTechnicianRole);

export default router;
