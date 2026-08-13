import {
  Bell,
  BriefcaseBusiness,
  CircleHelp,
  Compass,
  Home,
  Mail,
  Search,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { signOutAction } from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { ShongjogBrand } from "@/components/shongjog/brand";
import { getUnreadMessageCount } from "@/lib/messages/data";
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

function Avatar({ profile, size = "md" }: { profile: PublicProfile; size?: "sm" | "md" }) {
  const className =
    size === "sm"
      ? "size-10 rounded-full"
      : "size-16 rounded-full border-2 border-[#0F5A47]/20";

  if (profile.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt="" className={`${className} object-cover`} src={profile.avatarUrl} />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center bg-[#E6E9E5] font-semibold text-[#0F5A47]`}
    >
      {initials(profile.fullName)}
    </div>
  );
}

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/discover", icon: Compass, label: "Discover" },
  { href: "/connections", icon: Users, label: "Circles" },
  { href: "/opportunities", icon: BriefcaseBusiness, label: "Opportunities" },
  { href: "/messages", icon: Mail, label: "Messages" },
];

export async function AppShell({
  active = "Home",
  children,
  profile,
}: {
  active?: string;
  children: ReactNode;
  profile: PublicProfile;
}) {
  const isStudent = profile.details.role === "student";
  const academicLine = profile.details.universityName || profile.details.departmentName;
  const unreadMessages = await getUnreadMessageCount();

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#F8FAF7] text-[#191C1B]">
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[#BFC9C3] bg-[#F8FAF7]/95 px-4 shadow-sm backdrop-blur sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <ShongjogBrand compact />
          <form action="/discover" className="relative hidden w-full max-w-md md:block">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#747875]"
            />
            <input
              className="h-10 w-full rounded-full border border-[#BFC9C3] bg-[#F2F4F1] pl-9 pr-4 text-sm outline-none transition focus:border-[#0F5A47] focus:ring-4 focus:ring-[#0F5A47]/15"
              name="q"
              placeholder="Search opportunities, alumni, skills..."
              type="search"
            />
          </form>
        </div>
        <nav className="hidden items-center gap-5 lg:flex">
          {["Discover", "Circles", "Opportunities"].map((item) => (
            <Link
              className="text-sm font-medium text-[#3F4945] transition hover:text-[#0F5A47]"
              href={
                item === "Circles"
                  ? "/connections"
                  : item === "Opportunities"
                    ? "/opportunities"
                    : "/discover"
              }
              key={item}
            >
              {item}
            </Link>
          ))}
          <span className="rounded border border-[#BFC9C3] bg-[#E6E9E5] px-2 py-1 text-xs font-medium text-[#3F4945]">
            {isStudent ? "Student View" : "Alumni View"}
          </span>
          <Link
            aria-label="Alerts"
            className="rounded-full p-2 text-[#3F4945] transition hover:bg-[#E6E9E5] hover:text-[#0F5A47]"
            href="#alerts"
          >
            <Bell aria-hidden="true" className="size-5" />
          </Link>
          <Link
            aria-label="Messages"
            className="relative rounded-full p-2 text-[#3F4945] transition hover:bg-[#E6E9E5] hover:text-[#0F5A47]"
            href="/messages"
          >
            <Mail aria-hidden="true" className="size-5" />
            {unreadMessages > 0 ? (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#0F5A47] text-[10px] font-bold text-white">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            ) : null}
          </Link>
          <Link
            aria-label="Profile"
            className="rounded-full p-1 transition hover:bg-[#E6E9E5]"
            href="/profile"
          >
            <Avatar profile={profile} size="sm" />
          </Link>
        </nav>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 z-40 hidden w-64 flex-col border-r border-[#BFC9C3] bg-[#F8FAF7] p-4 lg:flex">
        <section className="mb-6 rounded-xl border border-[#BFC9C3]/60 bg-[#F2F4F1] p-3 text-center">
          <div className="mb-3 flex justify-center">
            <Avatar profile={profile} />
          </div>
          <h2 className="truncate font-semibold text-[#191C1B]">
            {profile.fullName}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm text-[#3F4945]">{academicLine}</p>
          {profile.details.role === "student" ? (
            <p className="mt-3 rounded-lg border border-[#BFC9C3]/70 bg-white px-3 py-2 text-xs font-medium text-[#3F4945]">
              {profile.details.internshipAvailable
                ? "Available for Internship"
                : "Building profile"}
            </p>
          ) : (
            <p className="mt-3 rounded-full bg-[#ACF1D7] px-3 py-1 text-xs font-semibold text-[#00513F]">
              Active Mentor
            </p>
          )}
        </section>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = active === item.label;
            return (
              <Link
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  selected
                    ? "bg-[#D5E0F8] text-[#1E293B]"
                    : "text-[#3F4945] hover:bg-[#ECEEEB] hover:text-[#0F5A47]"
                }`}
                href={item.href}
                key={item.label}
              >
                <Icon aria-hidden="true" className="size-5" />
                {item.label}
                {item.label === "Messages" && unreadMessages > 0 ? (
                  <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-[#0F5A47] text-[10px] font-bold text-white">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#BFC9C3] pt-3">
          <Link
            className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#3F4945] hover:bg-[#ECEEEB]"
            href="#help"
          >
            <CircleHelp aria-hidden="true" className="size-4" />
            Help Center
          </Link>
          <Link
            className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#3F4945] hover:bg-[#ECEEEB]"
            href="#privacy"
          >
            <Shield aria-hidden="true" className="size-4" />
            Privacy
          </Link>
          <Link
            className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#3F4945] hover:bg-[#ECEEEB]"
            href="/profile/edit"
          >
            <Settings aria-hidden="true" className="size-4" />
            Settings
          </Link>
          <form action={signOutAction}>
            <Button
              className="mt-1 h-10 w-full justify-start px-3 text-red-700 hover:bg-red-50"
              type="submit"
              variant="ghost"
            >
              Logout
            </Button>
          </form>
        </div>
      </aside>

      <main className="pt-16 lg:pl-64">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-[#BFC9C3] bg-[#F8FAF7] px-2 shadow-[0_-4px_12px_rgba(30,41,59,0.08)] lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const selected = active === item.label;
          return (
            <Link
              className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] ${
                selected ? "text-[#0F5A47]" : "text-[#3F4945]"
              }`}
              href={item.href}
              key={item.label}
            >
              <Icon aria-hidden="true" className="size-5" />
              {item.label === "Messages" && unreadMessages > 0 ? (
                <span className="absolute mt-[-1.7rem] ml-5 flex size-4 items-center justify-center rounded-full bg-[#0F5A47] text-[9px] font-bold text-white">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              ) : null}
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
