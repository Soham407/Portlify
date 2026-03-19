# Project Context

> **Last verified**: 2026-03-17  
> **Supabase Project ID**: `bcxijtwnsmdhnbrkcxnd`

## Overview
A full-stack portfolio-builder SaaS that lets users create, customise, and publicly share professional portfolios. Users pick a career type, select a visual template, and populate sections (Bio, Skills, Projects, Experience, Education, Certifications, Contact). An SOP Generator and AI content polishing features are also available. Portfolios are publicly viewable at `/p/:username`.

---

## Technology Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| **Runtime** | Vite | 5.x | ESM-only, SWC plugin for React |
| **UI Framework** | React | 18.x | Functional components, arrow functions |
| **Language** | TypeScript | 5.x | `strict: false` in tsconfig — be cautious of implicit `any` |
| **Styling** | Tailwind CSS 3 + shadcn/ui (default style, Slate base) | — | CSS Variables for theming; `cn()` from `src/lib/utils.ts` |
| **Component Library** | shadcn/ui (49 components in `src/components/ui/`) | — | Installed via `components.json`; NOT React Server Components (`rsc: false`) |
| **State / Data** | TanStack React Query 5 | — | Wraps every Supabase call. `QueryClient` instantiated in `App.tsx` |
| **Routing** | react-router-dom 6 | — | `BrowserRouter` in `App.tsx`, `<ProtectedRoute>` HOC for auth gates |
| **Forms** | react-hook-form + Zod | — | Used throughout; hook-form resolvers wired with Zod schemas |
| **Backend** | Supabase | — | Auth, Postgres DB, Edge Functions, Storage |
| **Animation** | framer-motion 12 | — | Page transitions and micro-interactions |
| **Toasts** | sonner + radix-ui toast (dual system) | — | Both `<Toaster>` and `<Sonner>` are mounted in `App.tsx` |
| **Theming** | next-themes | — | `ThemeProvider` wraps app; `darkMode: "class"` in Tailwind config |
| **Icons** | lucide-react | — | Tree-shakeable |
| **PDF** | pdfjs-dist 3.11 | — | Used for CV/resume parsing operations |
| **Sanitization** | DOMPurify | — | `src/lib/sanitize.ts` — sanitise user-generated HTML |
| **Test** | Vitest + Testing Library | — | Config in `vitest.config.ts` |

---

## Path Aliases
```
@/* → ./src/*        (configured in vite.config.ts + tsconfig.app.json)
```

---

## Folder Structure

```
├── .ai/                        ← AI context files (this folder)
├── public/
│   └── portfolio.png           ← Favicon & OG image
├── src/
│   ├── components/
│   │   ├── ui/                 ← 49 shadcn/ui primitives (DO NOT EDIT manually)
│   │   ├── builder/            ← Builder-specific (AIPolishButton, AvatarUpload)
│   │   ├── landing/            ← Marketing page sections (Hero, Features, Footer, etc.)
│   │   ├── templates/          ← 5 portfolio rendering templates + shared types
│   │   ├── LinkedInImport.tsx  ← LinkedIn data import modal
│   │   ├── NavLink.tsx         ← Reusable nav link component
│   │   └── ProtectedRoute.tsx  ← Auth guard wrapper
│   ├── contexts/
│   │   ├── AuthContext.tsx      ← Auth state + signUp/signIn/signOut + onboarding redirect helper
│   │   └── ThemeContext.tsx     ← Thin wrapper over next-themes ThemeProvider
│   ├── hooks/                  ← 11 custom hooks (all use React Query + Supabase)
│   │   ├── usePortfolio.ts     ← CRUD for portfolios (create, duplicate, delete, set default)
│   │   ├── useBio.ts           ← Bio section queries/mutations
│   │   ├── useSkills.ts        ← Skills CRUD
│   │   ├── useProjects.ts      ← Projects CRUD
│   │   ├── useExperience.ts    ← Experience CRUD
│   │   ├── useEducation.ts     ← Education CRUD
│   │   ├── useCertifications.ts← Certifications CRUD
│   │   ├── useContact.ts       ← Contact info CRUD
│   │   ├── useAutoSave.ts      ← Debounced auto-save utility
│   │   ├── use-mobile.tsx      ← Mobile viewport detection
│   │   └── use-toast.ts        ← Toast hook (shadcn)
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts       ← Supabase client singleton (typed with Database)
│   │       └── types.ts        ← Auto-generated database types (DO NOT EDIT manually)
│   ├── lib/
│   │   ├── utils.ts            ← cn() utility (clsx + twMerge)
│   │   ├── constants.ts        ← App-wide constants (templates, user types, validation rules, etc.)
│   │   ├── templateStyles.ts   ← Template CSS style definitions
│   │   └── sanitize.ts         ← DOMPurify HTML sanitization helpers
│   ├── pages/                  ← 16 route-level page components
│   │   ├── Index.tsx            ← Landing / marketing page
│   │   ├── Login.tsx / Signup.tsx / ForgotPassword.tsx / ResetPassword.tsx / AuthCallback.tsx
│   │   ├── UserTypeSelection.tsx / CareerSetup.tsx / RoleSelection.tsx  ← Onboarding flow
│   │   ├── Dashboard.tsx        ← Main logged-in dashboard
│   │   ├── TemplateSelection.tsx← Choose portfolio template
│   │   ├── Builder.tsx          ← Core portfolio editor (37KB — largest file)
│   │   ├── Preview.tsx          ← Portfolio preview mode
│   │   ├── PublicPortfolio.tsx  ← Public view at /p/:username
│   │   ├── SOPGenerator.tsx     ← Statement of Purpose builder
│   │   └── NotFound.tsx         ← 404 page
│   ├── test/                   ← Test files
│   ├── App.tsx                 ← Root: providers, router, global toasters
│   ├── main.tsx                ← ReactDOM.createRoot entry
│   └── index.css               ← Tailwind directives + CSS variable design tokens (light/dark)
├── supabase/
│   ├── config.toml             ← Local Supabase CLI config
│   ├── migrations/             ← 6 SQL migration files
│   └── functions/              ← 5 Edge Functions
│       ├── generate-sop/       ← SOP generation logic
│       ├── polish-content/     ← AI text polishing
│       ├── parse-linkedin/     ← LinkedIn profile parsing
│       ├── log-portfolio-view/ ← Analytics: log public views
│       └── sync-github/        ← GitHub project sync
└── Config files: vite.config.ts, tailwind.config.ts, tsconfig.*.json, components.json, eslint.config.js
```

---

## Database Schema (Supabase — public schema)

| Table | Primary Key | Owner FK | Portfolio FK | Purpose |
|---|---|---|---|---|
| `profiles` | `id` (= auth.uid) | — | — | User profile, onboarding state, social links |
| `portfolios` | `id` (uuid) | `user_id` | — | Portfolio metadata, template, visibility, section order |
| `bio_sections` | `id` (uuid) | — | `portfolio_id` (1:1) | Name, headline, bio text, avatar |
| `contact_info` | `id` (uuid) | — | `portfolio_id` (1:1) | Email, phone, social URLs |
| `skills` | `id` (uuid) | `user_id` | `portfolio_id` | Skill name, category, type, proficiency |
| `portfolio_projects` | `id` (uuid) | `user_id` | `portfolio_id` | Projects with problem/solution, tech stack, URLs |
| `experiences` | `id` (uuid) | `user_id` | `portfolio_id` | Work experience entries |
| `education` | `id` (uuid) | `user_id` | `portfolio_id` | Education history |
| `certifications` | `id` (uuid) | `user_id` | `portfolio_id` | Professional certifications |
| `portfolio_views` | `id` (uuid) | — | `portfolio_id` | View analytics (IP, user agent, timestamp) |
| `section_order_config` | `id` (uuid) | — | — | Default section ordering per user type |

**RPC Functions**: `can_share_portfolio(p_portfolio_id)` → boolean, `get_portfolio_completion(p_portfolio_id)` → number

---

## Routing Map

| Path | Component | Auth | Purpose |
|---|---|---|---|
| `/` | Index | Public | Landing page |
| `/login` | Login | Public | Sign in |
| `/signup` | Signup | Public | Register |
| `/auth/callback` | AuthCallback | Public | OAuth callback handler |
| `/forgot-password` | ForgotPassword | Public | Password reset request |
| `/reset-password` | ResetPassword | Public | Password reset form |
| `/p/:username` | PublicPortfolio | Public | Public portfolio view |
| `/user-type-selection` | UserTypeSelection | Protected | Onboarding step 1 |
| `/career-setup` | CareerSetup | Protected | Onboarding step 2 |
| `/role-selection` | RoleSelection | Protected | Onboarding step 3 |
| `/dashboard` | Dashboard | Protected | Main dashboard |
| `/builder` | Builder | Protected | Portfolio editor |
| `/preview` | Preview | Protected | Template preview |
| `/templates` | TemplateSelection | Protected | Template picker |
| `/sop-generator` | SOPGenerator | Protected | SOP document builder |
| `*` | NotFound | Public | 404 |

---

## Design System Tokens

Defined as CSS variables in `src/index.css` with full light/dark mode support:

- **Color scale**: `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--card`, `--popover`, `--surface`, `--surface-elevated`
- **Custom gradients**: `--gradient-primary`, `--gradient-hero`
- **Custom shadows**: `--shadow-glow`, `--shadow-card`
- **Typography**: Inter (sans), JetBrains Mono (mono)
- **Custom utilities**: `.text-gradient`, `.bg-gradient-primary`, `.bg-gradient-hero`, `.shadow-glow`, `.shadow-card`, `.glass`
- **Animations**: `fade-up`, `fade-in`, `float`, `accordion-down/up`

---

## Portfolio Templates

| Internal ID | Display Name | Style |
|---|---|---|
| `minimal` | Glass | Dark glassmorphism |
| `developer` | Night Owl | VS Code dark theme |
| `creative` | Vibrant | Bold & colorful |
| `corporate` | Editorial | Magazine-style |
| `photography` | Brutalist | High-contrast B&W |

Template components live in `src/components/templates/` and share the `PortfolioData` interface from `PortfolioTemplateProps.ts`.

---

## Edge Functions (Supabase)

| Function | Purpose |
|---|---|
| `generate-sop` | AI-powered SOP document generation |
| `polish-content` | AI text refinement with tone presets |
| `parse-linkedin` | Extract structured data from LinkedIn profile |
| `log-portfolio-view` | Record anonymous view analytics |
| `sync-github` | Sync project data from GitHub repositories |

---

## Environment Variables

| Key | Purpose |
|---|---|
| `VITE_SUPABASE_PROJECT_ID` | Supabase project identifier |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon (public) key |
| `VITE_SUPABASE_URL` | Supabase API URL |

All accessed via `import.meta.env.VITE_*` (Vite convention).
