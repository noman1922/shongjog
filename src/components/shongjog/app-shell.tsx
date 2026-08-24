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
import { getPendingConnectionCount } from "@/lib/connections/data";
import { getUnreadMessageCount } from "@/lib/messages/data";
import type { PublicProfile, ViewerProfile } from "@/lib/profile/types";

const mobileNavItems = [
  { activeLabel: "Home", href: "/dashboard", icon: Home, label: "Feed" },
  { activeLabel: "Discover", href: "/discover", icon: Compass, label: "Discover" },
  { activeLabel: "Circles", href: "/connections", icon: Users, label: "Circles" },
  { activeLabel: "Opportunities", href: "/opportunities", icon: BriefcaseBusiness, label: "Opportunities" },
  { activeLabel: "Messages", href: "/messages", icon: Mail, label: "Messages" },
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
  const [unreadMessages, pendingConnections] = await Promise.all([
    getUnreadMessageCount(),
    getPendingConnectionCount(),
  ]);

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-background text-foreground transition-colors duration-200">
      {/* Top Floating Pill Header */}
      <AppHeader
        active={active}
        pendingConnections={pendingConnections}
        profile={profile}
        unreadMessages={unreadMessages}
      />

      {/* Main Page Area with ample top clearance for floating header & bottom clearance for mobile nav */}
      <main className="pt-24 sm:pt-28 pb-32 sm:pb-24 md:pb-12 min-h-screen">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden transition-colors duration-200"
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
                  <span className="absolute -top-1 -right-2 flex size-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-950 animate-pulse">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                ) : null}
                {item.label === "Circles" && pendingConnections > 0 ? (
                  <span className="absolute -top-1 -right-2 flex size-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-950 animate-pulse">
                    {pendingConnections > 9 ? "9+" : pendingConnections}
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
