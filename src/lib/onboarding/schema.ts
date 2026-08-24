import { z } from "zod";

const currentYear = new Date().getFullYear();

const uuidField = z.string().uuid("Please choose a valid option.");

const baseProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(150, "Full name must be 150 characters or less."),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters.")
    .max(50, "Username must be 50 characters or less.")
    .regex(
      /^[a-z0-9_]+$/,
      "Use lowercase letters, numbers, and underscores only."
    ),
  universityId: uuidField,
  departmentId: uuidField,
  graduationYear: z
    .number()
    .int("Graduation year must be a whole number.")
    .min(1950, "Enter a valid graduation year.")
    .max(currentYear + 10, "Graduation year is too far in the future."),
  skills: z
    .array(z.string().trim().min(1).max(100))
    .max(25, "Choose up to 25 skills."),
  bio: z
    .string()
    .trim()
    .max(500, "Short bio must be 500 characters or less."),
});

export const studentOnboardingSchema = baseProfileSchema.extend({
  internshipAvailable: z.boolean(),
  availabilityText: z
    .string()
    .trim()
    .max(500, "Availability description must be 500 characters or less.")
    .optional(),
});

export const alumniOnboardingSchema = baseProfileSchema.extend({
  companyName: z
    .string()
    .trim()
    .min(2, "Company is required.")
    .max(200, "Company must be 200 characters or less."),
  jobTitle: z
    .string()
    .trim()
    .min(2, "Job title is required.")
    .max(150, "Job title must be 150 characters or less."),
  professionalField: z
    .string()
    .trim()
    .min(2, "Professional field is required.")
    .max(150, "Professional field must be 150 characters or less."),
  experienceYears: z
    .number()
    .int("Years of experience must be a whole number.")
    .min(0, "Years of experience cannot be negative.")
    .max(80, "Enter a valid experience length."),
});

export type StudentOnboardingInput = z.infer<typeof studentOnboardingSchema>;
export type AlumniOnboardingInput = z.infer<typeof alumniOnboardingSchema>;
