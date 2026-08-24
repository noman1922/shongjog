"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

const emptySubscribe = () => () => {};

export function ThemeToggle({ className = "" }: { className?: string }) {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const isDark = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const toggleTheme = () => {
    const nextDark = !isDark;
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("shongjog-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("shongjog-theme", "light");
    }
  };

  if (!isHydrated) {
    return (
      <button
        aria-label="Toggle dark mode"
        className={`flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${className}`}
        type="button"
      >
        <Moon className="size-5" />
      </button>
    );
  }

  return (
    <button
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      className={`flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted dark:hover:bg-slate-800 hover:text-foreground dark:hover:text-white transition-all duration-200 ${className}`}
      onClick={toggleTheme}
      title={isDark ? "Switch to day mode" : "Switch to night mode"}
      type="button"
    >
      {isDark ? (
        <Sun className="size-5 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="size-5 text-slate-600 transition-transform -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
