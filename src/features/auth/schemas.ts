import { z } from "zod";

/**
 * Zod schemas for authentication:
 * - Google OAuth
 * - Email + Password Sign In & Sign Up
 */
const email = z.string().trim().toLowerCase().pipe(z.email("Please enter a valid email address."));

export const emailSchema = z.object({ email });

export const otpSchema = z.object({
  email,
  code: z.string().trim().regex(/^\d{6}$/),
});

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Password is required."),
});

export const signUpSchema = z.object({
  email,
  password: z.string().min(6, "Password must be at least 6 characters."),
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
});

export type EmailInput = z.infer<typeof emailSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
