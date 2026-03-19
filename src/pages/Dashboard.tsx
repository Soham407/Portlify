import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase, PenTool, Eye, Layout, BarChart3, Share2, Plus, Settings, LogOut,
  Copy, Trash2, Star, MoreVertical, Globe, Lock, ChevronRight, TrendingUp, Users, Zap,
  Twitter, Linkedin, CheckCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useProjects } from "@/hooks/useProjects";
import { useBio } from "@/hooks/useBio";
import { useSkills } from "@/hooks/useSkills";
import { useExperience } from "@/hooks/useExperience";
import { useEducation } from "@/hooks/useEducation";
import { useContact } from "@/hooks/useContact";
import { useCertifications } from "@/hooks/useCertifications";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { PORTFOLIO_TYPES } from "@/lib/constants";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const portfolioTypeColors: Record<string, string> = {
  general: "bg-blue-500/10 text-blue-700 border-blue-200/50",
  developer: "bg-violet-500/10 text-violet-700 border-violet-200/50",
  designer: "bg-pink-500/10 text-pink-700 border-pink-200/50",
  marketing: "bg-orange-500/10 text-orange-700 border-orange-200/50",
};

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | undefined>(undefined);
  const { portfolio, allPortfolios, createPortfolio, duplicatePortfolio, setDefaultPortfolio, deletePortfolio, updatePortfolio } = usePortfolio(selectedPortfolioId);
  const portfolioId = portfolio?.id;
  const { bio } = useBio(portfolioId);
  const { projects } = useProjects(portfolioId);
  const { skills } = useSkills(portfolioId);
  const { experiences } = useExperience(portfolioId);
  const { education } = useEducation(portfolioId);
  const { contact } = useContact(portfolioId);
  const { certifications } = useCertifications(portfolioId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [newName, setNewName] = useState("New Portfolio");
  const [newType, setNewType] = useState("general");
  const [copied, setCopied] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: viewCount } = useQuery({
    queryKey: ["viewCount", portfolioId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("portfolio_views")
        .select("*", { count: "exact", head: true })
        .eq("portfolio_id", portfolioId!);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!portfolioId,
  });

  const { data: weekViewCount } = useQuery({
    queryKey: ["weekViewCount", portfolioId],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from("portfolio_views")
        .select("*", { count: "exact", head: true })
        .eq("portfolio_id", portfolioId!)
        .gte("created_at", since);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!portfolioId,
  });

  const { data: dailyViews } = useQuery({
    queryKey: ["dailyViews", portfolioId],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("portfolio_views")
        .select("created_at")
        .eq("portfolio_id", portfolioId!)
        .gte("created_at", since)
        .order("created_at");
      if (error) throw error;
      // Group by date
      const counts: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        counts[d.toISOString().slice(0, 10)] = 0;
      }
      (data || []).forEach((row) => {
        const day = row.created_at.slice(0, 10);
        if (day in counts) counts[day] = (counts[day] || 0) + 1;
      });
      return Object.entries(counts).map(([date, views]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        views,
      }));
    },
    enabled: !!portfolioId,
  });

  const { data: recentViews } = useQuery({
    queryKey: ["recentViews", portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_views")
        .select("created_at, viewer_ip")
        .eq("portfolio_id", portfolioId!)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!portfolioId,
  });

  const { data: completion } = useQuery({
    queryKey: ["completion", portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_portfolio_completion", { p_portfolio_id: portfolioId! });
      if (error) throw error;
      return data as number;
    },
    enabled: !!portfolioId,
  });

  const selectedPortfolio = allPortfolios.find((item) => item.id === portfolioId) ?? portfolio;
  const builderHref = portfolioId ? `/builder?portfolio=${portfolioId}` : "/builder";
  const previewHref = portfolioId ? `/preview?portfolio=${portfolioId}` : "/preview";
  const templatesHref = portfolioId ? `/templates?portfolio=${portfolioId}` : "/templates";

  useEffect(() => {
    if (!selectedPortfolioId || allPortfolios.some((item) => item.id === selectedPortfolioId)) {
      return;
    }
    setSelectedPortfolioId(undefined);
  }, [allPortfolios, selectedPortfolioId]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleCreatePortfolio = () => {
    createPortfolio.mutate(
      { name: newName, portfolio_type: newType, user_type: profile?.user_type || "fresher" },
      {
        onSuccess: (created) => {
          toast({ title: "Portfolio created!" });
          setSelectedPortfolioId(created.id);
          setIsCreateOpen(false);
          setNewName("New Portfolio");
          setNewType("general");
          navigate(`/builder?portfolio=${created.id}`);
        },
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      }
    );
  };

  const handleDuplicate = (id: string) => {
    duplicatePortfolio.mutate(id, {
      onSuccess: (duplicated) => {
        setSelectedPortfolioId(duplicated.id);
        toast({ title: "Portfolio duplicated!" });
      },
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const handleSetDefault = (id: string) => {
    setDefaultPortfolio.mutate(id, {
      onSuccess: () => toast({ title: "Default portfolio updated!" }),
    });
  };

  const handleDelete = (id: string) => {
    if (allPortfolios.length <= 1) {
      toast({ title: "Cannot delete", description: "You need at least one portfolio", variant: "destructive" });
      return;
    }
    deletePortfolio.mutate(id, {
      onSuccess: () => toast({ title: "Portfolio deleted" }),
    });
  };

  const handleToggleVisibility = (id: string, currentPublic: boolean) => {
    updatePortfolio.mutate(
      { id, is_public: !currentPublic } as any,
      {
        onSuccess: () => toast({ title: !currentPublic ? "Portfolio is now public" : "Portfolio is now private" }),
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      }
    );
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/p/${profile?.username}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!" });
  };

  const handleNativeShare = async () => {
    const url = `${window.location.origin}/p/${profile?.username}`;
    await navigator.share({ title: "My Portfolio", url });
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "there";
  const initials = displayName.slice(0, 2).toUpperCase();
  const completionVal = completion ?? 0;

  // Completion nudges — which sections are missing
  const missingSections = [
    { id: "bio", filled: !!(bio?.first_name) },
    { id: "projects", filled: projects.length > 0 },
    { id: "skills", filled: skills.length > 0 },
    { id: "experience", filled: experiences.length > 0 },
    { id: "education", filled: education.length > 0 },
    { id: "contact", filled: !!(contact?.email) },
    { id: "certifications", filled: certifications.length > 0 },
  ].filter((s) => !s.filled);

  const stats = [
    {
      label: "Profile Views",
      value: String(viewCount ?? 0),
      sub: "Total views",
      icon: Users,
      color: "text-blue-600 bg-blue-500/10",
    },
    {
      label: "Completion",
      value: `${completionVal}%`,
      sub: completionVal < 100 ? "Keep adding sections" : "Complete!",
      icon: Zap,
      color: "text-violet-600 bg-violet-500/10",
      progress: completionVal,
    },
    {
      label: "Projects",
      value: `${projects.length}/5`,
      sub: "Add more projects",
      icon: Briefcase,
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: "Visibility",
      value: portfolio?.is_public ? "Public" : "Private",
      sub: portfolio?.is_public ? "Live on the web" : "Make it public",
      icon: TrendingUp,
      color: portfolio?.is_public ? "text-emerald-600 bg-emerald-500/10" : "text-muted-foreground bg-muted",
    },
  ];

  const publicUrl = `${window.location.origin}/p/${profile?.username}`;

  const relativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const quickActions = [
    { icon: PenTool, label: "Edit Portfolio", description: "Continue building", onClick: () => navigate(builderHref), color: "text-primary bg-primary/10", hoverBorder: "hover:border-primary/30", disabled: !portfolioId },
    { icon: Layout, label: "Templates", description: "Change template", onClick: () => navigate(templatesHref), color: "text-violet-600 bg-violet-500/10", hoverBorder: "hover:border-violet-200", disabled: !portfolioId },
    { icon: BarChart3, label: "Analytics", description: "View insights", onClick: () => setIsAnalyticsOpen(true), color: "text-orange-600 bg-orange-500/10", hoverBorder: "hover:border-orange-200", disabled: !portfolioId },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary transition-transform group-hover:scale-105">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">PortfolioBuilder</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground">
              <Link to={`${builderHref}${builderHref.includes("?") ? "&" : "?"}section=settings`}><Settings className="h-4 w-4" /></Link>
            </Button>

            {/* Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground ring-2 ring-background ring-offset-0 transition-opacity hover:opacity-90">
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`${builderHref}${builderHref.includes("?") ? "&" : "?"}section=settings`}><Settings className="mr-2 h-4 w-4" /> Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Welcome + New Portfolio */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {displayName} 👋</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {completionVal < 100
                  ? `Your portfolio is ${completionVal}% complete — keep going!`
                  : "Your portfolio is all set. Share it with the world!"}
              </p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <Button variant="hero" size="sm" onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> New Portfolio
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Portfolio</DialogTitle>
                  <DialogDescription>Add a new portfolio for different purposes.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Portfolio Name</Label>
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Job Application Portfolio" />
                  </div>
                  <div className="space-y-2">
                    <Label>Portfolio Type</Label>
                    <Select value={newType} onValueChange={setNewType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PORTFOLIO_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button variant="hero" onClick={handleCreatePortfolio} disabled={createPortfolio.isPending}>
                    {createPortfolio.isPending ? "Creating..." : "Create Portfolio"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Completion banner */}
          {completionVal < 100 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Portfolio Completion</span>
                <span className="text-sm font-semibold text-primary">{completionVal}%</span>
              </div>
              <Progress value={completionVal} className="h-2" />
              {missingSections.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Missing:</span>
                  {missingSections.map((s) => (
                    <Link
                      key={s.id}
                      to={`${builderHref}${builderHref.includes("?") ? "&" : "?"}section=${s.id}`}
                      className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                    >
                      {SECTION_LABELS[s.id]}
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
                  </div>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
                {stat.progress !== undefined && (
                  <Progress value={stat.progress} className="mt-3 h-1.5" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Two-column layout: Portfolios + Quick Actions */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Portfolios — 2 cols */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Your Portfolios</h2>
                <Badge variant="secondary" className="text-xs">{allPortfolios.length} total</Badge>
              </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {allPortfolios.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPortfolioId(p.id)}
                      className={`relative rounded-xl border bg-card p-4 shadow-card transition-all ${
                        p.id === portfolioId
                          ? "border-primary/40 ring-2 ring-primary/20"
                          : p.is_default
                            ? "border-primary/40 ring-1 ring-primary/10"
                            : "border-border hover:border-primary/20"
                      } cursor-pointer`}
                    >
                    {/* Color bar at top */}
                    <div className={`absolute left-0 right-0 top-0 h-1 rounded-t-xl bg-gradient-primary ${p.is_default ? "opacity-100" : "opacity-30"}`} />

                    <div className="flex items-start justify-between pt-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-semibold text-sm truncate">{p.name || "Untitled"}</h3>
                          {p.id === portfolioId && <Badge className="text-[10px] px-1.5 py-0">Selected</Badge>}
                          {p.is_default && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Default</Badge>}
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize ${portfolioTypeColors[p.portfolio_type || "general"] || "bg-muted text-muted-foreground border-border"}`}>
                            {p.portfolio_type || "general"}
                          </span>
                          {(p as any).visibility === 'share_only' ? (
                            <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0"><Share2 className="h-2.5 w-2.5" /> Share Only</Badge>
                          ) : p.is_public ? (
                            <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0 text-emerald-600 border-emerald-200"><Globe className="h-2.5 w-2.5" /> Public</Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0"><Lock className="h-2.5 w-2.5" /> Private</Badge>
                          )}
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">{p.template_id || "minimal"} template</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 ml-1"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDuplicate(p.id)}>
                            <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                          </DropdownMenuItem>
                          {!p.is_default && (
                            <DropdownMenuItem onClick={() => handleSetDefault(p.id)}>
                              <Star className="mr-2 h-3.5 w-3.5" /> Set as Default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleVisibility(p.id, p.is_public ?? false)}>
                            {p.is_public
                              ? <><Lock className="mr-2 h-3.5 w-3.5" /> Make Private</>
                              : <><Globe className="mr-2 h-3.5 w-3.5" /> Make Public</>}
                          </DropdownMenuItem>
                          {allPortfolios.length > 1 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-[11px] text-muted-foreground">
                        {p.id === portfolioId ? "Active portfolio" : "Click card to select"}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/preview?portfolio=${p.id}`);
                        }}
                      >
                        <Eye className="mr-1 h-3 w-3" /> Preview
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions — 1 col */}
            <div>
              <h2 className="mb-4 font-semibold">Quick Actions</h2>
              {selectedPortfolio && (
                <div className="mb-3 rounded-xl border border-border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Selected portfolio</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{selectedPortfolio.name || "Untitled"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Quick actions below will apply only to this portfolio.</p>
                </div>
              )}
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={`flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-left shadow-card transition-all duration-200 ${action.hoverBorder} hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${action.color}`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Share Banner */}
          <div className="mt-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-sm">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Share Your Portfolio</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile?.username
                      ? `${selectedPortfolio?.name || "Selected portfolio"} will be shared at /p/${profile.username}`
                      : "Set a username in settings to get a public URL"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="hero"
                  size="sm"
                  disabled={!profile?.username || !portfolio?.is_public}
                  onClick={() => setIsShareOpen(true)}
                >
                  Share Portfolio
                </Button>
              </div>
            </div>
          </div>

        </motion.div>
      </main>

      {/* Share Modal */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Portfolio</DialogTitle>
            <DialogDescription>
              {!profile?.username
                ? "Set a username first to get your public URL."
                : !portfolio?.is_public
                ? "Make your portfolio public to share it."
                : "Share your portfolio with the world."}
            </DialogDescription>
          </DialogHeader>
          {!profile?.username || !portfolio?.is_public ? (
            <div className="py-2">
              <Button variant="hero" asChild className="w-full">
                <Link to={`${builderHref}${builderHref.includes("?") ? "&" : "?"}section=settings`} onClick={() => setIsShareOpen(false)}>
                  <Settings className="mr-2 h-4 w-4" />
                  {!profile?.username ? "Set Username in Settings" : "Make Portfolio Public in Settings"}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Your public URL</Label>
                <div className="flex gap-2">
                  <Input value={publicUrl} readOnly className="flex-1 text-sm" />
                  <Button size="sm" variant="outline" onClick={handleCopyLink}>
                    {copied ? <CheckCheck className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {typeof navigator.share !== "undefined" && (
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleNativeShare}>
                    <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  asChild
                >
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(publicUrl)}&text=${encodeURIComponent("Check out my portfolio!")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="mr-1.5 h-3.5 w-3.5" /> Twitter
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  asChild
                >
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="mr-1.5 h-3.5 w-3.5" /> LinkedIn
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Portfolio Analytics</DialogTitle>
            <DialogDescription>
              {selectedPortfolio?.name ? `Insights for ${selectedPortfolio.name}` : "Insights for the selected portfolio"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="mt-1 text-3xl font-bold">{viewCount ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">Last 7 Days</p>
                <p className="mt-1 text-3xl font-bold">{weekViewCount ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">Recent Visitors</p>
                <div className="mt-2 space-y-1.5">
                  {(recentViews || []).length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No views yet</p>
                  ) : (
                    recentViews!.map((v, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Visitor</span>
                        <span className="text-muted-foreground">{relativeTime(v.created_at)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="mb-4 text-sm font-medium">Views - Last 7 Days</p>
              {(dailyViews || []).length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={dailyViews} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <Bar dataKey="views" radius={[4, 4, 0, 0]} className="fill-primary" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[180px] items-center justify-center">
                  <p className="text-sm text-muted-foreground">No view data yet</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
