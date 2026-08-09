import { z } from "zod";

const currentYear = new Date().getFullYear();

export const uuidSchema = z.string().uuid("Invalid item.");

export const profileEditSchema = z.object({
  availabilityText: z
    .string()
    .trim()
    .max(500, "Availability description must be 500 characters or less.")
    .optional(),
  bio: z
    .string()
    .trim()
    .min(20, "Short bio must be at least 20 characters.")
    .max(500, "Short bio must be 500 characters or less."),
  companyName: z
    .string()
    .trim()
    .max(200, "Company must be 200 characters or less.")
    .optional(),
  departmentId: uuidSchema,
  experienceYears: z
    .number()
    .int("Years of experience must be a whole number.")
    .min(0, "Years of experience cannot be negative.")
    .max(80, "Enter a valid experience length.")
    .optional(),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(150, "Full name must be 150 characters or less."),
  graduationYear: z
    .number()
    .int("Graduation year must be a whole number.")
    .min(1950, "Enter a valid graduation year.")
    .max(currentYear + 10, "Graduation year is too far in the future."),
  internshipAvailable: z.boolean().optional(),
  jobTitle: z
    .string()
    .trim()
    .max(150, "Job title must be 150 characters or less.")
    .optional(),
  professionalField: z
    .string()
    .trim()
    .max(150, "Professional field must be 150 characters or less.")
    .optional(),
  skillIds: z.array(uuidSchema).max(15, "Choose up to 15 skills."),
  universityId: uuidSchema,
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
});

export const projectSchema = z.object({
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1000 characters or less.")
    .optional(),
  imageUrl: z
    .string()
    .trim()
    .url("Enter a valid image URL.")
    .or(z.literal(""))
    .optional(),
  projectId: uuidSchema.optional(),
  projectUrl: z
    .string()
    .trim()
    .url("Enter a valid project URL.")
    .or(z.literal(""))
    .optional(),
  title: z
    .string()
    .trim()
    .min(2, "Project title must be at least 2 characters.")
    .max(200, "Project title must be 200 characters or less."),
});

export const experienceSchema = z.object({
  company: z
    .string()
    .trim()
    .min(2, "Company must be at least 2 characters.")
    .max(200, "Company must be 200 characters or less."),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1000 characters or less.")
    .optional(),
  endDate: z.string().optional(),
  experienceId: uuidSchema.optional(),
  isCurrent: z.boolean(),
  position: z
    .string()
    .trim()
    .min(2, "Position must be at least 2 characters.")
    .max(150, "Position must be 150 characters or less."),
  startDate: z.string().optional(),
});

export type ProfileEditInput = z.infer<typeof profileEditSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
