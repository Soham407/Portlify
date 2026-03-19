import type { Variants } from "framer-motion";

export interface TemplateStyle {
  id: string;
  // Hero section
  heroClass: string;
  heroTextClass: string;
  avatarClass: string;
  // Section container
  sectionClass: string;
  // Card style
  cardClass: string;
  // Badge style
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
  // Heading style
  headingClass: string;
  // Animations
  containerVariants: Variants;
  itemVariants: Variants;
  // Preview thumbnail colors
  previewColors: string[];
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.08, duration: 0.6 },
  }),
};

const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.12, duration: 0.4, type: "spring", stiffness: 200 },
  }),
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const staggerFlip: Variants = {
  hidden: { opacity: 0, rotateX: -15, y: 30 },
  visible: (i: number) => ({
    opacity: 1, rotateX: 0, y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

const containerBase: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export const TEMPLATE_STYLES: Record<string, TemplateStyle> = {
  minimal: {
    id: "minimal",
    heroClass: "border-b border-border py-16",
    heroTextClass: "text-center",
    avatarClass: "mx-auto mb-4 h-20 w-20 rounded-full object-cover",
    sectionClass: "container max-w-3xl py-12 space-y-16",
    cardClass: "rounded-xl border border-border bg-card p-5 shadow-card",
    badgeVariant: "secondary",
    headingClass: "mb-6 text-2xl font-bold",
    containerVariants: containerBase,
    itemVariants: fadeIn,
    previewColors: ["hsl(var(--muted))", "hsl(var(--border))", "hsl(var(--card))"],
  },
  developer: {
    id: "developer",
    heroClass: "border-b-2 border-primary/30 bg-card py-16",
    heroTextClass: "text-left",
    avatarClass: "mb-4 h-20 w-20 rounded-lg object-cover border-2 border-primary/30",
    sectionClass: "container max-w-4xl py-12 space-y-14",
    cardClass: "rounded-lg border border-primary/20 bg-card p-5 shadow-sm font-mono",
    badgeVariant: "outline",
    headingClass: "mb-6 text-2xl font-bold font-mono tracking-tight before:content-['//'] before:text-primary before:mr-2",
    containerVariants: containerBase,
    itemVariants: slideRight,
    previewColors: ["hsl(var(--primary))", "hsl(var(--card))", "hsl(var(--accent))"],
  },
  creative: {
    id: "creative",
    heroClass: "bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 py-20",
    heroTextClass: "text-center",
    avatarClass: "mx-auto mb-6 h-24 w-24 rounded-full object-cover ring-4 ring-primary/30 ring-offset-4 ring-offset-background",
    sectionClass: "container max-w-4xl py-14 space-y-20",
    cardClass: "rounded-2xl border-2 border-primary/10 bg-card p-6 shadow-lg hover:shadow-xl transition-shadow duration-300",
    badgeVariant: "default",
    headingClass: "mb-8 text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
    containerVariants: containerBase,
    itemVariants: scaleUp,
    previewColors: ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))"],
  },
  corporate: {
    id: "corporate",
    heroClass: "border-b border-border bg-card py-14",
    heroTextClass: "text-center",
    avatarClass: "mx-auto mb-4 h-20 w-20 rounded-full object-cover border border-border",
    sectionClass: "container max-w-3xl py-10 space-y-12",
    cardClass: "rounded-lg border border-border bg-card p-5 shadow-sm",
    badgeVariant: "secondary",
    headingClass: "mb-6 text-xl font-semibold uppercase tracking-wider text-muted-foreground",
    containerVariants: containerBase,
    itemVariants: fadeUp,
    previewColors: ["hsl(var(--card))", "hsl(var(--border))", "hsl(var(--muted))"],
  },
  photography: {
    id: "photography",
    heroClass: "bg-foreground text-background py-20",
    heroTextClass: "text-center",
    avatarClass: "mx-auto mb-6 h-28 w-28 rounded-full object-cover shadow-2xl",
    sectionClass: "container max-w-4xl py-14 space-y-20",
    cardClass: "rounded-xl bg-card p-6 shadow-xl border-0 overflow-hidden",
    badgeVariant: "outline",
    headingClass: "mb-8 text-2xl font-light tracking-widest uppercase text-center",
    containerVariants: containerBase,
    itemVariants: staggerFlip,
    previewColors: ["hsl(var(--foreground))", "hsl(var(--card))", "hsl(var(--muted))"],
  },
};

export const getTemplateStyle = (templateId?: string | null): TemplateStyle => {
  return TEMPLATE_STYLES[templateId || "minimal"] || TEMPLATE_STYLES.minimal;
};
