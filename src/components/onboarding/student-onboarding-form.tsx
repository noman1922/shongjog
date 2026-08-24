"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  FileText,
  GraduationCap,
  Loader2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { submitStudentOnboarding } from "@/app/onboarding/actions";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { CascadingAcademicSelect } from "@/components/onboarding/cascading-academic-select";
import { SkillTagInput } from "@/components/onboarding/skill-tag-input";
import { Button } from "@/components/ui/button";
import type {
  DepartmentOption,
  SkillOption,
  UniversityOption,
} from "@/lib/onboarding/options";
import {
  studentOnboardingSchema,
  type StudentOnboardingInput,
} from "@/lib/onboarding/schema";

interface StudentOnboardingFormProps {
  defaultValues?: { avatarUrl?: string | null; fullName?: string; username?: string };
  universities: UniversityOption[];
  departments: DepartmentOption[];
  skills: SkillOption[];
}

const inputClass =
  "min-h-11 w-full rounded-xl border border-border/80 dark:border-slate-700 bg-muted/40 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:bg-card dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground";
const labelClass =
  "text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5";
const errorClass = "text-xs text-destructive font-medium";

export function StudentOnboardingForm({
  defaultValues: initialDefaults,
  universities,
  departments,
  skills,
}: StudentOnboardingFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentYear = new Date().getFullYear();

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<StudentOnboardingInput>({
    defaultValues: {
      availabilityText: "",
      bio: "",
      departmentId: "",
      fullName: initialDefaults?.fullName ?? "",
      graduationYear: currentYear + 1,
      internshipAvailable: true,
      skills: [],
      universityId: "",
      username: initialDefaults?.username ?? "",
    },
    resolver: zodResolver(studentOnboardingSchema),
  });

  const selectedUniversityId = watch("universityId");
  const selectedDepartmentId = watch("departmentId");
  const internshipAvailable = watch("internshipAvailable");

  const onSubmit = (values: StudentOnboardingInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await submitStudentOnboarding(values);
      if (result?.error) {
        setFormError(result.error);
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Elevated Card Container */}
      <div className="rounded-[24px] border border-border/80 dark:border-slate-800 bg-card text-card-foreground p-6 sm:p-10 card-shadow transition-colors duration-200">
        {/* Card Header */}
        <div className="space-y-3 pb-8 border-b border-border/60 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <Link
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              href="/onboarding"
            >
              <ArrowLeft className="size-3.5" />
              <span>Change Profile Type</span>
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 dark:bg-primary/20 px-3 py-1 text-xs font-bold text-primary dark:text-blue-300">
              <GraduationCap className="size-3.5" />
              <span>Student Profile</span>
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Complete your student profile
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
              Set up your university background, graduation target, and skills to connect with alumni mentors and find internships.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form className="space-y-6 pt-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1 Profile Photo Upload */}
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 dark:border-slate-800 bg-muted/20 p-5 text-center transition-colors">
            <AvatarUpload
              currentAvatarUrl={initialDefaults?.avatarUrl}
              fullName={watch("fullName") || "Student"}
              size="lg"
            />
            <div className="space-y-1 max-w-sm">
              <p className="text-xs font-semibold text-foreground">
                Profile Photo (Optional)
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Upload a clear photo to help your campus peers recognize you (optional, can skip)
              </p>
            </div>
          </div>

          {/* Identity: Full Name & Username */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="student-full-name">
                <User className="size-4 text-primary" />
                <span>Full Name</span>
                <span className="text-destructive">*</span>
              </label>
              <input
                className={`${inputClass} ${
                  errors.fullName ? "border-destructive/60" : ""
                }`}
                id="student-full-name"
                placeholder="e.g. Tanvir Hasan"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className={errorClass}>{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="student-username">
                <span>@ Username</span>
                <span className="text-destructive">*</span>
              </label>
              <input
                autoCapitalize="none"
                className={`${inputClass} ${
                  errors.username ? "border-destructive/60" : ""
                }`}
                id="student-username"
                placeholder="e.g. tanvir_hasan"
                {...register("username")}
              />
              {errors.username && (
                <p className={errorClass}>{errors.username.message}</p>
              )}
            </div>
          </div>

          {/* Cascading University & Department */}
          <CascadingAcademicSelect
            departmentError={errors.departmentId?.message}
            departments={departments}
            onDepartmentChange={(deptId) => setValue("departmentId", deptId, { shouldValidate: true })}
            onUniversityChange={(uniId) => setValue("universityId", uniId, { shouldValidate: true })}
            selectedDepartmentId={selectedDepartmentId}
            selectedUniversityId={selectedUniversityId}
            universities={universities}
            universityError={errors.universityId?.message}
          />

          {/* Graduation Year */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="student-grad-year">
                <Calendar className="size-4 text-primary" />
                <span>Expected Graduation Year</span>
                <span className="text-destructive">*</span>
              </label>
              <input
                className={`${inputClass} ${
                  errors.graduationYear ? "border-destructive/60" : ""
                }`}
                id="student-grad-year"
                inputMode="numeric"
                max={currentYear + 10}
                min={1990}
                placeholder="e.g. 2026"
                type="number"
                {...register("graduationYear", { valueAsNumber: true })}
              />
              {errors.graduationYear && (
                <p className={errorClass}>{errors.graduationYear.message}</p>
              )}
            </div>

            {/* Internship Availability Toggle Card */}
            <div className="flex flex-col justify-end">
              <label
                className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all duration-200 ${
                  internshipAvailable
                    ? "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-border/80 dark:border-slate-700 bg-muted/30 dark:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      internshipAvailable
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Briefcase className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-foreground">
                      Open for Internships
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Alumni & recruiters can reach out
                    </p>
                  </div>
                </div>
                <input
                  className="size-4 rounded accent-emerald-600 cursor-pointer"
                  type="checkbox"
                  {...register("internshipAvailable")}
                />
              </label>
            </div>
          </div>

          {/* Availability Details (conditional / expanded) */}
          {internshipAvailable && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className={labelClass} htmlFor="student-availability-text">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>Internship Preferences / Availability Note</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  (Optional)
                </span>
              </label>
              <input
                className={inputClass}
                id="student-availability-text"
                placeholder="e.g. Available for Summer 2026 full-time / part-time internships in Frontend or ML"
                {...register("availabilityText")}
              />
              {errors.availabilityText && (
                <p className={errorClass}>{errors.availabilityText.message}</p>
              )}
            </div>
          )}

          {/* Interactive Dynamic Skill Tag Combobox */}
          <Controller
            control={control}
            name="skills"
            render={({ field }) => (
              <SkillTagInput
                availableSkills={skills}
                error={errors.skills?.message}
                onChange={field.onChange}
                value={field.value ?? []}
              />
            )}
          />

          {/* Bio / Summary */}
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="student-bio">
              <FileText className="size-4 text-primary" />
              <span>Bio & Goals</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                (Optional)
              </span>
            </label>
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              id="student-bio"
              placeholder="Tell others about your interests, current projects, or what you hope to learn..."
              {...register("bio")}
            />
            {errors.bio && <p className={errorClass}>{errors.bio.message}</p>}
          </div>

          {/* Top-level form error */}
          {formError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs sm:text-sm text-destructive font-medium animate-in fade-in">
              {formError}
            </div>
          )}

          {/* Submit Action Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60 dark:border-slate-800">
            <Button
              className="h-11 w-full sm:w-auto px-6 rounded-full font-semibold shadow-md cursor-pointer"
              isDisabled={isPending}
              size="lg"
              type="submit"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              <span>Complete Onboarding</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
