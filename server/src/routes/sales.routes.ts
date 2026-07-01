import { Router } from "express";
import * as ctrl from "../controllers/sales.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

// Goods
router.get("/goods", ctrl.goodsGetAll);
router.get("/goods/:id", ctrl.goodsGetById);
router.post("/goods", ctrl.goodsCreate);
router.put("/goods/:id", ctrl.goodsUpdate);
router.delete("/goods/:id", ctrl.goodsDelete);

// Orders
router.get("/orders", ctrl.ordersGetAll);
router.get("/orders/:id", ctrl.ordersGetById);
router.post("/orders", ctrl.ordersCreate);
router.put("/orders/:id", ctrl.ordersUpdate);
router.delete("/orders/:id", ctrl.ordersDelete);

// Purchases
router.get("/purchases", ctrl.purchasesGetAll);
router.get("/purchases/:id", ctrl.purchasesGetById);
router.post("/purchases", ctrl.purchasesCreate);
router.put("/purchases/:id", ctrl.purchasesUpdate);
router.delete("/purchases/:id", ctrl.purchasesDelete);

// Expenses
router.get("/expenses", ctrl.expensesGetAll);
router.get("/expenses/:id", ctrl.expensesGetById);
router.post("/expenses", ctrl.expensesCreate);
router.put("/expenses/:id", ctrl.expensesUpdate);
router.delete("/expenses/:id", ctrl.expensesDelete);

// Credits
router.get("/credits", ctrl.creditsGetAll);
router.get("/credits/:id", ctrl.creditsGetById);
router.post("/credits", ctrl.creditsCreate);
router.put("/credits/:id", ctrl.creditsUpdate);
router.delete("/credits/:id", ctrl.creditsDelete);

export default router;
