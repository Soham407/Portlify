import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const floatingCards = [
  {
    icon: "✦",
    label: "AI-Polished Bio",
    sub: "Powered by Claude",
    color: "from-violet-500/10 to-purple-500/5 border-violet-200/50",
    pos: "top-[15%] left-[3%] lg:left-[8%]",
  },
  {
    icon: "⚡",
    label: "GitHub Synced",
    sub: "12 repos imported",
    color: "from-emerald-500/10 to-teal-500/5 border-emerald-200/50",
    pos: "top-[20%] right-[3%] lg:right-[8%]",
  },
  {
    icon: "👁",
    label: "247 Profile Views",
    sub: "This week",
    color: "from-orange-500/10 to-amber-500/5 border-orange-200/50",
    pos: "bottom-[25%] left-[2%] lg:left-[6%]",
  },
];

const Hero = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-hero" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-3xl" />

      {/* Floating Cards — hidden on mobile to avoid clutter */}
      {floatingCards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
          className={`absolute hidden xl:flex items-center gap-3 rounded-xl border bg-gradient-to-br ${card.color} px-4 py-3 shadow-card backdrop-blur-sm ${card.pos} animate-float`}
          style={{ animationDelay: `${i * 1.5}s` }}
        >
          <span className="text-xl">{card.icon}</span>
          <div>
            <div className="text-sm font-semibold leading-tight">{card.label}</div>
            <div className="text-xs text-muted-foreground">{card.sub}</div>
          </div>
        </motion.div>
      ))}

      <div className="container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Portfolio Builder
          </motion.div>

          <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl">
            Build Your{" "}
            <span className="text-gradient">Dream Portfolio</span>
            {" "}in Minutes
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Create a stunning, recruiter-ready portfolio with AI-powered content,
            premium templates, and GitHub integration — no coding required.
          </p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mb-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            {[
              "Free to start",
              "No credit card required",
              "Custom URL",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {item}
              </span>
            ))}
          </motion.div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="hero" size="lg" className="h-12 px-8 text-base" asChild>
              <Link to="/signup">
                Start Building Free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" className="h-12 px-8 text-base" asChild>
              <a href="#templates">View Templates</a>
            </Button>
          </div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <div className="flex -space-x-2">
              {["bg-violet-400", "bg-emerald-400", "bg-orange-400", "bg-blue-400", "bg-pink-400"].map((c, i) => (
                <div key={i} className={`h-8 w-8 rounded-full border-2 border-background ${c}`} />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                4.9/5
              </span>
              from 10K+ portfolios created
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-8"
          >
            {[
              { value: "10K+", label: "Portfolios Created" },
              { value: "5", label: "Premium Templates" },
              { value: "98%", label: "User Satisfaction" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold md:text-3xl">{stat.value}</div>
                <div className="text-sm text-foreground/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
