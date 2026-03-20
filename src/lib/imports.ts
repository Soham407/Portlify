import * as pdfjsLib from "pdfjs-dist";
import { supabase } from "@/integrations/supabase/client";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export type ParsedExperience = {
  company_name: string;
  role_title: string;
  employment_type?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
};

export type ParsedEducation = {
  institution: string;
  degree?: string;
  field_of_study?: string;
  graduation_year?: string;
  description?: string;
};

export type ParsedCertification = {
  name: string;
  issuer?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_url?: string;
  description?: string;
};

export type ParsedContact = {
  email?: string;
  phone?: string;
  linkedin_url?: string;
  website_url?: string;
  twitter_url?: string;
  github_url?: string;
};

export type ParsedProfile = {
  headline?: string;
  summary?: string;
  location?: string;
  contact?: ParsedContact;
  experiences: ParsedExperience[];
  skills: string[];
  education: ParsedEducation[];
  certifications: ParsedCertification[];
};

export type GithubProject = {
  name: string;
  problem_statement?: string;
  solution_approach?: string;
  technologies?: string[];
  github_url?: string;
  demo_url?: string;
};

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item && typeof item.str === "string" ? item.str : ""))
      .join(" ");
    textParts.push(pageText);
  }

  return textParts.join("\n\n");
};

export const parseLinkedInPdf = async (file: File): Promise<ParsedProfile> => {
  const text = await extractTextFromPdf(file);

  if (text.trim().length < 50) {
    throw new Error("Could not extract enough text from this PDF");
  }

  const { data, error } = await supabase.functions.invoke("parse-linkedin", {
    body: { text },
  });

  if (error) throw error;
  if (data?.error) {
    throw new Error(data.error);
  }

  return data.parsed as ParsedProfile;
};

export const fetchGithubProjects = async (username: string): Promise<GithubProject[]> => {
  const { data, error } = await supabase.functions.invoke("sync-github", {
    body: { username: username.trim() },
  });

  if (error) throw error;
  if (data?.error) {
    throw new Error(data.error);
  }

  return (data?.projects || []) as GithubProject[];
};

export const normalizeImportedDate = (value?: string | null): string => {
  if (!value) return "";

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}$/.test(trimmed)) return `${trimmed}-01`;
  if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01-01`;

  return "";
};
