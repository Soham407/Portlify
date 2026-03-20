export interface BioProp {
  first_name?: string | null;
  last_name?: string | null;
  headline?: string | null;
  location?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface ProjectProp {
  id: string;
  name: string;
  problem_statement?: string | null;
  solution?: string | null;
  solution_approach?: string | null;
  technologies?: string[] | null;
  github_url?: string | null;
  project_url?: string | null;
}

export interface SkillProp {
  id: string;
  skill_name: string;
  category?: string | null;
  skill_category?: string | null;
  skill_type?: string | null;
  skill_level?: string | null;
}

export interface ExperienceProp {
  id: string;
  role_title: string;
  company_name: string;
  employment_type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean | null;
  description?: string | null;
}

export interface EducationProp {
  id: string;
  institution: string;
  degree?: string | null;
  field_of_study?: string | null;
  graduation_year?: number | string | null;
  cgpa?: number | string | null;
}

export interface ContactProp {
  email?: string | null;
  phone?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  website_url?: string | null;
}

export interface CertificationProp {
  id: string;
  name: string;
  issuer?: string | null;
  issue_date?: string | null;
  credential_url?: string | null;
}

export interface PortfolioData {
  bio: BioProp | null;
  projects: ProjectProp[];
  skills: SkillProp[];
  experiences: ExperienceProp[];
  education: EducationProp[];
  contact: ContactProp | null;
  certifications: CertificationProp[];
  sectionLayouts?: Record<string, string>;
  sectionOrder?: string[];
  hiddenSections?: string[];
  editMode?: boolean;
  onSectionEdit?: (section: string) => void;
}
