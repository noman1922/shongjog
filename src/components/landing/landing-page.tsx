import { AuthEntryPanel } from "@/components/landing/auth-entry-panel";

function friendlyPageError(error: string) {
  const messages: Record<string, string> = {
    auth_callback: "Authentication could not be completed. Please try again.",
    missing_origin: "Authentication could not start from this page. Please try again.",
    oauth_start_failed: "Google sign-in could not start. Please try again.",
  };

  return messages[error] ?? error;
}

function statusMessage(error?: string, signup?: string) {
  if (error) {
    return {
      className: "border-red-200 bg-red-50 text-red-700",
      text: friendlyPageError(error),
    };
  }

  if (signup === "check_email") {
    return {
      className: "border-[#14B8A6]/30 bg-[#14B8A6]/10 text-[#0F5A47]",
      text: "Check your email to confirm your account, then return to Shongjog to continue onboarding.",
    };
  }

  return null;
}

export function LandingPage({
  error,
  signup,
}: {
  error?: string;
  signup?: string;
}) {
  const message = statusMessage(error, signup);

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#F8FAF7] px-4 py-6 text-[#191C1B] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="mx-auto w-full max-w-xl lg:mx-0">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Shongjog logo"
              className="size-14 shrink-0 object-contain sm:size-16"
              src="/brand/logo.png"
            />
            <div className="min-w-0">
              <p className="text-2xl font-bold tracking-tight text-[#0F5A47] sm:text-3xl">
                Shongjog
              </p>
              <p className="text-sm font-medium text-[#747875]">
                Student and alumni network
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm font-bold uppercase tracking-wide text-[#14B8A6]">
              University circles, built for Bangladesh
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#191C1B] sm:text-4xl lg:text-5xl">
              Welcome to Shongjog
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-[#3F4945] sm:text-lg">
              Connect with students and alumni, discover opportunities, and grow
              through trusted academic communities.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Connect", "Discover", "Opportunities"].map((item) => (
              <div
                className="rounded-xl border border-[#BFC9C3] bg-white/80 p-4 shadow-[0_8px_24px_rgba(30,41,59,0.04)]"
                key={item}
              >
                <p className="text-sm font-bold text-[#0F5A47]">{item}</p>
                <p className="mt-2 text-xs leading-5 text-[#3F4945]">
                  {item === "Connect"
                    ? "Build your student-alumni circle."
                    : item === "Discover"
                      ? "Find people, projects, and skills."
                      : "Explore roles, internships, and guidance."}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-md lg:max-w-lg">
          {message ? (
            <p
              className={`mb-4 rounded-xl border px-4 py-3 text-sm leading-6 ${message.className}`}
            >
              {message.text}
            </p>
          ) : null}
          <AuthEntryPanel />
          <p className="mt-4 text-center text-xs leading-5 text-[#747875]">
            Email and Google both use Supabase Auth. You will complete your
            Student or Alumni profile after account access is confirmed.
          </p>
        </section>
      </div>
    </main>
  );
}
