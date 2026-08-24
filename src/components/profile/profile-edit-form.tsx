"use client";

import { useActionState, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";

import {
  deleteExperienceAction,
  deleteProjectAction,
  saveExperienceAction,
  saveProjectAction,
  updateProfileAction,
} from "@/app/profile/actions";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { Button } from "@/components/ui/button";
import { ProfileSection } from "@/components/profile/profile-section";
import type {
  DepartmentOption,
  SkillOption,
  UniversityOption,
} from "@/lib/onboarding/options";
import type {
  ProfileExperience,
  ProfileProject,
  ProfileSkill,
  PublicProfile,
} from "@/lib/profile/types";

type ActionState = {
  error?: string;
  success?: string;
};

const initialState: ActionState = {};
const fieldClass =
  "min-h-11 w-full rounded-xl border border-border/80 dark:border-slate-700 bg-muted/40 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:bg-card dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground";
const labelClass = "text-xs sm:text-sm font-semibold text-foreground";

function ActionMessage({ state }: { state: ActionState }) {
  if (state.error) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {state.error}
      </p>
    );
  }

  if (state.success) {
    return (
      <p className="rounded-md border border-border bg-muted/60 px-3 py-2 text-sm">
        {state.success}
      </p>
    );
  }

  return null;
}

function SubmitButton({
  children,
  isPending,
}: {
  children: React.ReactNode;
  isPending: boolean;
}) {
  return (
    <Button className="h-11 w-full sm:w-auto" isDisabled={isPending} type="submit">
      {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}

function ProjectForm({ project }: { project?: ProfileProject }) {
  const [state, action, isPending] = useActionState(saveProjectAction, initialState);

  return (
    <form action={action} className="space-y-4 rounded-lg border border-border p-4">
      {project ? <input name="projectId" type="hidden" value={project.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>Project title</span>
          <input
            className={fieldClass}
            defaultValue={project?.title}
            name="title"
            required
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>Project URL</span>
          <input
            className={fieldClass}
            defaultValue={project?.projectUrl ?? ""}
            name="projectUrl"
            type="url"
          />
        </label>
      </div>
      <label className="space-y-2">
        <span className={labelClass}>Image URL</span>
        <input
          className={fieldClass}
          defaultValue={project?.imageUrl ?? ""}
          name="imageUrl"
          type="url"
        />
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Description</span>
        <textarea
          className={`${fieldClass} min-h-24 resize-y`}
          defaultValue={project?.description ?? ""}
          name="description"
        />
      </label>
      <ActionMessage state={state} />
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        {project ? (
          <Button
            className="h-11 w-full sm:w-auto"
            formAction={deleteProjectAction}
            variant="destructive"
          >
            <Trash2 aria-hidden="true" />
            Delete
          </Button>
        ) : (
          <span />
        )}
        <SubmitButton isPending={isPending}>
          {project ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {project ? "Save project" : "Add project"}
        </SubmitButton>
      </div>
    </form>
  );
}

function ExperienceForm({ experience }: { experience?: ProfileExperience }) {
  const [state, action, isPending] = useActionState(
    saveExperienceAction,
    initialState
  );

  return (
    <form action={action} className="space-y-4 rounded-lg border border-border p-4">
      {experience ? (
        <input name="experienceId" type="hidden" value={experience.id} />
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>Company</span>
          <input
            className={fieldClass}
            defaultValue={experience?.company}
            name="company"
            required
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>Position</span>
          <input
            className={fieldClass}
            defaultValue={experience?.position}
            name="position"
            required
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>Start date</span>
          <input
            className={fieldClass}
            defaultValue={experience?.startDate ?? ""}
            name="startDate"
            type="date"
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>End date</span>
          <input
            className={fieldClass}
            defaultValue={experience?.endDate ?? ""}
            name="endDate"
            type="date"
          />
        </label>
      </div>
      <label className="flex items-start gap-3 rounded-md border border-border p-3">
        <input
          className="mt-1 size-4"
          defaultChecked={experience?.isCurrent ?? false}
          name="isCurrent"
          type="checkbox"
        />
        <span className={labelClass}>I currently work here</span>
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Description</span>
        <textarea
          className={`${fieldClass} min-h-24 resize-y`}
          defaultValue={experience?.description ?? ""}
          name="description"
        />
      </label>
      <ActionMessage state={state} />
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        {experience ? (
          <Button
            className="h-11 w-full sm:w-auto"
            formAction={deleteExperienceAction}
            variant="destructive"
          >
            <Trash2 aria-hidden="true" />
            Delete
          </Button>
        ) : (
          <span />
        )}
        <SubmitButton isPending={isPending}>
          {experience ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {experience ? "Save experience" : "Add experience"}
        </SubmitButton>
      </div>
    </form>
  );
}

function selectedSkillSet(skills: ProfileSkill[]) {
  return new Set(skills.map((skill) => skill.id));
}

export function ProfileEditForm({
  departments,
  profile,
  skills,
  universities,
}: {
  departments: DepartmentOption[];
  profile: PublicProfile;
  skills: SkillOption[];
  universities: UniversityOption[];
}) {
  const [state, action, isPending] = useActionState(
    updateProfileAction,
    initialState
  );
  const [selectedUniversityId, setSelectedUniversityId] = useState(
    profile.details.universityId ?? ""
  );
  const filteredDepartments = useMemo(
    () =>
      departments.filter(
        (department) => department.university_id === selectedUniversityId
      ),
    [departments, selectedUniversityId]
  );
  const activeSkills = selectedSkillSet(profile.skills);

  return (
    <main className="min-h-dvh bg-muted/30 px-4 py-5 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <div>
          <Link
            className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-3"
            href="/profile"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Profile</span>
          </Link>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Profile</p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Edit your profile
            </h1>
          </div>
        </div>

        <ProfileSection
          description="Update your photo to help university peers and alumni recognize you."
          title="Profile picture"
        >
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-6 p-2">
            <AvatarUpload
              currentAvatarUrl={profile.avatarUrl}
              fullName={profile.fullName}
              size="xl"
            />
            <div className="text-center sm:text-left space-y-1.5">
              <h3 className="text-sm font-bold text-foreground">
                Upload custom profile photo
              </h3>
              <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                Click your avatar to upload a new picture. Photos are automatically cropped to your face and stored securely on Cloudinary CDN. Supported formats: JPG, PNG, WebP (max 5MB).
              </p>
            </div>
          </div>
        </ProfileSection>

        <ProfileSection title="Basic details">
          <form action={action} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClass}>Full name</span>
                <input
                  className={fieldClass}
                  defaultValue={profile.fullName ?? ""}
                  name="fullName"
                  required
                />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Username</span>
                <input
                  autoCapitalize="none"
                  className={fieldClass}
                  defaultValue={profile.username ?? ""}
                  name="username"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClass}>University</span>
                <select
                  className={fieldClass}
                  defaultValue={profile.details.universityId ?? ""}
                  name="universityId"
                  onChange={(event) => setSelectedUniversityId(event.target.value)}
                  required
                >
                  <option value="">Choose university</option>
                  {universities.map((university) => (
                    <option key={university.id} value={university.id}>
                      {university.short_name
                        ? `${university.name} (${university.short_name})`
                        : university.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Department</span>
                <select
                  className={fieldClass}
                  defaultValue={profile.details.departmentId ?? ""}
                  name="departmentId"
                  required
                >
                  <option value="">Choose department</option>
                  {filteredDepartments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.short_name
                        ? `${department.name} (${department.short_name})`
                        : department.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-2">
              <span className={labelClass}>Graduation year</span>
              <input
                className={fieldClass}
                defaultValue={profile.details.graduationYear ?? ""}
                inputMode="numeric"
                name="graduationYear"
                required
                type="number"
              />
            </label>

            {profile.details.role === "student" ? (
              <>
                <label className="flex items-start gap-3 rounded-md border border-border p-3">
                  <input
                    className="mt-1 size-4"
                    defaultChecked={profile.details.internshipAvailable}
                    name="internshipAvailable"
                    type="checkbox"
                  />
                  <span className={labelClass}>Available for internships</span>
                </label>
                <label className="space-y-2">
                  <span className={labelClass}>Availability description</span>
                  <textarea
                    className={`${fieldClass} min-h-24 resize-y`}
                    defaultValue={profile.details.availabilityText ?? ""}
                    name="availabilityText"
                  />
                </label>
              </>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className={labelClass}>Company</span>
                    <input
                      className={fieldClass}
                      defaultValue={profile.details.companyName ?? ""}
                      name="companyName"
                      required
                    />
                  </label>
                  <label className="space-y-2">
                    <span className={labelClass}>Job title</span>
                    <input
                      className={fieldClass}
                      defaultValue={profile.details.jobTitle ?? ""}
                      name="jobTitle"
                      required
                    />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className={labelClass}>Professional field</span>
                    <input
                      className={fieldClass}
                      defaultValue={profile.details.professionalField ?? ""}
                      name="professionalField"
                      required
                    />
                  </label>
                  <label className="space-y-2">
                    <span className={labelClass}>Years of experience</span>
                    <input
                      className={fieldClass}
                      defaultValue={profile.details.experienceYears ?? 0}
                      inputMode="numeric"
                      name="experienceYears"
                      required
                      type="number"
                    />
                  </label>
                </div>
              </>
            )}

            <fieldset className="space-y-3">
              <legend className={labelClass}>Skills</legend>
              <div className="grid max-h-64 gap-2 overflow-y-auto rounded-md border border-border p-3 sm:grid-cols-2 lg:grid-cols-3">
                {skills.map((skill) => (
                  <label
                    className="flex min-h-10 items-center gap-2 rounded-md px-2 text-sm hover:bg-muted"
                    key={skill.id}
                  >
                    <input
                      className="size-4 rounded border-input"
                      defaultChecked={activeSkills.has(skill.id)}
                      name="skillIds"
                      type="checkbox"
                      value={skill.id}
                    />
                    <span>{skill.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="space-y-2">
              <span className={labelClass}>Short bio</span>
              <textarea
                className={`${fieldClass} min-h-28 resize-y`}
                defaultValue={profile.bio ?? ""}
                name="bio"
                required
              />
            </label>

            <ActionMessage state={state} />
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
              <Link
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-muted transition-colors text-center"
                href="/profile"
              >
                Cancel
              </Link>
              <SubmitButton isPending={isPending}>
                <Save aria-hidden="true" />
                Save Changes
              </SubmitButton>
            </div>
          </form>
        </ProfileSection>

        <ProfileSection title="Projects">
          <div className="space-y-4">
            <ProjectForm />
            {profile.projects.map((project) => (
              <ProjectForm key={project.id} project={project} />
            ))}
          </div>
        </ProfileSection>

        {profile.details.role === "alumni" ? (
          <ProfileSection title="Work experience">
            <div className="space-y-4">
              <ExperienceForm />
              {profile.experiences.map((experience) => (
                <ExperienceForm key={experience.id} experience={experience} />
              ))}
            </div>
          </ProfileSection>
        ) : null}

        {/* Bottom Navigation Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border/80 dark:border-slate-800 bg-card p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Done making changes?
            </p>
            <p className="text-xs text-muted-foreground">
              Return to your public profile to see your updated details and activity.
            </p>
          </div>
          <Link
            className="inline-flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs sm:text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm text-center"
            href="/profile"
          >
            <ArrowLeft className="size-4" />
            <span>Return to Profile</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
