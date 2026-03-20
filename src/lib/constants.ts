export const VALIDATION_RULES = {
  BIO: {
    MAX_LENGTH: 200,
    HEADLINE_MAX: 150,
    NAME_MAX: 100,
  },
  PROJECTS: {
    MIN_COUNT: 1,
    MAX_COUNT: 5,
    NAME_MAX: 100,
    DESCRIPTION_MAX: 500,
  },
  SKILLS: {
    MAX_COUNT: 20,
  },
  EXPERIENCE: {
    MIN_DURATION_MONTHS: 3,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-z0-9_-]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
  },
} as const;

export const SKILL_CATEGORIES = [
  "Languages",
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "Mobile",
  "AI/ML",
  "Design",
  "Tools",
  "Other",
] as const;

export const SKILL_TYPES = [
  { value: "learned", label: "Learned", description: "Skills you've studied or practiced" },
  { value: "implemented", label: "Implemented", description: "Skills you've used in real projects" },
] as const;

export const TEMPLATES = [
  { id: "minimal",     name: "Glass",      description: "Dark glassmorphism — elegant & modern" },
  { id: "developer",   name: "Night Owl",  description: "VS Code dark — clean & technical" },
  { id: "creative",    name: "Vibrant",    description: "Bold & colorful — makes an impression" },
  { id: "corporate",   name: "Editorial",  description: "Magazine-style — sophisticated & clean" },
  { id: "photography", name: "Brutalist",  description: "High-contrast B&W — raw typographic power" },
] as const;

export const EMPLOYMENT_TYPES = [
  { value: "internship", label: "Internship" },
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "freelance", label: "Freelance" },
  { value: "contract", label: "Contract" },
] as const;

// Enhanced user types based on career stage
export const USER_TYPES = [
  { value: "fresher", label: "Fresher", description: "Recent graduate or new to the field", icon: "GraduationCap" },
  { value: "job_seeker", label: "Job Seeker", description: "Actively looking for employment", icon: "Search" },
] as const;

export const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner", description: "Learning the basics" },
  { value: "intermediate", label: "Intermediate", description: "Comfortable with core concepts" },
  { value: "advanced", label: "Advanced", description: "Proficient with complex tasks" },
  { value: "expert", label: "Expert", description: "Mastered the field" },
] as const;

export const CAREER_TYPES = {
  fresher: [
    "Software Development",
    "Data Science & AI",
    "UI/UX Design",
    "Marketing",
    "Business",
    "Content Creation",
  ],
  job_seeker: [
    "Software Development",
    "Data Science & AI",
    "UI/UX Design",
    "DevOps & Cloud",
    "Project Management",
    "Marketing",
    "Business Development",
  ],
  expert: [
    "Software Architecture",
    "AI/ML Engineering",
    "Technical Leadership",
    "Security Engineering",
    "Data Engineering",
    "Product Management",
  ],
  freelancer: [
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "Graphic Design",
    "Content Writing",
    "Digital Marketing",
    "Consulting",
  ],
  professional: [
    "Software Engineering",
    "Engineering Management",
    "Product Management",
    "Technical Consulting",
    "Enterprise Architecture",
    "DevOps Leadership",
  ],
  // Fallback for legacy data
  technical: [
    "Software Development",
    "Data Science & AI",
    "UI/UX Design",
    "DevOps & Cloud",
    "Cybersecurity",
    "Mobile Development",
  ],
  "non-technical": [
    "Marketing",
    "Business Development",
    "Content Creation",
    "Project Management",
    "Human Resources",
    "Finance",
  ],
} as const;

// AI content polishing tone presets
export const AI_TONES = [
  { value: "formal", label: "Formal", description: "Professional and business-appropriate" },
  { value: "friendly", label: "Friendly", description: "Warm and approachable" },
  { value: "technical", label: "Technical", description: "Detailed and precise" },
  { value: "creative", label: "Creative", description: "Engaging and unique" },
] as const;

// Portfolio types for multiple portfolios
export const PORTFOLIO_TYPES = [
  { value: "general", label: "General", description: "All-purpose portfolio" },
  { value: "job_specific", label: "Job-Specific", description: "Tailored for a specific job application" },
  { value: "industry_specific", label: "Industry-Specific", description: "Focused on a particular industry" },
  { value: "client_specific", label: "Client-Specific", description: "Customized for a client presentation" },
  { value: "showcase", label: "Showcase", description: "Highlight best work only" },
] as const;

// Section order based on user type (priority order)
export const DEFAULT_SECTION_ORDER = {
  fresher: ["bio", "skills", "education", "projects", "experience", "contact"],
  job_seeker: ["bio", "skills", "projects", "experience", "education", "contact"],
  expert: ["bio", "experience", "projects", "skills", "education", "contact"],
  freelancer: ["bio", "projects", "skills", "experience", "education", "contact"],
  professional: ["bio", "experience", "skills", "projects", "education", "contact"],
} as const;

export const PORTFOLIO_GOALS = [
  { value: "job_hunt", label: "Job Hunt", description: "Build a recruiter-ready portfolio for applications." },
  { value: "freelance", label: "Freelance", description: "Showcase services and client work to win projects." },
  { value: "student", label: "Student", description: "Highlight learning, projects, and growth potential." },
  { value: "personal_brand", label: "Personal Brand", description: "Create a polished public profile for your work." },
] as const;

export const IMPORT_INTENTS = [
  { value: "manual", label: "Build Manually", description: "Start from scratch and enter details yourself." },
  { value: "linkedin_pdf", label: "LinkedIn PDF", description: "Upload a LinkedIn export to prefill experience and skills." },
  { value: "github", label: "GitHub Import", description: "Pull projects from GitHub and refine them in the builder." },
] as const;

export const STARTER_CONTENT_MODES = [
  { value: "blank", label: "Blank", description: "Start with an empty portfolio and fill each section yourself." },
  { value: "prefilled", label: "Prefilled", description: "Start with starter copy and example entries you can edit." },
] as const;

export const VISIBILITY_OPTIONS = [
  { value: "private", label: "Private", description: "Only you can access this portfolio." },
  { value: "public", label: "Public", description: "Visible at your username URL and discoverable." },
  { value: "unlisted", label: "Unlisted", description: "Accessible only with a secret share link." },
] as const;

export const PORTFOLIO_SECTIONS = [
  { id: "bio", label: "Bio" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
] as const;

export const AI_ACTIONS = [
  { value: "rewrite", label: "Rewrite", description: "Reword the content while preserving meaning." },
  { value: "shorten", label: "Shorten", description: "Make the content tighter and more concise." },
  { value: "strengthen", label: "Strengthen", description: "Increase impact with stronger language and outcomes." },
  { value: "suggest", label: "Suggest", description: "Show coaching prompts and improvement ideas." },
] as const;
