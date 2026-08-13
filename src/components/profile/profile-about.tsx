import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  GraduationCap,
  School,
} from "lucide-react";

import { ProfileSection } from "@/components/profile/profile-section";
import type { PublicProfile } from "@/lib/profile/types";

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: number | string | null | undefined;
}) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="space-y-1 rounded-lg border border-[#BFC9C3]/50 bg-[#F8FAF7] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#747875]">
        {label}
      </p>
      <p className="text-sm leading-6 text-[#191C1B]">{value}</p>
    </div>
  );
}

export function ProfileAbout({ profile }: { profile: PublicProfile }) {
  return (
    <ProfileSection title="About">
      <div className="space-y-5">
        <p className="text-sm leading-6 text-[#3F4945]">
          {profile.bio || "No bio added yet."}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            label="University"
            value={profile.details.universityName}
          />
          <DetailItem
            label="Department"
            value={profile.details.departmentName}
          />
          <DetailItem
            label="Graduation year"
            value={profile.details.graduationYear}
          />

          {profile.details.role === "student" ? (
            <>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#747875]">
                  Internship availability
                </p>
                <p className="flex items-center gap-2 text-sm leading-6 text-[#191C1B]">
                  <GraduationCap
                    className="size-4 text-[#0F5A47]"
                    aria-hidden="true"
                  />
                  {profile.details.internshipAvailable ? "Available" : "Not available"}
                </p>
              </div>
              <DetailItem
                label="Availability description"
                value={profile.details.availabilityText}
              />
            </>
          ) : (
            <>
              <DetailItem label="Company" value={profile.details.companyName} />
              <DetailItem label="Job title" value={profile.details.jobTitle} />
              <DetailItem
                label="Professional field"
                value={profile.details.professionalField}
              />
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#747875]">
                  Years of experience
                </p>
                <p className="flex items-center gap-2 text-sm leading-6 text-[#191C1B]">
                  <BriefcaseBusiness
                    className="size-4 text-[#0F5A47]"
                    aria-hidden="true"
                  />
                  {profile.details.experienceYears ?? 0}
                </p>
              </div>
            </>
          )}

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#747875]">
              Member type
            </p>
            <p className="flex items-center gap-2 text-sm capitalize leading-6 text-[#191C1B]">
              {profile.details.role === "student" ? (
                <School className="size-4 text-[#0F5A47]" aria-hidden="true" />
              ) : (
                <Building2 className="size-4 text-[#0F5A47]" aria-hidden="true" />
              )}
              {profile.details.role}
            </p>
          </div>
          <div className="space-y-1 rounded-lg border border-[#BFC9C3]/50 bg-[#F8FAF7] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#747875]">
              Graduation
            </p>
            <p className="flex items-center gap-2 text-sm leading-6 text-[#191C1B]">
              <CalendarDays className="size-4 text-[#0F5A47]" aria-hidden="true" />
              {profile.details.graduationYear ?? "Not set"}
            </p>
          </div>
        </div>
      </div>
    </ProfileSection>
  );
}
