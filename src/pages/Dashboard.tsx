import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  LogOut,
  Plus,
  Settings,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreatePortfolioDialog from "@/components/dashboard/CreatePortfolioDialog";
import DashboardStatsGrid from "@/components/dashboard/DashboardStatsGrid";
import PortfolioCard from "@/components/dashboard/PortfolioCard";
import SharePortfolioDialog from "@/components/dashboard/SharePortfolioDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useProjects } from "@/hooks/useProjects";
import { useBio } from "@/hooks/useBio";
import { useSkills } from "@/hooks/useSkills";
import { useExperience } from "@/hooks/useExperience";
import { useEducation } from "@/hooks/useEducation";
import { useContact } from "@/hooks/useContact";
import { useCertifications } from "@/hooks/useCertifications";
import { usePortfolioCardPreviews } from "@/hooks/usePortfolioCardPreviews";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VISIBILITY_OPTIONS } from "@/lib/constants";
import {
  getPortfolioShareUrl,
} from "@/lib/portfolioSharing";
import { useEffect, useRef, useState, useTransition } from "react";

const SECTION_LABELS: Record<string, string> = {
  bio: "Bio",
  projects: "Projects",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  contact: "Contact",
  certifications: "Certifications",
};

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | undefined>(undefined);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sharePortfolioId, setSharePortfolioId] = useState<string | undefined>(undefined);
  const [newName, setNewName] = useState("New Portfolio");
  const [newType, setNewType] = useState("general");
  const [copied, setCopied] = useState(false);
  const [, startPortfolioSwitch] = useTransition();
  const portfolioSelectionRequestRef = useRef(0);

  const {
    portfolio,
    allPortfolios,
    isLoading,
    isLoadingAll,
    createPortfolio,
    duplicatePortfolio,
    setDefaultPortfolio,
    deletePortfolio,
    updatePortfolio,
  } = usePortfolio(selectedPortfolioId);
  const { previews: portfolioCardPreviews } = usePortfolioCardPreviews(
    allPortfolios,
    profile?.user_type
  );

  const portfolioId = portfolio?.id;
  const { bio } = useBio(portfolioId);
  const { projects } = useProjects(portfolioId);
  const { skills } = useSkills(portfolioId);
  const { experiences } = useExperience(portfolioId);
  const { education } = useEducation(portfolioId);
  const { contact } = useContact(portfolioId);
  const { certifications } = useCertifications(portfolioId);
  const { viewCount, completion, isLoading: metricsLoading } = useDashboardMetrics(portfolioId);

  const sharePortfolio =
    allPortfolios.find((item) => item.id === sharePortfolioId) ??
    (portfolio?.id === sharePortfolioId ? portfolio : undefined);

  const builderHref = portfolioId ? `/builder?portfolio=${portfolioId}` : "/builder";
  const shareTargetBuilderHref = sharePortfolioId ? `/builder?portfolio=${sharePortfolioId}` : builderHref;

  const shareTargetUrl = getPortfolioShareUrl({
    origin: window.location.origin,
    username: profile?.username,
    portfolio: sharePortfolio,
  });

  useEffect(() => {
    if (!selectedPortfolioId || allPortfolios.some((item) => item.id === selectedPortfolioId)) {
      return;
    }

    setSelectedPortfolioId(undefined);
  }, [allPortfolios, selectedPortfolioId]);

  const prefetchPortfolioDashboardData = async (nextPortfolioId: string) => {
    if (!user) return;

    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: ["portfolio", nextPortfolioId, user.id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("portfolios")
            .select("*")
            .eq("id", nextPortfolioId)
            .eq("user_id", user.id)
            .single();

          if (error) throw error;
          return data;
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ["bio", nextPortfolioId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("bio_sections")
            .select("*")
            .eq("portfolio_id", nextPortfolioId)
            .maybeSingle();

          if (error) throw error;
          return data;
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ["projects", nextPortfolioId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("portfolio_projects")
            .select("*")
            .eq("portfolio_id", nextPortfolioId)
            .order("display_order");

          if (error) throw error;
          return (data || []).map((project) => ({
            ...project,
            solution: project.solution_approach,
          }));
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ["skills", nextPortfolioId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("skills")
            .select("*")
            .eq("portfolio_id", nextPortfolioId)
            .order("display_order");

          if (error) throw error;
          return data || [];
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ["experience", nextPortfolioId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("experiences")
            .select("*")
            .eq("portfolio_id", nextPortfolioId)
            .order("display_order");

          if (error) throw error;
          return data || [];
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ["education", nextPortfolioId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("education")
            .select("*")
            .eq("portfolio_id", nextPortfolioId)
            .order("display_order");

          if (error) throw error;
          return data || [];
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ["contact", nextPortfolioId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("contact_info")
            .select("*")
            .eq("portfolio_id", nextPortfolioId)
            .maybeSingle();

          if (error) throw error;
          return data;
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ["certifications", nextPortfolioId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("certifications")
            .select("*")
            .eq("portfolio_id", nextPortfolioId)
            .order("display_order");

          if (error) throw error;
          return data || [];
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ["dashboard", "viewCount", nextPortfolioId],
        queryFn: async () => {
          const { count, error } = await supabase
            .from("portfolio_views")
            .select("*", { count: "exact", head: true })
            .eq("portfolio_id", nextPortfolioId);

          if (error) throw error;
          return count ?? 0;
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ["dashboard", "completion", nextPortfolioId],
        queryFn: async () => {
          const { data, error } = await supabase.rpc("get_portfolio_completion", {
            p_portfolio_id: nextPortfolioId,
          });

          if (error) throw error;
          return data as number;
        },
      }),
    ]);
  };

  const handleSelectPortfolio = (nextPortfolioId: string) => {
    if (nextPortfolioId === portfolioId) return;

    const requestId = ++portfolioSelectionRequestRef.current;
    void prefetchPortfolioDashboardData(nextPortfolioId).finally(() => {
      if (portfolioSelectionRequestRef.current !== requestId) return;

      startPortfolioSwitch(() => {
        setSelectedPortfolioId(nextPortfolioId);
      });
    });
  };

  const handleShareDialogChange = (open: boolean) => {
    setIsShareOpen(open);
    if (!open) {
      setCopied(false);
      setSharePortfolioId(undefined);
    }
  };

  const handleOpenShare = (portfolioIdToShare: string | undefined) => {
    setSharePortfolioId(portfolioIdToShare);
    setIsShareOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleCreatePortfolio = () => {
    createPortfolio.mutate(
      {
        name: newName,
        portfolio_type: newType,
        user_type: profile?.user_type || "fresher",
      },
      {
        onSuccess: (created) => {
          toast({ title: "Portfolio created!" });
          setSelectedPortfolioId(created.id);
          setIsCreateOpen(false);
          setNewName("New Portfolio");
          setNewType("general");
          navigate(`/builder?portfolio=${created.id}`);
        },
        onError: (error) =>
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          }),
      }
    );
  };

  const handleDuplicate = (id: string) => {
    duplicatePortfolio.mutate(id, {
      onSuccess: (duplicated) => {
        setSelectedPortfolioId(duplicated.id);
        toast({ title: "Portfolio duplicated!" });
      },
      onError: (error) =>
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        }),
    });
  };

  const handleSetDefault = (id: string) => {
    setDefaultPortfolio.mutate(id, {
      onSuccess: () => toast({ title: "Default portfolio updated!" }),
    });
  };

  const handleDelete = (id: string) => {
    if (allPortfolios.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "You need at least one portfolio",
        variant: "destructive",
      });
      return;
    }

    deletePortfolio.mutate(id, {
      onSuccess: () => toast({ title: "Portfolio deleted" }),
    });
  };

  const handleSetVisibility = (id: string, visibility: string) => {
    if (visibility === "public" && !profile?.username) {
      toast({
        title: "Set a username before making a portfolio public",
        description: "Public portfolios need a username so the public URL can resolve.",
        variant: "destructive",
      });
      return;
    }

    updatePortfolio.mutate(
      { id, visibility },
      {
        onSuccess: () => toast({ title: `Portfolio visibility set to ${visibility}` }),
        onError: (error) =>
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          }),
      }
    );
  };

  const handleCopyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!" });
  };

  const handleNativeShare = async (url: string) => {
    if (typeof navigator.share === "undefined") return;
    await navigator.share({ title: "My Professional Portfolio", url });
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "there";
  const initials = displayName.slice(0, 2).toUpperCase();
  const completionVal = completion ?? 0;
  const missingSections = [
    { id: "bio", filled: Boolean(bio?.first_name) },
    { id: "projects", filled: projects.length > 0 },
    { id: "skills", filled: skills.length > 0 },
    { id: "experience", filled: experiences.length > 0 },
    { id: "education", filled: education.length > 0 },
    { id: "contact", filled: Boolean(contact?.email) },
    { id: "certifications", filled: certifications.length > 0 },
  ].filter((section) => !section.filled);

  const stats = [
    {
      label: "Profile Views",
      value: String(viewCount ?? 0),
      sub: "Total views",
      icon: Users,
      color: "text-foreground bg-secondary",
    },
    {
      label: "Completion",
      value: `${completionVal}%`,
      sub: completionVal < 100 ? "Keep adding sections" : "Complete!",
      icon: Zap,
      color: "text-primary bg-primary/10",
      progress: completionVal,
    },
    {
      label: "Projects",
      value: `${projects.length}/5`,
      sub: "Add more projects",
      icon: Briefcase,
      color: "text-accent-foreground bg-accent/30",
    },
    {
      label: "Visibility",
      value:
        portfolio?.visibility === "unlisted"
          ? "Unlisted"
          : portfolio?.visibility === "public"
            ? "Public"
            : "Private",
      sub:
        portfolio?.visibility === "public"
          ? "Live on the web"
          : portfolio?.visibility === "unlisted"
            ? "Secret share link"
            : "Only you can view it",
      icon: TrendingUp,
      color:
        portfolio?.visibility === "public"
          ? "text-primary bg-primary/10"
          : portfolio?.visibility === "unlisted"
            ? "text-accent-foreground bg-accent/30"
            : "text-muted-foreground bg-muted",
    },
  ];

  if (profileLoading || isLoading || isLoadingAll || metricsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary transition-transform group-hover:scale-105">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Portlify</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground">
              <Link to={`${builderHref}${builderHref.includes("?") ? "&" : "?"}section=settings`}>
                <Settings className="h-4 w-4" />
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground ring-2 ring-background ring-offset-0 transition-opacity hover:opacity-90">
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-semibold">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`${builderHref}${builderHref.includes("?") ? "&" : "?"}section=settings`}>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {displayName}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {completionVal < 100
                  ? `Your portfolio is ${completionVal}% complete - keep going!`
                  : "Your portfolio is all set. Share it with the world!"}
              </p>
            </div>
            <Button variant="hero" size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> New Portfolio
            </Button>
          </div>

          <CreatePortfolioDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            newName={newName}
            newType={newType}
            onNameChange={setNewName}
            onTypeChange={setNewType}
            onCreate={handleCreatePortfolio}
            isCreating={createPortfolio.isPending}
          />

          {completionVal < 100 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="surface-panel mb-8 rounded-[1.7rem] p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Portfolio Completion</span>
                <span className="text-sm font-semibold text-primary">{completionVal}%</span>
              </div>
              <Progress value={completionVal} className="h-2" />
              {missingSections.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Missing:</span>
                  {missingSections.map((section) => (
                    <Link
                      key={section.id}
                      to={`${builderHref}${builderHref.includes("?") ? "&" : "?"}section=${section.id}`}
                      className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                    >
                      {SECTION_LABELS[section.id]}
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          <DashboardStatsGrid stats={stats} />

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Your Portfolios</h2>
              <Badge variant="secondary" className="text-xs">
                {allPortfolios.length} total
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allPortfolios.map((item) => (
                <PortfolioCard
                  key={item.id}
                  portfolio={item}
                  preview={portfolioCardPreviews[item.id]}
                  isSelected={item.id === portfolioId}
                  viewCount={viewCount}
                  canDelete={allPortfolios.length > 1}
                  visibilityOptions={VISIBILITY_OPTIONS}
                  onSelect={handleSelectPortfolio}
                  onShare={handleOpenShare}
                  onDuplicate={handleDuplicate}
                  onSetDefault={handleSetDefault}
                  onSetVisibility={handleSetVisibility}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      <SharePortfolioDialog
        open={isShareOpen}
        onOpenChange={handleShareDialogChange}
        portfolio={sharePortfolio}
        username={profile?.username}
        builderHref={shareTargetBuilderHref}
        shareUrl={shareTargetUrl}
        copied={copied}
        onCopyLink={handleCopyLink}
        onNativeShare={handleNativeShare}
      />
    </div>
  );
};

export default Dashboard;
