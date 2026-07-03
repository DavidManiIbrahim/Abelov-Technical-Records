import { z } from "zod";

const ABELOV_DOMAIN = "abelov.ng";

export const SignupSchema = z.object({
  email: z.string().email().refine((email) => email.endsWith(`@${ABELOV_DOMAIN}`), {
    message: `Registration is restricted to ${ABELOV_DOMAIN} domain`,
  }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  role: z.enum(["secretary", "technician", "sales", "academy"]).default("secretary"),
  department: z.enum(["engineering", "sales", "it_academy", ""]).default(""),
});


export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;


