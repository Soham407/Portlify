import type { ComponentType } from "react";
import type { PortfolioData } from "./PortfolioTemplateProps";

import GlassTemplate from "./GlassTemplate";
import NightOwlTemplate from "./NightOwlTemplate";
import VibrantTemplate from "./VibrantTemplate";
import EditorialTemplate from "./EditorialTemplate";
import BrutalistTemplate from "./BrutalistTemplate";

export type { PortfolioData } from "./PortfolioTemplateProps";
export type {
  BioProp,
  ProjectProp,
  SkillProp,
  ExperienceProp,
  EducationProp,
  ContactProp,
  CertificationProp,
} from "./PortfolioTemplateProps";

const TEMPLATE_MAP: Record<string, ComponentType<PortfolioData>> = {
  minimal: GlassTemplate,
  developer: NightOwlTemplate,
  creative: VibrantTemplate,
  corporate: EditorialTemplate,
  photography: BrutalistTemplate,
};

export function getTemplateComponent(templateId?: string | null): ComponentType<PortfolioData> {
  return TEMPLATE_MAP[templateId || "minimal"] ?? GlassTemplate;
}

export {
  GlassTemplate,
  NightOwlTemplate,
  VibrantTemplate,
  EditorialTemplate,
  BrutalistTemplate,
};
