import { motion } from "framer-motion";
import { Eye, Github, Layout, Shield, Sparkles, Users } from "lucide-react";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";

const features = [
  {
    icon: Sparkles,
    title: "AI Content Polish",
    description: "Let AI enhance your bio and project descriptions to impress recruiters instantly.",
    tone: "bg-primary/12 text-primary",
  },
  {
    icon: Github,
    title: "GitHub Integration",
    description: "Import your best projects directly from GitHub with one click.",
    tone: "bg-secondary text-foreground",
  },
  {
    icon: Layout,
    title: "Premium Templates",
    description: `Choose from ${TEMPLATE_CATALOG.length} professionally designed templates that make you stand out.`,
    tone: "bg-accent/40 text-accent-foreground",
  },
  {
    icon: Eye,
    title: "Live Preview",
    description: "See changes in real-time as you build your portfolio with our WYSIWYG editor.",
    tone: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    title: "Profile Views",
    description: "See how many people are checking out your public portfolio.",
    tone: "bg-muted text-foreground",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Row-level security, input sanitization, and OAuth 2.0 authentication built in.",
    tone: "bg-secondary text-foreground",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center">
          <div className="surface-panel mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
            FEATURES
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Everything You Need to <span className="text-gradient">Stand Out</span>
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
              className="surface-panel group relative rounded-[1.6rem] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-glow"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 ${feature.tone}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
