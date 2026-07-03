import { Router } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import * as ctrl from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth";

const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || "300000", 10),
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || "5", 10),
  message: { error: "Too many authentication attempts, please try again after 5 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();
// Apply strict rate limiting to all auth routes
router.use(authRateLimiter);


// Production-ready CORS configuration for auth routes
const allowedOrigins = [
  // Production frontend (Render deployment)
  "https://abelov-technical-records-main.onrender.com",
  "https://abelov-technical-records.onrender.com",
  // Development frontend
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:3000",
  "http://localhost:5173",
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV !== 'production' && origin.includes('localhost'));

    if (isAllowed) {
      return callback(null, origin);
    }

    return callback(new Error(`CORS policy violation: ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-CSRF-Token"
  ],
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

router.use(cors(corsOptions));

router.post("/signup", ctrl.signup);
router.post("/login", ctrl.login);
router.post("/logout", ctrl.logout);



// Protected routes
router.get("/me", authenticate, ctrl.me);
router.put("/profile", authenticate, ctrl.updateProfile);

export default router;
