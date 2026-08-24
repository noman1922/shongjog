import Image from "next/image";
import Link from "next/link";

export function ShongjogBrand({
  className = "",
  compact = false,
  href = "/dashboard",
  inverted = false,
  priority = true,
  variant = "horizontal",
}: {
  className?: string;
  compact?: boolean;
  href?: string;
  inverted?: boolean;
  priority?: boolean;
  variant?: "icon" | "horizontal" | "full" | "admin";
}) {
  const iconSize = compact ? 32 : 36;

  if (variant === "icon") {
    return (
      <Link
        aria-label="Shongjog Home"
        className={`group inline-flex shrink-0 items-center justify-center transition-transform hover:scale-105 ${className}`}
        href={href}
      >
        <Image
          alt="Shongjog"
          className="size-8 sm:size-9 rounded-xl object-contain shadow-xs transition-shadow group-hover:shadow-md"
          height={iconSize}
          priority={priority}
          src="/icon.png"
          width={iconSize}
        />
      </Link>
    );
  }

  if (variant === "admin") {
    return (
      <Link
        aria-label="Shongjog Admin Portal"
        className={`group inline-flex items-center gap-2.5 transition-transform hover:scale-[1.01] ${className}`}
        href={href}
      >
        <Image
          alt="Shongjog"
          className="size-8 sm:size-9 rounded-xl object-contain shadow-xs"
          height={iconSize}
          priority={priority}
          src="/icon.png"
          width={iconSize}
        />
        <div className="flex items-center gap-2">
          <span
            className={`text-xl font-bold tracking-tight ${
              inverted
                ? "text-white"
                : "text-zinc-900 dark:text-white"
            }`}
          >
            Shongjog
          </span>
          <span className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[11px] font-bold text-purple-600 dark:text-purple-400">
            Admin
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      aria-label="Shongjog Home"
      className={`group inline-flex items-center gap-2.5 transition-transform hover:scale-[1.01] ${className}`}
      href={href}
    >
      <Image
        alt="Shongjog"
        className="size-8 sm:size-9 rounded-xl object-contain shadow-xs transition-shadow group-hover:shadow-md"
        height={iconSize}
        priority={priority}
        src="/icon.png"
        width={iconSize}
      />
      <span
        className={`text-xl font-bold tracking-tight ${
          inverted
            ? "text-white"
            : "text-zinc-900 dark:text-white"
        }`}
      >
        Shongjog
      </span>
    </Link>
  );
}
