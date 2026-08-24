"use client";

import {
  BriefcaseBusiness,
  Compass,
  Home,
  LogOut,
  Mail,
  Menu,
  Search,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { signOutAction } from "@/app/profile/actions";
import { ShongjogBrand } from "@/components/shongjog/brand";
import { ThemeToggle } from "@/components/shongjog/theme-toggle";
import { LogoutConfirmationModal } from "@/components/ui/logout-confirmation-modal";
import type { PublicProfile, ViewerProfile } from "@/lib/profile/types";

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

function NavAvatar({
  profile,
  size = "md",
}: {
  profile: ViewerProfile | PublicProfile;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "size-8" : "size-9";
  const isStudent = profile.details.role === "student";

  if (profile.avatarUrl) {
    return (
      <Image
        alt={profile.fullName || "User Avatar"}
        className={`${sizeClass} rounded-full object-cover ring-2 ${
          isStudent ? "ring-primary/40" : "ring-emerald-500/40"
        }`}
        height={size === "sm" ? 32 : 36}
        src={profile.avatarUrl}
        width={size === "sm" ? 32 : 36}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs ring-2 ring-primary/30`}
    >
      {initials(profile.fullName)}
    </div>
  );
}

export function AppHeader({
  active = "Home",
  pendingConnections = 0,
  profile,
  unreadMessages = 0,
}: {
  active?: string;
  pendingConnections?: number;
  profile: ViewerProfile | PublicProfile;
  unreadMessages?: number;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const isStudent = profile.details.role === "student";

  const navLinks = [
    { activeLabel: "Home", href: "/dashboard", icon: Home, label: "Home" },
    { activeLabel: "Discover", href: "/discover", icon: Compass, label: "Discover" },
    { activeLabel: "Circles", href: "/connections", icon: Users, label: "Circles" },
    { activeLabel: "Opportunities", href: "/opportunities", icon: BriefcaseBusiness, label: "Opportunities" },
  ];

  return (
    <>
      {/* Floating Pill TopNavBar matching newdesign-day & newdesign-night */}
      <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-full border border-border/80 dark:border-slate-800 bg-card/95 dark:bg-slate-900/95 px-4 sm:px-6 shadow-md backdrop-blur-md transition-colors duration-200">
          {/* Left section: Hamburger (mobile), Logo icon & Text */}
          <div className="flex items-center gap-3 lg:gap-4">
            <button
              aria-label="Open mobile menu"
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground md:hidden cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
              type="button"
            >
              <Menu className="size-5" />
            </button>

            <ShongjogBrand href="/dashboard" variant="horizontal" />

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2 ml-2">
              {navLinks.map((item) => {
                const isItemActive =
                  active === item.activeLabel ||
                  (item.activeLabel === "Home" && (active === "Feed" || active === "Home"));
                const Icon = item.icon;

                return (
                  <Link
                    className={`relative flex items-center gap-2 rounded-full px-4 lg:px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                      isItemActive
                        ? "bg-primary text-white shadow-sm scale-95"
                        : "text-muted-foreground hover:bg-muted dark:hover:bg-slate-800 hover:text-foreground"
                    }`}
                    href={item.href}
                    key={item.label}
                  >
                    <div className="relative">
                      <Icon className="size-4" />
                      {item.label === "Circles" && pendingConnections > 0 ? (
                        <span className="absolute -top-1.5 -right-2 flex size-3.5 items-center justify-center rounded-full bg-rose-600 text-[8px] font-bold text-white ring-1 ring-card">
                          {pendingConnections > 9 ? "9+" : pendingConnections}
                        </span>
                      ) : null}
                    </div>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Center/Right: Search bar */}
          <form
            action="/discover"
            className="relative hidden sm:block w-48 md:w-56 lg:w-72 mx-2"
          >
            <input
              className="w-full rounded-full border border-border/70 dark:border-slate-700 bg-muted/60 dark:bg-slate-800/80 py-2 pl-9 pr-4 text-xs lg:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              name="q"
              placeholder="Search people, skills..."
              type="search"
            />
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </form>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Role indicator badge */}
            <span className="hidden xl:inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/20 px-3 py-1 text-xs font-semibold text-primary dark:text-blue-300">
              {isStudent ? "Student View" : "Alumni Mentor"}
            </span>

            {/* Messages link */}
            <Link
              aria-label="Messages"
              className={`relative flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted dark:hover:bg-slate-800 hover:text-foreground transition-colors ${
                active === "Messages" ? "bg-muted text-primary" : ""
              }`}
              href="/messages"
            >
              <Mail className="size-5" />
              {unreadMessages > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-card">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              ) : null}
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile Avatar with Dropdown */}
            <div className="relative">
              <button
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label="User menu"
                className="flex items-center rounded-full p-0.5 transition-transform hover:scale-105 ml-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
                onClick={() => setDropdownOpen((prev) => !prev)}
                type="button"
              >
                <NavAvatar profile={profile} size="sm" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-border/80 dark:border-slate-800 bg-card p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2.5 border-b border-border/60 dark:border-slate-800">
                      <p className="font-bold text-xs text-foreground truncate">
                        {profile.fullName}
                      </p>
                      <p className="text-[11px] text-muted-foreground capitalize">
                        {profile.details.role} Account
                      </p>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="size-4 text-muted-foreground" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                        href="/profile/edit"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="size-4 text-muted-foreground" />
                        <span>Settings & Edit</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-border/60 dark:border-slate-800">
                      <button
                        className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        onClick={() => {
                          setDropdownOpen(false);
                          setIsLogoutModalOpen(true);
                        }}
                        type="button"
                      >
                        <LogOut className="size-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md p-6 overflow-y-auto md:hidden animate-in fade-in duration-200">
          <div className="flex justify-between items-center pb-6 border-b border-border/80">
            <div className="flex items-center gap-3">
              <ShongjogBrand href="/dashboard" variant="icon" />
              <div>
                <p className="font-bold text-base text-foreground">Shongjog</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {profile.details.role} Account
                </p>
              </div>
            </div>
            <button
              aria-label="Close menu"
              className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
              type="button"
            >
              <X className="size-6" />
            </button>
          </div>

          <form action="/discover" className="mt-6 mb-4">
            <div className="relative">
              <input
                className="w-full rounded-full border border-border bg-muted/80 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                name="q"
                placeholder="Search..."
                type="search"
              />
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </form>

          <div className="flex flex-col gap-2 mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 mb-1">
              Navigation
            </p>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isItemActive = active === item.activeLabel;

              return (
                <Link
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-base font-semibold transition-colors ${
                    isItemActive
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-muted"
                  }`}
                  href={item.href}
                  key={item.label}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-3.5">
                    <Icon className="size-5" />
                    <span>{item.label}</span>
                  </span>
                  {item.label === "Circles" && pendingConnections > 0 ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-rose-600 text-white text-[11px] font-bold">
                      {pendingConnections}
                    </span>
                  ) : null}
                </Link>
              );
            })}
            <Link
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-base font-semibold transition-colors ${
                active === "Messages"
                  ? "bg-primary text-white"
                  : "text-foreground hover:bg-muted"
              }`}
              href="/messages"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-3.5">
                <Mail className="size-5" />
                <span>Messages</span>
              </span>
              {unreadMessages > 0 ? (
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                  {unreadMessages}
                </span>
              ) : null}
            </Link>

            <div className="border-t border-border/80 my-4" />

            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 mb-1">
              Account
            </p>
            <Link
              className="flex items-center gap-3.5 rounded-2xl px-4 py-3 text-base font-semibold text-foreground hover:bg-muted"
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="size-5" />
              <span>My Profile</span>
            </Link>
            <Link
              className="flex items-center gap-3.5 rounded-2xl px-4 py-3 text-base font-semibold text-foreground hover:bg-muted"
              href="/profile/edit"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="size-5" />
              <span>Edit Profile & Settings</span>
            </Link>

            <button
              className="flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-base font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer mt-4"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsLogoutModalOpen(true);
              }}
              type="button"
            >
              <LogOut className="size-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
