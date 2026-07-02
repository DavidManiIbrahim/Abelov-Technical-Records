import { Router } from "express";
import * as ctrl from "../controllers/academy.controller";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.use(authenticate);
router.use(authorize(["academy", "admin"]));

router.get("/", ctrl.academyGetAll);
router.get("/:id", ctrl.academyGetById);
router.post("/", ctrl.academyCreate);
router.put("/:id", ctrl.academyUpdate);
router.delete("/:id", ctrl.academyDelete);

export default router;
