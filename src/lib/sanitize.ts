import DOMPurify from "dompurify";

export const sanitizeHtml = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

export const sanitizeText = (input: string): string => {
  if (!input) return "";
  return input.replace(/[<>]/g, "").trim();
};

export const sanitizeUrl = (url: string): string => {
  if (!url) return "";
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    return parsed.href;
  } catch {
    return "";
  }
};

export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) && email.length <= 254;
};

export const sanitizeArray = (arr: string[]): string[] => {
  return arr
    .map((item) => sanitizeText(item))
    .filter((item) => item.length > 0);
};

export const sanitizePortfolioData = {
  bio: (data: { first_name: string; last_name: string; headline: string; bio: string; location?: string; avatar_url?: string }) => ({
    first_name: sanitizeText(data.first_name).slice(0, 100),
    last_name: sanitizeText(data.last_name).slice(0, 100),
    headline: sanitizeText(data.headline).slice(0, 150),
    bio: sanitizeText(data.bio).slice(0, 200),
    location: data.location ? sanitizeText(data.location).slice(0, 100) : null,
    avatar_url: data.avatar_url ? sanitizeUrl(data.avatar_url) : null,
  }),
  project: (data: { name: string; problem_statement: string; solution_approach: string; technologies: string[]; github_url?: string; project_url?: string }) => ({
    name: sanitizeText(data.name).slice(0, 100),
    problem_statement: sanitizeText(data.problem_statement).slice(0, 500),
    solution_approach: sanitizeText(data.solution_approach).slice(0, 500),
    technologies: sanitizeArray(data.technologies).slice(0, 10),
    github_url: data.github_url ? sanitizeUrl(data.github_url) : null,
    project_url: data.project_url ? sanitizeUrl(data.project_url) : null,
  }),
  contact: (data: { email: string; phone?: string; linkedin_url?: string; github_url?: string; twitter_url?: string; website_url?: string }) => ({
    email: sanitizeText(data.email).slice(0, 254),
    phone: data.phone ? sanitizeText(data.phone).slice(0, 20) : null,
    linkedin_url: data.linkedin_url ? sanitizeUrl(data.linkedin_url) : null,
    github_url: data.github_url ? sanitizeUrl(data.github_url) : null,
    twitter_url: data.twitter_url ? sanitizeUrl(data.twitter_url) : null,
    website_url: data.website_url ? sanitizeUrl(data.website_url) : null,
  }),
};
