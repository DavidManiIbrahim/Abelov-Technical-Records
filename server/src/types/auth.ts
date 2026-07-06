import { z } from "zod";

const ABELOV_DOMAIN = "abelov.ng";

export const SignupSchema = z.object({
  email: z.string().email().refine((email) => email.endsWith(`@${ABELOV_DOMAIN}`), {
    message: `Registration is restricted to ${ABELOV_DOMAIN} domain`,
  }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  role: z.enum(["secretary", "technician", "sales", "academy"]).default("secretary"),
  department: z.enum(["engineering", "sales", "it_academy", ""]).default(""),
});


export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const AdminCreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roles: z.array(z.string()).optional().default(["secretary"]),
  department: z.enum(["engineering", "sales", "it_academy", ""]).optional().default(""),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type AdminCreateUserInput = z.infer<typeof AdminCreateUserSchema>;


