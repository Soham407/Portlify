import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useToast } from "@/hooks/use-toast";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";

const TemplateSelection = () => {
  const [searchParams] = useSearchParams();
  const portfolioParam = searchParams.get("portfolio") ?? undefined;
  const { portfolio, updatePortfolio } = usePortfolio(portfolioParam);
  const { toast } = useToast();

  const handleSelect = (templateId: string) => {
    updatePortfolio.mutate(
      { template_id: templateId },
      { onSuccess: () => toast({ title: `Template changed to ${templateId}` }) }
    );
  };

  return (
    <div className="app-shell min-h-screen">
      <header className="border-b border-border/70 bg-card/85 backdrop-blur">
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
          <div className="ml-auto">
            <ThemeToggle compact />
          </div>
        </div>
      </header>

      <main className="container py-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="mb-1 text-3xl font-bold">Portfolio Templates</h1>
          <p className="mb-8 text-muted-foreground">Each template has a unique layout, design system, and animation style.</p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_CATALOG.map((template) => {
              const isActive = portfolio?.template_id === template.id;

              return (
                <motion.button
                  key={template.id}
                  onClick={() => handleSelect(template.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative rounded-[1.6rem] border-2 p-1.5 text-left transition-all ${
                    isActive ? "border-primary shadow-glow" : "border-border hover:border-primary/40"
                  }`}
                >
                  {isActive && (
                    <div className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-primary">
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}

                  {template.preview}

                  <div className="surface-panel rounded-[1.1rem] border-0 p-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: template.dotColor }} />
                      <h3 className="font-semibold">{template.name}</h3>
                      {isActive && <Badge variant="secondary" className="text-xs">Active</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground pl-4">{template.description}</p>
                    <p className="mt-1 pl-4 text-xs text-primary/50">{template.animationLabel}</p>
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
