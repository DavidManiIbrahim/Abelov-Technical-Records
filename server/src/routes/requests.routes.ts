import { Router } from "express";
import * as ctrl from "../controllers/requests.controller";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

// Public routes (No authentication required)
router.get("/public/:id", ctrl.getPublicById);
router.post("/public/:id/payment", ctrl.recordPayment);

// Apply authentication middleware to all subsequent routes
router.use(authenticate);

// Payment analytics - accessible by admin, secretary, technician
router.get("/analytics/payments", authorize(["admin", "secretary", "technician"]), ctrl.getPaymentAnalytics);

// Technician endpoints
router.patch("/:id/accept", authorize(["admin", "secretary", "technician"]), ctrl.acceptJob);
router.patch("/:id/progress", authorize(["admin", "secretary", "technician"]), ctrl.updateProgress);
router.patch("/:id/deliver", authorize(["admin", "secretary", "technician"]), ctrl.markDelivered);

// Secretary/Admin endpoints
router.patch("/:id/assign", authorize(["admin", "secretary"]), ctrl.assignTechnician);

// General CRUD - accessible by admin, secretary, technician
router.get("/", authorize(["admin", "secretary", "technician"]), ctrl.getAll);
router.post("/", authorize(["admin", "secretary", "technician"]), ctrl.create);
router.get("/stats/:userId", authorize(["admin", "secretary", "technician"]), ctrl.getStats);
router.get("/:id", authorize(["admin", "secretary", "technician"]), ctrl.getById);
router.put("/:id", authorize(["admin", "secretary", "technician"]), ctrl.update);
router.post("/:id/payment", authorize(["admin", "secretary", "technician"]), ctrl.recordPayment);
router.delete("/:id", ctrl.remove); // remove handles admin check internally

export default router;
