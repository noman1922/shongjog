import {
  BriefcaseBusiness,
  Edit3,
  GraduationCap,
  LogOut,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { signOutAction } from "@/app/profile/actions";
import { SkillPill } from "@/components/shongjog/surface";
import { Button, LinkButton } from "@/components/ui/button";
import type { PublicProfile } from "@/lib/profile/types";

function initials(name: string | null) {
  return (
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S"
  );
}

export function ProfileHeader({
  connectionActions,
  messageAction,
  profile,
}: {
  connectionActions?: ReactNode;
  messageAction?: ReactNode;
  profile: PublicProfile;
}) {
  const academicLine = [
    profile.details.departmentName,
    profile.details.universityName,
  ]
    .filter(Boolean)
    .join(", ");
  const isStudent = profile.details.role === "student";
  const subtitle =
    profile.details.role === "alumni"
      ? [profile.details.jobTitle, profile.details.companyName]
          .filter(Boolean)
          .join(" at ") || profile.details.professionalField
      : [profile.details.departmentName, profile.details.universityName]
          .filter(Boolean)
          .join(" • ");

  return (
    <header className="overflow-hidden rounded-xl border border-[#BFC9C3] bg-white shadow-[0_4px_16px_rgba(30,41,59,0.06)]">
      {isStudent ? (
        <div className="h-32 bg-[linear-gradient(135deg,#0F5A47,#14B8A6)] sm:h-44" />
      ) : (
        <div className="h-20 bg-[#F2F4F1] sm:h-24" />
      )}
      <div className="relative p-5 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
            <div className="-mt-20 shrink-0 sm:-mt-24">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
                    className={`size-28 rounded-full border-4 border-white object-cover shadow-lg sm:size-32 ${
                      isStudent ? "" : "ring-2 ring-[#0F5A47]"
                    }`}
              src={profile.avatarUrl}
            />
          ) : (
                <div
                  className={`flex size-28 items-center justify-center rounded-full border-4 border-white bg-[#E6E9E5] text-3xl font-bold text-[#0F5A47] shadow-lg sm:size-32 ${
                    isStudent ? "" : "ring-2 ring-[#0F5A47]"
                  }`}
                >
              {initials(profile.fullName)}
            </div>
          )}
              {isStudent ? (
                <span className="absolute ml-20 -mt-8 flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#0F5A47] text-white">
                  <ShieldCheck aria-hidden="true" className="size-4" />
                </span>
              ) : (
                <span className="absolute ml-20 -mt-8 inline-flex min-h-7 items-center gap-1 rounded-full border border-white bg-[#0F5A47] px-2 text-xs font-semibold text-white shadow">
                  <ShieldCheck aria-hidden="true" className="size-3" />
                  Mentor
                </span>
              )}
            </div>

            <div className="min-w-0 space-y-3">
            <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <span className="inline-flex min-h-7 items-center gap-1 rounded-full border border-[#BFC9C3] bg-[#F2F4F1] px-2.5 text-xs font-semibold capitalize text-[#3F4945]">
                    {isStudent ? (
                      <GraduationCap aria-hidden="true" className="size-3.5 text-[#0F5A47]" />
                    ) : (
                      <BriefcaseBusiness aria-hidden="true" className="size-3.5 text-[#0F5A47]" />
                    )}
                    {isStudent ? "Verified Student" : "Alumni Mentor"}
                  </span>
                  {profile.details.graduationYear ? (
                    <span className="inline-flex min-h-7 items-center rounded-full border border-[#BFC9C3] bg-[#F8FAF7] px-2.5 text-xs font-semibold text-[#3F4945]">
                      Class of {profile.details.graduationYear}
                    </span>
                  ) : null}
                </div>
                <h1 className="break-words text-3xl font-bold tracking-tight text-[#191C1B] sm:text-4xl">
                {profile.fullName}
              </h1>
                <p className="mt-1 break-all text-sm font-medium text-[#747875]">
                @{profile.username}
              </p>
                {subtitle ? (
                  <p className="mt-2 text-base leading-7 text-[#3F4945] sm:text-lg">
                    {subtitle}
                  </p>
                ) : null}
            </div>

            {academicLine ? (
                <p className="flex items-start gap-2 text-sm leading-6 text-[#3F4945]">
                  <MapPin
                    className="mt-1 size-4 shrink-0 text-[#0F5A47]"
                    aria-hidden="true"
                  />
                <span>{academicLine}</span>
              </p>
            ) : null}
              {profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.slice(0, 3).map((skill) => (
                    <SkillPill key={skill.id}>{skill.name}</SkillPill>
                  ))}
                </div>
              ) : null}
          </div>
        </div>

        {profile.isOwner ? (
            <div className="flex w-full flex-col gap-2 sm:w-auto">
            <LinkButton
                className="h-11 w-full border-[#0F5A47] text-[#0F5A47] sm:w-auto"
              href="/profile/edit"
              size="lg"
              variant="outline"
            >
              <Edit3 aria-hidden="true" />
              Edit profile
            </LinkButton>
            <LinkButton
                className="h-11 w-full border-[#0F5A47] text-[#0F5A47] sm:w-auto"
              href="/connections"
              size="lg"
              variant="outline"
            >
              <Users aria-hidden="true" />
              Circles
            </LinkButton>
            <form action={signOutAction}>
              <Button
                  className="h-11 w-full text-red-700 sm:w-auto"
                size="lg"
                type="submit"
                variant="ghost"
              >
                <LogOut aria-hidden="true" />
                Logout
              </Button>
            </form>
          </div>
        ) : (
            <div className="flex w-full flex-col gap-2 sm:w-auto">
              {connectionActions}
              {messageAction ?? (
                <Button
                  className="h-11 w-full border-[#1E293B] text-[#1E293B] opacity-60 sm:w-auto"
                  isDisabled
                  type="button"
                  variant="outline"
                >
                  <MessageCircle aria-hidden="true" />
                  Message
                </Button>
              )}
            </div>
        )}
        </div>
      </div>
    </header>
  );
}
