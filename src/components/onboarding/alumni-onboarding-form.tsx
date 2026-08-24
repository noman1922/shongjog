"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Calendar,
  Clock,
  Compass,
  FileText,
  Loader2,
  User,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { submitAlumniOnboarding } from "@/app/onboarding/actions";
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
  alumniOnboardingSchema,
  type AlumniOnboardingInput,
} from "@/lib/onboarding/schema";

interface AlumniOnboardingFormProps {
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

export function AlumniOnboardingForm({
  defaultValues: initialDefaults,
  universities,
  departments,
  skills,
}: AlumniOnboardingFormProps) {
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
  } = useForm<AlumniOnboardingInput>({
    defaultValues: {
      bio: "",
      companyName: "",
      departmentId: "",
      experienceYears: 2,
      fullName: initialDefaults?.fullName ?? "",
      graduationYear: currentYear - 2,
      jobTitle: "",
      professionalField: "",
      skills: [],
      universityId: "",
      username: initialDefaults?.username ?? "",
    },
    resolver: zodResolver(alumniOnboardingSchema),
  });

  const selectedUniversityId = watch("universityId");
  const selectedDepartmentId = watch("departmentId");

  const onSubmit = (values: AlumniOnboardingInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await submitAlumniOnboarding(values);
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <UserRoundCheck className="size-3.5" />
              <span>Alumni Mentor Profile</span>
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Complete your alumni profile
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
              Share your industry role, professional domain, and alma mater to mentor university peers and expand your professional network.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form className="space-y-6 pt-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1 Profile Photo Upload */}
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 dark:border-slate-800 bg-muted/20 p-5 text-center transition-colors">
            <AvatarUpload
              currentAvatarUrl={initialDefaults?.avatarUrl}
              fullName={watch("fullName") || "Alumni"}
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
              <label className={labelClass} htmlFor="alumni-full-name">
                <User className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Full Name</span>
                <span className="text-destructive">*</span>
              </label>
              <input
                className={`${inputClass} ${
                  errors.fullName ? "border-destructive/60" : ""
                }`}
                id="alumni-full-name"
                placeholder="e.g. Nusrat Jahan"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className={errorClass}>{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="alumni-username">
                <span>@ Username</span>
                <span className="text-destructive">*</span>
              </label>
              <input
                autoCapitalize="none"
                className={`${inputClass} ${
                  errors.username ? "border-destructive/60" : ""
                }`}
                id="alumni-username"
                placeholder="e.g. nusrat_jahan"
                {...register("username")}
              />
              {errors.username && (
                <p className={errorClass}>{errors.username.message}</p>
              )}
            </div>
          </div>

          {/* Cascading Alma Mater (University & Department) */}
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

          {/* Current Job Title & Company */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="alumni-company-name">
                <Building2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Current Company / Organization</span>
                <span className="text-destructive">*</span>
              </label>
              <input
                className={`${inputClass} ${
                  errors.companyName ? "border-destructive/60" : ""
                }`}
                id="alumni-company-name"
                placeholder="e.g. Brain Station 23 / Optimizely"
                {...register("companyName")}
              />
              {errors.companyName && (
                <p className={errorClass}>{errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="alumni-job-title">
                <BriefcaseBusiness className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Job Title</span>
                <span className="text-destructive">*</span>
              </label>
              <input
                className={`${inputClass} ${
                  errors.jobTitle ? "border-destructive/60" : ""
                }`}
                id="alumni-job-title"
                placeholder="e.g. Senior Software Engineer"
                {...register("jobTitle")}
              />
              {errors.jobTitle && (
                <p className={errorClass}>{errors.jobTitle.message}</p>
              )}
            </div>
          </div>

          {/* Professional Field & Experience */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <label className={labelClass} htmlFor="alumni-prof-field">
                <Compass className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Professional Field / Industry</span>
                <span className="text-destructive">*</span>
              </label>
              <input
                className={`${inputClass} ${
                  errors.professionalField ? "border-destructive/60" : ""
                }`}
                id="alumni-prof-field"
                placeholder="e.g. Full Stack Engineering, AI/ML, FinTech"
                {...register("professionalField")}
              />
              {errors.professionalField && (
                <p className={errorClass}>{errors.professionalField.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="alumni-exp-years">
                <Clock className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Years of Experience</span>
                <span className="text-destructive">*</span>
              </label>
              <input
                className={`${inputClass} ${
                  errors.experienceYears ? "border-destructive/60" : ""
                }`}
                id="alumni-exp-years"
                inputMode="numeric"
                max={50}
                min={0}
                placeholder="e.g. 3"
                type="number"
                {...register("experienceYears", { valueAsNumber: true })}
              />
              {errors.experienceYears && (
                <p className={errorClass}>{errors.experienceYears.message}</p>
              )}
            </div>
          </div>

          {/* Graduation Year */}
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="alumni-grad-year">
              <Calendar className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Graduation Year</span>
              <span className="text-destructive">*</span>
            </label>
            <input
              className={`${inputClass} max-w-sm ${
                errors.graduationYear ? "border-destructive/60" : ""
              }`}
              id="alumni-grad-year"
              inputMode="numeric"
              max={currentYear + 2}
              min={1970}
              placeholder="e.g. 2022"
              type="number"
              {...register("graduationYear", { valueAsNumber: true })}
            />
            {errors.graduationYear && (
              <p className={errorClass}>{errors.graduationYear.message}</p>
            )}
          </div>

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

          {/* Bio / Mentorship Description */}
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="alumni-bio">
              <FileText className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Bio & Mentorship Note</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                (Optional)
              </span>
            </label>
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              id="alumni-bio"
              placeholder="Share advice, the technologies you work with, or areas you are happy to guide students in..."
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
              className="h-11 w-full sm:w-auto px-6 rounded-full font-semibold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              isDisabled={isPending}
              size="lg"
              type="submit"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              <span>Complete Alumni Onboarding</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
