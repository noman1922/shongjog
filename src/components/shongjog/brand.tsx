import Link from "next/link";

export function ShongjogBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      className="flex min-w-0 items-center gap-2 text-[#0F5A47]"
      href="/profile"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className={compact ? "size-9 object-contain" : "size-11 object-contain"}
        src="/brand/logo.png"
      />
      <span
        className={
          compact
            ? "text-lg font-bold tracking-tight"
            : "text-xl font-bold tracking-tight sm:text-2xl"
        }
      >
        Shongjog
      </span>
    </Link>
  );
}

