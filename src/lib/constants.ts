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
  { value: "expert", label: "Expert", description: "Experienced professional with deep expertise", icon: "Award" },
  { value: "freelancer", label: "Freelancer", description: "Independent contractor or consultant", icon: "Laptop" },
  { value: "professional", label: "Professional", description: "Established career with certifications", icon: "Briefcase" },
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
