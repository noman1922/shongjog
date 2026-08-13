import { LandingPage } from "@/components/landing/landing-page";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    signup?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return <LandingPage error={params.error} signup={params.signup} />;
}

