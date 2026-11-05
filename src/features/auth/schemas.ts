import { z } from "zod";

/**
 * Zod schemas for the authentication flow (email OTP).
 * The same schema is used by the server actions and mirrored by client forms.
 */
const email = z.string().trim().toLowerCase().pipe(z.email());

export const emailSchema = z.object({ email });

export const otpSchema = z.object({
  email,
  code: z.string().trim().regex(/^\d{6}$/),
});

export type EmailInput = z.infer<typeof emailSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
