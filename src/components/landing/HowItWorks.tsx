import { motion } from "framer-motion";
import { Palette, PenTool, Share2, UserPlus } from "lucide-react";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Account",
    description: "Sign up with email or OAuth. Tell us about your background and career goals.",
    tone: "bg-secondary text-foreground",
  },
  {
    icon: Palette,
    step: "02",
    title: "Choose Template",
    description: `Pick from ${TEMPLATE_CATALOG.length} premium, recruiter-approved templates tailored to your industry.`,
    tone: "bg-primary text-primary-foreground",
  },
  {
    icon: PenTool,
    step: "03",
    title: "Build Portfolio",
    description: "Add your bio, projects, skills, and experience with our guided builder.",
    tone: "bg-accent text-accent-foreground",
  },
  {
    icon: Share2,
    step: "04",
    title: "Share & Shine",
    description: "Publish to your public username page or send an unlisted share link for private reviews.",
    tone: "bg-secondary text-foreground",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="border-y border-border/70 bg-surface/70 py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="surface-panel mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
            HOW IT WORKS
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            From Zero to Portfolio <span className="text-gradient">in 4 Steps</span>
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Go from zero to a professional portfolio in four simple steps.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className={`relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl shadow-card ${step.tone}`}>
                  <step.icon className="h-6 w-6" />
                  <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background">
                    <span className="text-[9px] font-bold text-muted-foreground">{step.step}</span>
                  </div>
                </div>
                <h3 className="mb-2 text-base font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
