import { DEFAULT_SECTION_ORDER } from "@/lib/constants";

export type OnboardingForm = {
  user_type: string;
  career_type: string;
  skill_level: string;
  selected_role: string;
  portfolio_goal: string;
  preferred_template: string;
  import_intent: string;
  starter_content_mode: string;
};

export const getStarterSectionOrder = (userType: string, goal: string) => {
  if (goal === "freelance") return [...DEFAULT_SECTION_ORDER.freelancer];
  if (goal === "personal_brand") return ["bio", "projects", "experience", "skills", "certifications", "contact"];
  if (goal === "student") return ["bio", "skills", "education", "projects", "experience", "contact"];

  return [
    ...(DEFAULT_SECTION_ORDER[userType as keyof typeof DEFAULT_SECTION_ORDER] || DEFAULT_SECTION_ORDER.fresher),
  ];
};

export const getTemplateForGoal = (goal: string, preferredTemplate?: string) => {
  if (preferredTemplate) return preferredTemplate;
  if (goal === "freelance") return "creative";
  if (goal === "personal_brand") return "corporate";
  if (goal === "student") return "developer";
  return "minimal";
};

export const getStarterBio = (form: OnboardingForm) => {
  const role = form.selected_role || "Professional";
  const career = form.career_type || "technology";
  const goalCopy: Record<string, string> = {
    job_hunt: "Building thoughtful products and solving real problems with clear, user-focused execution.",
    freelance: "Helping clients turn ideas into polished, dependable digital experiences.",
    student: "Learning fast, shipping practical work, and growing through hands-on projects.",
    personal_brand: "Sharing selected work, ideas, and outcomes through a clear professional presence.",
  };

  return {
    headline: `${role} focused on ${career}`,
    bio: goalCopy[form.portfolio_goal] || goalCopy.job_hunt,
  };
};

export const getStarterProjects = (form: OnboardingForm) => {
  if (form.starter_content_mode !== "prefilled") return [];

  return [
    {
      name: "Flagship Project",
      problem_statement: "Describe the user or business problem this project solved and why it mattered.",
      solution_approach: "Summarize your approach, technical decisions, and measurable result.",
      technologies: ["React", "TypeScript"],
    },
  ];
};

export const getStarterExperiences = (form: OnboardingForm) => {
  if (form.starter_content_mode !== "prefilled") return [];

  return [
    {
      company_name: "Your Next Team",
      role_title: form.selected_role || "Contributor",
      employment_type: "full-time",
      start_date: "",
      end_date: "",
      is_current: true,
      description: "Add 2-3 impact-focused bullets showing what you owned, improved, or delivered.",
    },
  ];
};
