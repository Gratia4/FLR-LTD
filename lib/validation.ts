import { z } from "zod";

/** Mirrors `passwordRules` in backend/src/routes/auth.ts. */
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Use at most 128 characters.")
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/[0-9]/, "Include a number.")
  .regex(/[^A-Za-z0-9]/, "Include a symbol.");

/** A new password plus its confirmation, checked for a match. */
export const newPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string().min(1, "Confirm your new password.") })
  .refine((value) => value.password === value.confirm, { path: ["confirm"], message: "The passwords do not match." });
