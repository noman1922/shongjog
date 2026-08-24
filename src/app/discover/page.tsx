import { Compass, Search, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { DiscoveryOpportunityCard } from "@/components/discover/discovery-opportunity-card";
import { DiscoveryProfileCard } from "@/components/discover/discovery-profile-card";
import { DiscoveryProjectCard } from "@/components/discover/discovery-project-card";
import { SuggestedConnectionsGrid } from "@/components/discover/suggested-connections";
import { AppShell } from "@/components/shongjog/app-shell";
import { ShongjogCard } from "@/components/shongjog/surface";
import { getSuggestedConnections, searchDiscover } from "@/lib/discover/data";
import { getOnboardingStatus } from "@/lib/onboarding/status";
import { getOwnProfile } from "@/lib/profile/data";
import { createClient } from "@/lib/supabase/server";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const status = await getOnboardingStatus();

  if (!status.completed) {
    redirect("/onboarding");
  }

  if (status.role === "admin") {
    redirect("/admin");
  }

  const profile = await getOwnProfile();

  if (!profile) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const [results, suggestedConnections] = await Promise.all([
    searchDiscover(params.q ?? ""),
    getSuggestedConnections(9),
  ]);

  const hasQuery = results.query.length >= 2;
  const hasResults =
    results.people.length > 0 ||
    results.projects.length > 0 ||
    results.research.length > 0 ||
    results.opportunities.length > 0;

  return (
    <AppShell active="Discover" profile={profile}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 space-y-8">
        {/* Search Hero Banner */}
        <ShongjogCard className="p-6 sm:p-8 bg-gradient-to-br from-card via-card to-primary/5 border-border/80">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Smart Network Discovery
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Search students, alumni, skills, projects & opportunities
          </h1>

          <form className="relative mt-5 max-w-3xl" action="/discover">
            <Search
              aria-hidden="true"
              className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              className="h-12 sm:h-14 w-full rounded-full border border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/80 pl-12 pr-6 text-sm sm:text-base text-foreground outline-none shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground"
              defaultValue={results.query}
              name="q"
              placeholder="Search by name, skill (e.g. React, ML), university, company, or topic..."
              type="search"
            />
          </form>

          {/* Quick Filter Tags */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Suggested:</span>
            {["React Developer", "Machine Learning", "Software Engineer", "BUET", "Internship", "Mobile App"].map(
              (tag) => (
                <a
                  className="rounded-full border border-border/80 bg-muted/60 dark:bg-slate-800/60 px-3 py-1 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                  href={`/discover?q=${encodeURIComponent(tag)}`}
                  key={tag}
                >
                  {tag}
                </a>
              )
            )}
          </div>
        </ShongjogCard>

        {/* Initial View: People You May Know & Quick Exploration Categories */}
        {!hasQuery ? (
          <div className="space-y-8">
            {/* Suggested Connections Grid */}
            <SuggestedConnectionsGrid suggestions={suggestedConnections} />

            {/* University Exploration Prompt */}
            <div className="space-y-6">
              <ShongjogCard className="p-6 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                  <Compass className="size-6" />
                </div>
                <h3 className="font-bold text-lg text-foreground">
                  Explore your university ecosystem
                </h3>
                <p className="mx-auto mt-1 max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Find verified students, alumni mentors in leading tech companies, student portfolio projects, and open internship positions across Bangladesh.
                </p>
              </ShongjogCard>

              {/* Quick Explore Categories */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ShongjogCard className="p-5 hover:border-primary/40 transition-colors">
                  <h4 className="font-bold text-sm text-foreground mb-2">
                    🚀 By Technology & Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {["React", "Next.js", "Python", "Machine Learning", "TypeScript", "Tailwind", "Node.js", "Docker"].map(
                      (skill) => (
                        <a
                          className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                          href={`/discover?q=${encodeURIComponent(skill)}`}
                          key={skill}
                        >
                          {skill}
                        </a>
                      )
                    )}
                  </div>
                </ShongjogCard>

                <ShongjogCard className="p-5 hover:border-primary/40 transition-colors">
                  <h4 className="font-bold text-sm text-foreground mb-2">
                    🎓 By Top Universities
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {["BUET", "Dhaka University", "NSU", "BRAC University", "IUT", "SUST", "RUET", "CUET"].map(
                      (uni) => (
                        <a
                          className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                          href={`/discover?q=${encodeURIComponent(uni)}`}
                          key={uni}
                        >
                          {uni}
                        </a>
                      )
                    )}
                  </div>
                </ShongjogCard>

                <ShongjogCard className="p-5 hover:border-primary/40 transition-colors sm:col-span-2 lg:col-span-1">
                  <h4 className="font-bold text-sm text-foreground mb-2">
                    💼 By Opportunity & Roles
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {["Software Engineer", "Internship", "Frontend", "Backend", "AI Engineer", "Data Scientist"].map(
                      (role) => (
                        <a
                          className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                          href={`/discover?q=${encodeURIComponent(role)}`}
                          key={role}
                        >
                          {role}
                        </a>
                      )
                    )}
                  </div>
                </ShongjogCard>
              </div>
            </div>
          </div>
        ) : null}

        {/* No Results */}
        {hasQuery && !hasResults ? (
          <div className="space-y-8">
            <ShongjogCard className="p-8 text-center">
              <h2 className="text-lg font-bold text-foreground">No direct matches found</h2>
              <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
                No profiles, projects, or opportunities matched “{results.query}”. Try searching for a related technology, skill, or department.
              </p>
            </ShongjogCard>

            <SuggestedConnectionsGrid suggestions={suggestedConnections} />
          </div>
        ) : null}

        {/* Results Grid */}
        {hasResults ? (
          <div className="space-y-10">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <main className="space-y-8">
                {results.people.length > 0 ? (
                  <section className="space-y-4">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">People ({results.people.length})</h2>
                      <p className="text-xs text-muted-foreground">
                        Matching students, alumni, and verified university members.
                      </p>
                    </div>
                    <div className="space-y-3.5">
                      {results.people.map((person) => (
                        <DiscoveryProfileCard key={person.id} person={person} />
                      ))}
                    </div>
                  </section>
                ) : null}

                {results.projects.length > 0 ? (
                  <section className="space-y-4">
                    <h2 className="text-lg font-bold text-foreground">Projects ({results.projects.length})</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {results.projects.map((project) => (
                        <DiscoveryProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  </section>
                ) : null}
              </main>

              <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                {results.opportunities.length > 0 ? (
                  <section className="space-y-3.5">
                    <h2 className="text-lg font-bold text-foreground">
                      Opportunities ({results.opportunities.length})
                    </h2>
                    {results.opportunities.map((opportunity) => (
                      <DiscoveryOpportunityCard
                        key={opportunity.id}
                        opportunity={opportunity}
                      />
                    ))}
                  </section>
                ) : null}
              </aside>
            </div>

            {/* Suggested Connections below results */}
            <SuggestedConnectionsGrid suggestions={suggestedConnections} />
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
