import { z } from 'zod';

export const mongoIdZod = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid ID format' });
export const zodIdSchema = z.object({
  _id: mongoIdZod,
});
// Reusable OTP Validation Schema
export const otpZodSchema = z
  .string()
  .length(6, { message: 'OTP must be exactly 6 characters' }) // Ensure OTP is exactly 6 characters
  .regex(/^\d{6}$/, { message: 'OTP must be numeric' }); // Ensure OTP is numeric

export const opinionDistributionSchema = z
  .object({
    opinionId: z.string().min(1, 'Opinion ID is required'),
    userIds: z.array(z.string()).optional(),
    locationIds: z.array(z.string()).optional(),
    forceRefresh: z.boolean().optional(), // New field for force cache refresh
  })
  .superRefine((data, ctx) => {
    // Check if both arrays are provided and not empty
    if (data.userIds && data.userIds.length > 0 && data.locationIds && data.locationIds.length > 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Only one of user IDs or location IDs can be provided at a time.',
      });
    }
  });
export const adminLoginZodSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email format' }),
    otp: z.string().length(6, { message: 'OTP must be 6 digits' }),
    otpExpiresAt: z.date(),
  })
  .strict();
export const adminLoginInputSchema = adminLoginZodSchema.pick({
  email: true,
});
