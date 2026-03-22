import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import TemplatesShowcase from "@/components/landing/TemplatesShowcase";
import LandingFeedback from "@/components/landing/LandingFeedback";
import Footer from "@/components/landing/Footer";
import { useAuth } from "@/contexts/AuthContext";
import type { LandingAuthState } from "@/components/landing/types";

const Index = () => {
  const { user, loading } = useAuth();
  const authenticated = !loading && !!user;
  const authState: LandingAuthState = loading
    ? "loading"
    : authenticated
      ? "authenticated"
      : "anonymous";

  return (
    <div className="app-shell min-h-screen">
      <Header authState={authState} />
      <Hero authState={authState} />
      <Features />
      <HowItWorks />
      <TemplatesShowcase authState={authState} />
      <LandingFeedback userId={user?.id} />
      <Footer />
    </div>
  );
};

export default Index;
