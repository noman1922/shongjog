import {
  BriefcaseBusiness,
  Compass,
  Home,
  Mail,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { AppHeader } from "@/components/shongjog/app-header";
import { getUnreadMessageCount } from "@/lib/messages/data";
import type { PublicProfile, ViewerProfile } from "@/lib/profile/types";

const mobileNavItems = [
  { href: "/dashboard", icon: Home, label: "Feed", activeLabel: "Home" },
  { href: "/discover", icon: Compass, label: "Discover", activeLabel: "Discover" },
  { href: "/connections", icon: Users, label: "Circles", activeLabel: "Circles" },
  { href: "/opportunities", icon: BriefcaseBusiness, label: "Opportunities", activeLabel: "Opportunities" },
  { href: "/messages", icon: Mail, label: "Messages", activeLabel: "Messages" },
];

export async function AppShell({
  active = "Home",
  children,
  profile,
}: {
  active?: string;
  children: ReactNode;
  profile: ViewerProfile | PublicProfile;
}) {
  const unreadMessages = await getUnreadMessageCount();

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground transition-colors duration-200">
      {/* Top Floating Pill Header */}
      <AppHeader
        active={active}
        profile={profile}
        unreadMessages={unreadMessages}
      />

      {/* Main Page Area */}
      <main className="pt-24 pb-20 sm:pb-12 min-h-screen">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border/80 dark:border-slate-800 bg-card/95 dark:bg-slate-900/95 backdrop-blur-md px-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden transition-colors duration-200"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isSelected =
            active === item.activeLabel ||
            (item.activeLabel === "Home" && (active === "Feed" || active === "Home"));

          return (
            <Link
              className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors ${
                isSelected
                  ? "text-primary dark:text-blue-400 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              href={item.href}
              key={item.label}
            >
              <div className="relative">
                <Icon className="size-5" />
                {item.label === "Messages" && unreadMessages > 0 ? (
                  <span className="absolute -top-1 -right-2 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                ) : null}
              </div>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
