import { motion } from "framer-motion";
import { Sparkles, Github, Layout, Eye, BarChart3, Shield } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Content Polish",
    description: "Let AI enhance your bio and project descriptions to impress recruiters instantly.",
    color: "text-violet-600 bg-violet-500/10 group-hover:bg-violet-500 group-hover:text-white",
    accent: "group-hover:border-violet-200",
  },
  {
    icon: Github,
    title: "GitHub Integration",
    description: "Import your best projects directly from GitHub with one click.",
    color: "text-slate-700 bg-slate-500/10 group-hover:bg-slate-700 group-hover:text-white",
    accent: "group-hover:border-slate-200",
  },
  {
    icon: Layout,
    title: "Premium Templates",
    description: "Choose from 5 professionally designed templates that make you stand out.",
    color: "text-primary bg-primary/10 group-hover:bg-primary group-hover:text-white",
    accent: "group-hover:border-primary/20",
  },
  {
    icon: Eye,
    title: "Live Preview",
    description: "See changes in real-time as you build your portfolio with our WYSIWYG editor.",
    color: "text-emerald-600 bg-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-white",
    accent: "group-hover:border-emerald-200",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track who views your portfolio and measure your engagement metrics.",
    color: "text-orange-600 bg-orange-500/10 group-hover:bg-orange-500 group-hover:text-white",
    accent: "group-hover:border-orange-200",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Row-level security, input sanitization, and OAuth 2.0 authentication built in.",
    color: "text-sky-600 bg-sky-500/10 group-hover:bg-sky-500 group-hover:text-white",
    accent: "group-hover:border-sky-200",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            FEATURES
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Everything You Need to{" "}
            <span className="text-gradient">Stand Out</span>
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Powerful features designed to help you build a portfolio that gets you hired.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`group relative rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-glow ${feature.accent}`}
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 ${feature.color}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl bg-gradient-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
