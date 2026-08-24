import { AuthEntryPanel } from "@/components/landing/auth-entry-panel";
import { ShongjogBrand } from "@/components/shongjog/brand";
import { ThemeToggle } from "@/components/shongjog/theme-toggle";

function friendlyPageError(error: string) {
  const messages: Record<string, string> = {
    auth_callback: "Authentication could not be completed. Please try again.",
    missing_origin: "Authentication could not start from this page. Please try again.",
    oauth_start_failed: "Authentication could not start. Please try again.",
  };

  return messages[error] ?? error;
}

function statusMessage(error?: string, signup?: string) {
  if (error) {
    return {
      className: "border-destructive/30 bg-destructive/10 text-destructive",
      text: friendlyPageError(error),
    };
  }

  if (signup === "check_email") {
    return {
      className: "border-primary/30 bg-primary/10 text-primary",
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
    <main className="w-full min-h-screen flex flex-col md:flex-row overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* Left Side: Visual / Brand Area matching newlogin.html */}
      <section className="hidden md:flex flex-col justify-between w-1/2 lg:w-5/12 bg-gradient-to-br from-[#0050cb] to-[#0066ff] p-8 lg:p-12 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo Header */}
        <div className="relative z-10 flex items-center justify-between">
          <ShongjogBrand href="/" inverted variant="horizontal" />
          <ThemeToggle className="text-white/80 hover:text-white hover:bg-white/10" />
        </div>

        {/* Center Copy */}
        <div className="relative z-10 space-y-4 my-auto py-12">
          <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white">
            University Circles · Bangladesh
          </span>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-white leading-tight">
            Connect with your world.
          </h1>
          <p className="text-sm lg:text-base text-white/90 max-w-md leading-relaxed">
            Join your university student and alumni network. Build connections, share achievements, find mentors, and discover career opportunities.
          </p>
        </div>

        {/* Feature Pills Footer */}
        <div className="relative z-10 grid grid-cols-3 gap-2.5 pt-6 border-t border-white/20">
          <div className="rounded-xl bg-white/10 backdrop-blur-md p-3">
            <p className="text-xs font-bold text-white">Connect</p>
            <p className="text-[11px] text-white/80 mt-0.5">Students & Alumni</p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur-md p-3">
            <p className="text-xs font-bold text-white">Discover</p>
            <p className="text-[11px] text-white/80 mt-0.5">Skills & Projects</p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur-md p-3">
            <p className="text-xs font-bold text-white">Opportunities</p>
            <p className="text-[11px] text-white/80 mt-0.5">Internships & Jobs</p>
          </div>
        </div>

        {/* Floating Glass Cards Decoration matching newlogin.html */}
        <div className="absolute right-[-10%] top-[20%] w-64 h-48 bg-white/10 backdrop-blur-md rounded-[24px] border border-white/20 transform rotate-[-5deg] shadow-[0_12px_32px_rgba(0,0,0,0.12)] pointer-events-none" />
        <div className="absolute right-[5%] bottom-[20%] w-56 h-40 bg-white/10 backdrop-blur-md rounded-[24px] border border-white/20 transform rotate-[10deg] shadow-[0_12px_32px_rgba(0,0,0,0.12)] pointer-events-none" />
      </section>

      {/* Right Side: Login & Registration Panel matching newlogin.html */}
      <section className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-card overflow-y-auto min-h-screen">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Top Header */}
          <div className="flex items-center justify-between md:hidden mb-6">
            <ShongjogBrand href="/" variant="horizontal" />
            <ThemeToggle />
          </div>

          {/* Status / Error Message */}
          {message ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-xs sm:text-sm leading-relaxed ${message.className}`}
            >
              {message.text}
            </div>
          ) : null}

          {/* Auth Entry Panel Component */}
          <AuthEntryPanel />

          <p className="text-center text-[11px] text-muted-foreground leading-relaxed pt-4">
            Secured with Supabase Authentication. Choose your student or alumni profile type immediately after registration.
          </p>
        </div>
      </section>
    </main>
  );
}
