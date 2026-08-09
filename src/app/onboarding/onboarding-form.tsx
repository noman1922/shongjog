"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";

import {
  alumniOnboardingSchema,
  studentOnboardingSchema,
  type AlumniOnboardingInput,
  type StudentOnboardingInput,
} from "@/lib/onboarding/schema";
import type {
  DepartmentOption,
  SkillOption,
  UniversityOption,
} from "@/lib/onboarding/options";
import { Button } from "@/components/ui/button";
import {
  submitAlumniOnboarding,
  submitStudentOnboarding,
} from "@/app/onboarding/actions";

type OnboardingFormProps =
  | {
      departments: DepartmentOption[];
      role: "student";
      skills: SkillOption[];
      universities: UniversityOption[];
    }
  | {
      departments: DepartmentOption[];
      role: "alumni";
      skills: SkillOption[];
      universities: UniversityOption[];
    };

const fieldClass =
  "min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 sm:text-sm";
const labelClass = "text-sm font-medium text-foreground";
const errorClass = "text-sm text-destructive";

function FieldError({ message }: { message?: string }) {
  return message ? <p className={errorClass}>{message}</p> : null;
}

function FormShell({
  children,
  error,
  isPending,
  role,
}: {
  children: React.ReactNode;
  error: string | null;
  isPending: boolean;
  role: "student" | "alumni";
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
      <div className="space-y-2 pb-6">
        <p className="text-sm font-medium text-muted-foreground">Onboarding</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Complete your {role} profile
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Add the basics so Shongjog can help the right students and alumni find
          you.
        </p>
      </div>

      {children}

      {error ? (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex justify-end">
        <Button
          className="h-11 w-full sm:w-auto"
          form={`${role}-onboarding-form`}
          isDisabled={isPending}
          size="lg"
          type="submit"
        >
          {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          Finish onboarding
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

function AcademicFields({
  departments,
  departmentError,
  departmentRegistration,
  selectedUniversityId,
  universityError,
  universityRegistration,
  universities,
}: {
  departments: DepartmentOption[];
  departmentError?: string;
  departmentRegistration: UseFormRegisterReturn;
  selectedUniversityId?: string;
  universityError?: string;
  universityRegistration: UseFormRegisterReturn;
  universities: UniversityOption[];
}) {
  const filteredDepartments = useMemo(
    () =>
      departments.filter(
        (department) => department.university_id === selectedUniversityId
      ),
    [departments, selectedUniversityId]
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-2">
        <span className={labelClass}>University</span>
        <select className={fieldClass} {...universityRegistration}>
          <option value="">Choose university</option>
          {universities.map((university) => (
            <option key={university.id} value={university.id}>
              {university.short_name
                ? `${university.name} (${university.short_name})`
                : university.name}
            </option>
          ))}
        </select>
        <FieldError message={universityError} />
      </label>

      <label className="space-y-2">
        <span className={labelClass}>Department</span>
        <select className={fieldClass} {...departmentRegistration}>
          <option value="">Choose department</option>
          {filteredDepartments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.short_name
                ? `${department.name} (${department.short_name})`
                : department.name}
            </option>
          ))}
        </select>
        <FieldError message={departmentError} />
      </label>
    </div>
  );
}

function SkillPicker({
  error,
  registration,
  skills,
}: {
  error?: string;
  registration: UseFormRegisterReturn;
  skills: SkillOption[];
}) {
  if (skills.length === 0) {
    return (
      <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        No skills are available yet. Add skills in the database before testing
        onboarding end to end.
      </p>
    );
  }

  return (
    <fieldset className="space-y-3">
      <legend className={labelClass}>Skills</legend>
      <div className="grid max-h-56 gap-2 overflow-y-auto rounded-md border border-border p-3 sm:grid-cols-2">
        {skills.map((skill) => (
          <label
            className="flex min-h-10 items-center gap-2 rounded-md px-2 text-sm hover:bg-muted"
            key={skill.id}
          >
            <input
              className="size-4 rounded border-input"
              type="checkbox"
              value={skill.id}
              {...registration}
            />
            <span>{skill.name}</span>
          </label>
        ))}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}

export function StudentOnboardingForm({
  departments,
  skills,
  universities,
}: Extract<OnboardingFormProps, { role: "student" }>) {
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedUniversityId, setSelectedUniversityId] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<StudentOnboardingInput>({
    defaultValues: {
      availabilityText: "",
      bio: "",
      fullName: "",
      internshipAvailable: false,
      skillIds: [],
      username: "",
    },
    resolver: zodResolver(studentOnboardingSchema),
  });
  const universityRegistration = register("universityId", {
    onChange(event) {
      setSelectedUniversityId(String(event.target.value));
      setValue("departmentId", "");
    },
  });

  return (
    <FormShell error={formError} isPending={isPending} role="student">
      <form
        className="space-y-5"
        id="student-onboarding-form"
        onSubmit={handleSubmit((values) => {
          setFormError(null);
          startTransition(async () => {
            const result = await submitStudentOnboarding(values);
            if (result?.error) {
              setFormError(result.error);
            }
          });
        })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className={labelClass}>Full name</span>
            <input className={fieldClass} {...register("fullName")} />
            <FieldError message={errors.fullName?.message} />
          </label>
          <label className="space-y-2">
            <span className={labelClass}>Username</span>
            <input
              autoCapitalize="none"
              className={fieldClass}
              {...register("username")}
            />
            <FieldError message={errors.username?.message} />
          </label>
        </div>

        <AcademicFields
          departments={departments}
          departmentError={errors.departmentId?.message}
          departmentRegistration={register("departmentId")}
          selectedUniversityId={selectedUniversityId}
          universityError={errors.universityId?.message}
          universityRegistration={universityRegistration}
          universities={universities}
        />

        <label className="space-y-2">
          <span className={labelClass}>Graduation year</span>
          <input
            className={fieldClass}
            inputMode="numeric"
            type="number"
            {...register("graduationYear", { valueAsNumber: true })}
          />
          <FieldError message={errors.graduationYear?.message} />
        </label>

        <SkillPicker
          error={errors.skillIds?.message}
          registration={register("skillIds")}
          skills={skills}
        />

        <label className="flex items-start gap-3 rounded-md border border-border p-3">
          <input
            className="mt-1 size-4 rounded border-input"
            type="checkbox"
            {...register("internshipAvailable")}
          />
          <span className="space-y-1">
            <span className={labelClass}>Available for internships</span>
            <span className="block text-sm text-muted-foreground">
              Let alumni and recruiters know you are open to internship
              conversations.
            </span>
          </span>
        </label>

        <label className="space-y-2">
          <span className={labelClass}>Availability description</span>
          <textarea
            className={`${fieldClass} min-h-24 resize-y`}
            {...register("availabilityText")}
          />
          <FieldError message={errors.availabilityText?.message} />
        </label>

        <label className="space-y-2">
          <span className={labelClass}>Short bio</span>
          <textarea className={`${fieldClass} min-h-28 resize-y`} {...register("bio")} />
          <FieldError message={errors.bio?.message} />
        </label>
      </form>
    </FormShell>
  );
}

export function AlumniOnboardingForm({
  departments,
  skills,
  universities,
}: Extract<OnboardingFormProps, { role: "alumni" }>) {
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedUniversityId, setSelectedUniversityId] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<AlumniOnboardingInput>({
    defaultValues: {
      bio: "",
      companyName: "",
      fullName: "",
      jobTitle: "",
      professionalField: "",
      skillIds: [],
      username: "",
    },
    resolver: zodResolver(alumniOnboardingSchema),
  });
  const universityRegistration = register("universityId", {
    onChange(event) {
      setSelectedUniversityId(String(event.target.value));
      setValue("departmentId", "");
    },
  });

  return (
    <FormShell error={formError} isPending={isPending} role="alumni">
      <form
        className="space-y-5"
        id="alumni-onboarding-form"
        onSubmit={handleSubmit((values) => {
          setFormError(null);
          startTransition(async () => {
            const result = await submitAlumniOnboarding(values);
            if (result?.error) {
              setFormError(result.error);
            }
          });
        })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className={labelClass}>Full name</span>
            <input className={fieldClass} {...register("fullName")} />
            <FieldError message={errors.fullName?.message} />
          </label>
          <label className="space-y-2">
            <span className={labelClass}>Username</span>
            <input
              autoCapitalize="none"
              className={fieldClass}
              {...register("username")}
            />
            <FieldError message={errors.username?.message} />
          </label>
        </div>

        <AcademicFields
          departments={departments}
          departmentError={errors.departmentId?.message}
          departmentRegistration={register("departmentId")}
          selectedUniversityId={selectedUniversityId}
          universityError={errors.universityId?.message}
          universityRegistration={universityRegistration}
          universities={universities}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className={labelClass}>Graduation year</span>
            <input
              className={fieldClass}
              inputMode="numeric"
              type="number"
              {...register("graduationYear", { valueAsNumber: true })}
            />
            <FieldError message={errors.graduationYear?.message} />
          </label>
          <label className="space-y-2">
            <span className={labelClass}>Years of experience</span>
            <input
              className={fieldClass}
              inputMode="numeric"
              type="number"
              {...register("experienceYears", { valueAsNumber: true })}
            />
            <FieldError message={errors.experienceYears?.message} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className={labelClass}>Company</span>
            <input className={fieldClass} {...register("companyName")} />
            <FieldError message={errors.companyName?.message} />
          </label>
          <label className="space-y-2">
            <span className={labelClass}>Job title</span>
            <input className={fieldClass} {...register("jobTitle")} />
            <FieldError message={errors.jobTitle?.message} />
          </label>
        </div>

        <label className="space-y-2">
          <span className={labelClass}>Professional field</span>
          <input className={fieldClass} {...register("professionalField")} />
          <FieldError message={errors.professionalField?.message} />
        </label>

        <SkillPicker
          error={errors.skillIds?.message}
          registration={register("skillIds")}
          skills={skills}
        />

        <label className="space-y-2">
          <span className={labelClass}>Short bio</span>
          <textarea className={`${fieldClass} min-h-28 resize-y`} {...register("bio")} />
          <FieldError message={errors.bio?.message} />
        </label>
      </form>
    </FormShell>
  );
}
