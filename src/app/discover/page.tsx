import { Search } from "lucide-react";
import { redirect } from "next/navigation";

import { DiscoveryOpportunityCard } from "@/components/discover/discovery-opportunity-card";
import { DiscoveryProfileCard } from "@/components/discover/discovery-profile-card";
import { DiscoveryProjectCard } from "@/components/discover/discovery-project-card";
import { AppShell } from "@/components/shongjog/app-shell";
import { ShongjogCard } from "@/components/shongjog/surface";
import { searchDiscover } from "@/lib/discover/data";
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
  const results = await searchDiscover(params.q ?? "");
  const hasQuery = results.query.length >= 2;
  const hasResults =
    results.people.length > 0 ||
    results.projects.length > 0 ||
    results.research.length > 0 ||
    results.opportunities.length > 0;

  return (
    <AppShell active="Discover" profile={profile}>
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
        <ShongjogCard className="p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#14B8A6]">
            Smart Discover
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#191C1B]">
            Search people, skills, projects, research, opportunities...
          </h1>
          <form className="relative mt-5" action="/discover">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#747875]"
            />
            <input
              className="min-h-12 w-full rounded-full border border-[#BFC9C3] bg-[#F8FAF7] pl-11 pr-4 text-base outline-none transition focus:border-[#0F5A47] focus:ring-4 focus:ring-[#0F5A47]/15"
              defaultValue={results.query}
              name="q"
              placeholder="Search people, skills, projects, research, opportunities..."
              type="search"
            />
          </form>
          <p className="mt-3 text-sm leading-6 text-[#747875]">
            Press Enter to search. The navbar search uses this same Discover
            page, so it does not query the database on every keystroke.
          </p>
        </ShongjogCard>

        {!hasQuery ? (
          <ShongjogCard className="mt-6 p-5">
            <p className="text-sm leading-6 text-[#3F4945]">
              Try searches like React Developer, App Development, Flutter,
              Machine Learning, Medical Image Learning, or Fulbright Scholarship.
              Results use bounded PostgreSQL search and deterministic ranking.
            </p>
          </ShongjogCard>
        ) : null}

        {hasQuery && !hasResults ? (
          <ShongjogCard className="mt-6 p-5">
            <h2 className="text-xl font-bold text-[#191C1B]">No results found</h2>
            <p className="mt-2 text-sm leading-6 text-[#3F4945]">
              No public profiles, projects, or opportunities matched
              “{results.query}”. Try a related skill, technology, company, or
              project topic.
            </p>
          </ShongjogCard>
        ) : null}

        {hasResults ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <main className="space-y-8">
              {results.people.length > 0 ? (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#191C1B]">People</h2>
                    <p className="mt-1 text-sm text-[#747875]">
                      Ranked by relevance, skills, projects, experience, academic
                      proximity, and profile completeness.
                    </p>
                  </div>
                  {results.people.map((person) => (
                    <DiscoveryProfileCard key={person.id} person={person} />
                  ))}
                </section>
              ) : null}

              {results.projects.length > 0 ? (
                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-[#191C1B]">Projects</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {results.projects.map((project) => (
                      <DiscoveryProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                </section>
              ) : null}

              {results.research.length > 0 ? (
                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-[#191C1B]">Research</h2>
                </section>
              ) : null}
            </main>

            <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
              {results.opportunities.length > 0 ? (
                <section className="space-y-4">
                  <h2 className="text-xl font-bold text-[#191C1B]">
                    Opportunities
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
        ) : null}
      </div>
    </AppShell>
  );
}

