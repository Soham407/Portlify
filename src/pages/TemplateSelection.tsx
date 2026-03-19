import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useToast } from "@/hooks/use-toast";
import { TEMPLATES } from "@/lib/constants";

/** Mini visual previews that mimic each template's actual look */
const TemplateThumbnail = ({ templateId }: { templateId: string }) => {
  if (templateId === "minimal") {
    // Glass — dark gradient + glowing pill tags
    return (
      <div className="aspect-[4/3] rounded-lg overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
        <div className="p-3 flex flex-col gap-2 h-full">
          {/* Avatar glow */}
          <div className="mx-auto mt-2 h-7 w-7 rounded-full" style={{ background: "linear-gradient(135deg,#a78bfa,#60a5fa)", boxShadow: "0 0 12px #a78bfa88" }} />
          {/* Name bars */}
          <div className="mx-auto h-1.5 w-20 rounded-full bg-white/30" />
          <div className="mx-auto h-1 w-14 rounded-full" style={{ background: "#a78bfa66" }} />
          {/* Skill pills */}
          <div className="mt-1 flex flex-wrap justify-center gap-1">
            {[10, 14, 10, 12, 8].map((w, i) => (
              <div key={i} className="h-2 rounded-full" style={{ width: `${w * 3}px`, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }} />
            ))}
          </div>
          {/* Cards */}
          <div className="mt-auto grid grid-cols-2 gap-1">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-md p-1.5 h-8" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="h-1 w-10 rounded bg-white/20 mb-1" />
                <div className="h-1 w-8 rounded" style={{ background: "#a78bfa44" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "developer") {
    // Night Owl — dark #0d1117, teal accents
    return (
      <div className="aspect-[4/3] rounded-lg overflow-hidden" style={{ background: "#0d1117" }}>
        <div className="p-3 flex flex-col gap-2 h-full">
          {/* Navbar */}
          <div className="flex items-center justify-between">
            <div className="h-1.5 w-16 rounded font-mono" style={{ background: "#2DD4BF44" }} />
            <div className="flex gap-1">
              {[0, 1, 2].map(i => <div key={i} className="h-1.5 w-6 rounded bg-white/10" />)}
            </div>
          </div>
          {/* Hero — split layout */}
          <div className="flex items-start gap-2 mt-1">
            <div className="flex-1">
              <div className="mb-1 h-1 w-10 rounded" style={{ background: "#2DD4BF33", border: "1px solid #2DD4BF44" }} />
              <div className="h-2.5 w-24 rounded bg-white/25" />
              <div className="mt-1 h-1.5 w-16 rounded" style={{ background: "#2DD4BF66" }} />
              <div className="mt-2 flex gap-1">
                <div className="h-3 w-12 rounded" style={{ background: "#2DD4BF" }} />
                <div className="h-3 w-8 rounded" style={{ background: "#161b22", border: "1px solid #30363d" }} />
              </div>
            </div>
            <div className="h-14 w-12 rounded-lg flex-shrink-0" style={{ background: "#161b22", border: `2px solid #2DD4BF44` }} />
          </div>
          {/* Project row */}
          <div className="mt-auto space-y-1">
            {[0, 1].map(i => (
              <div key={i} className="flex gap-1.5 rounded p-1.5" style={{ background: "#161b22", border: "1px solid #30363d" }}>
                <div className="h-5 w-6 rounded flex-shrink-0" style={{ background: "#2DD4BF18" }} />
                <div className="flex-1">
                  <div className="h-1.5 w-14 rounded bg-white/20" />
                  <div className="mt-0.5 flex gap-1">
                    <div className="h-1 w-5 rounded" style={{ background: "#2DD4BF33" }} />
                    <div className="h-1 w-4 rounded" style={{ background: "#2DD4BF33" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "creative") {
    // Vibrant — white bg, lime accent, bold
    return (
      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-white">
        <div className="p-0 flex flex-col h-full">
          {/* Dark hero section */}
          <div className="bg-black px-3 pt-3 pb-3 flex-shrink-0">
            <div className="h-2 w-20 rounded-sm bg-white/20 mb-1" />
            <div className="h-4 w-28 rounded-sm" style={{ background: "rgba(255,255,255,0.9)", fontWeight: 900 }} />
            <div className="mt-1 inline-block h-2.5 w-16 rounded-full px-2" style={{ background: "#CBFF4D" }} />
          </div>
          {/* Lime strip */}
          <div className="h-1.5 w-full flex-shrink-0" style={{ background: "#CBFF4D" }} />
          {/* Skill grid */}
          <div className="p-2 grid grid-cols-4 gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-5 rounded-md text-center flex items-center justify-center"
                style={{ background: "#f5f5f5", border: "1.5px solid #e5e5e5" }}>
                <div className="h-1 w-4 rounded bg-gray-300" />
              </div>
            ))}
          </div>
          {/* Project cards */}
          <div className="px-2 grid grid-cols-2 gap-1">
            {[["#F3E8FF", "#C084FC"], ["#FEF9C3", "#FACC15"]].map(([bg, bdr], i) => (
              <div key={i} className="h-8 rounded-lg p-1.5" style={{ background: bg, border: `2px solid ${bdr}` }}>
                <div className="h-1.5 w-10 rounded" style={{ background: `${bdr}88` }} />
                <div className="mt-0.5 h-1 w-8 rounded" style={{ background: `${bdr}55` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "corporate") {
    // Editorial — off-white, green, editorial
    return (
      <div className="aspect-[4/3] rounded-lg overflow-hidden" style={{ background: "#FAFAF7" }}>
        <div className="p-3 flex flex-col gap-2 h-full">
          {/* Nav */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full" style={{ background: "#16A34A" }} />
              <div className="h-1 w-10 rounded bg-gray-400" />
            </div>
            <div className="h-3 w-10 rounded-full" style={{ background: "#16A34A" }} />
          </div>
          {/* Hero — big type */}
          <div className="mt-1">
            <div className="mb-0.5 h-1 w-12 rounded" style={{ background: "#16A34A44" }} />
            <div className="h-4 w-28 rounded-sm bg-black/80" style={{ fontWeight: 900 }} />
            <div className="mt-1 h-1.5 w-20 rounded bg-gray-400/50" />
          </div>
          {/* Two col: bio + skills */}
          <div className="flex gap-2 mt-1">
            <div className="flex-1 space-y-0.5">
              <div className="h-0.5 w-full rounded bg-gray-300" />
              <div className="h-0.5 w-3/4 rounded bg-gray-300" />
              <div className="h-0.5 w-5/6 rounded bg-gray-300" />
            </div>
            <div className="flex-1 flex flex-wrap gap-0.5">
              {[8, 10, 7, 9, 6].map((w, i) => (
                <div key={i} className="h-2 rounded-full" style={{ width: `${w * 3}px`, background: "#f0f0ee", border: "1px solid #e0e0de" }} />
              ))}
            </div>
          </div>
          {/* Bento projects */}
          <div className="mt-auto grid grid-cols-3 gap-1">
            <div className="col-span-2 h-10 rounded-xl" style={{ background: "#111" }}>
              <div className="p-1.5">
                <div className="h-1.5 w-10 rounded bg-white/30" />
                <div className="mt-0.5 flex gap-0.5">
                  {[0, 1].map(i => <div key={i} className="h-1 w-5 rounded" style={{ background: "#16A34A33" }} />)}
                </div>
              </div>
            </div>
            <div className="h-10 rounded-xl bg-white" style={{ border: "1px solid #e5e5e5" }}>
              <div className="p-1.5">
                <div className="h-1.5 w-6 rounded bg-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // photography = Brutalist — pure black/white
  return (
    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black">
      <div className="p-3 flex flex-col gap-2 h-full">
        {/* Nav */}
        <div className="flex items-center justify-between">
          <div className="h-1 w-10 rounded bg-white/20" />
          <div className="h-3 w-10 rounded-none border border-white/40" />
        </div>
        {/* Massive hero text */}
        <div className="mt-1">
          <div className="h-5 w-32 rounded-none bg-white/90" style={{ fontWeight: 900 }} />
          <div className="mt-0.5 h-5 w-20 rounded-none bg-white/70" />
          <div className="mt-1 h-1.5 w-16 rounded bg-white/30" />
        </div>
        {/* Skills inline */}
        <div className="flex gap-1 mt-1">
          {["React", "TS", "Node"].map((t, i) => (
            <span key={i} className="text-[6px] uppercase tracking-wider" style={{ color: "#555" }}>
              {t}{i < 2 ? " ·" : ""}
            </span>
          ))}
        </div>
        {/* Project rows */}
        <div className="mt-auto space-y-1 border-t border-white/10 pt-1">
          {[0, 1].map(i => (
            <div key={i} className="flex items-center justify-between border-b border-white/10 pb-1">
              <div className="h-1.5 w-16 rounded bg-white/60" />
              <div className="h-1 w-6 rounded bg-white/20 underline" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TEMPLATE_ACCENTS: Record<string, string> = {
  minimal: "from-violet-500/20 to-blue-500/20",
  developer: "from-teal-500/20 to-emerald-500/20",
  creative: "from-yellow-400/20 to-lime-400/20",
  corporate: "from-green-500/20 to-emerald-600/20",
  photography: "from-gray-700/20 to-gray-900/20",
};

const TEMPLATE_DOT_COLORS: Record<string, string> = {
  minimal: "#a78bfa",
  developer: "#2DD4BF",
  creative: "#CBFF4D",
  corporate: "#16A34A",
  photography: "#ffffff",
};

const TEMPLATE_ANIMATION_LABELS: Record<string, string> = {
  minimal: "Blur fade-in",
  developer: "Slide from left",
  creative: "Spring scale-up",
  corporate: "Elegant fade-up",
  photography: "Clip-path reveal",
};

const TemplateSelection = () => {
  const { portfolio, updatePortfolio } = usePortfolio();
  const { toast } = useToast();

  const handleSelect = (templateId: string) => {
    updatePortfolio.mutate(
      { template_id: templateId },
      { onSuccess: () => toast({ title: `Template changed to ${templateId}` }) }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex h-14 items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
              <Briefcase className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Choose Template</span>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="mb-1 text-3xl font-bold">Portfolio Templates</h1>
          <p className="mb-8 text-muted-foreground">Each template has a unique layout, design system, and animation style.</p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((template) => {
              const isActive = portfolio?.template_id === template.id;
              const accent = TEMPLATE_ACCENTS[template.id];
              const dotColor = TEMPLATE_DOT_COLORS[template.id];
              const animLabel = TEMPLATE_ANIMATION_LABELS[template.id];

              return (
                <motion.button
                  key={template.id}
                  onClick={() => handleSelect(template.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative rounded-xl border-2 p-1.5 text-left transition-all ${
                    isActive ? "border-primary shadow-glow" : "border-border hover:border-primary/40"
                  }`}
                >
                  {isActive && (
                    <div className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-primary">
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}

                  <TemplateThumbnail templateId={template.id} />

                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: dotColor }} />
                      <h3 className="font-semibold">{template.name}</h3>
                      {isActive && <Badge variant="secondary" className="text-xs">Active</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground pl-4">{template.description}</p>
                    <p className="mt-1 pl-4 text-xs text-primary/50">{animLabel}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TemplateSelection;
