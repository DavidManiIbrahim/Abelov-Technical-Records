import { Router } from "express";
import * as ctrl from "../controllers/academy.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.get("/", ctrl.academyGetAll);
router.get("/:id", ctrl.academyGetById);
router.post("/", ctrl.academyCreate);
router.put("/:id", ctrl.academyUpdate);
router.delete("/:id", ctrl.academyDelete);

export default router;
