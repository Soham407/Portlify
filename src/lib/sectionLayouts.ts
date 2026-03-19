export interface LayoutVariant {
  id: string;
  label: string;
  description: string;
}

export interface SectionLayoutDef {
  label: string;
  variants: LayoutVariant[];
}

export const SECTION_LAYOUTS: Record<string, SectionLayoutDef> = {
  bio: {
    label: "Bio / Hero",
    variants: [
      { id: "centered", label: "Centered", description: "Avatar + text centered on page" },
      { id: "left", label: "Left-aligned", description: "Text left-aligned, minimal" },
      { id: "split", label: "Split", description: "Avatar on one side, text on the other" },
    ],
  },
  projects: {
    label: "Projects",
    variants: [
      { id: "grid", label: "Grid", description: "2-column card grid" },
      { id: "list", label: "List", description: "Single-column with more detail" },
      { id: "featured", label: "Featured", description: "First project highlighted large" },
    ],
  },
  skills: {
    label: "Skills",
    variants: [
      { id: "tags", label: "Tags", description: "Flat pill-style tags" },
      { id: "grouped", label: "Grouped", description: "Tags grouped by category" },
    ],
  },
  experience: {
    label: "Experience",
    variants: [
      { id: "timeline", label: "Timeline", description: "Vertical timeline with dots" },
      { id: "compact", label: "Compact", description: "Dense table-style list" },
    ],
  },
  education: {
    label: "Education",
    variants: [
      { id: "cards", label: "Cards", description: "Grid of info cards" },
      { id: "list", label: "List", description: "Simple stacked list" },
    ],
  },
};

export function getDefaultLayout(section: string): string {
  const variants = SECTION_LAYOUTS[section]?.variants;
  return variants?.[0]?.id ?? "default";
}

export function getEffectiveLayout(section: string, sectionLayouts?: Record<string, string>): string {
  return sectionLayouts?.[section] ?? getDefaultLayout(section);
}
