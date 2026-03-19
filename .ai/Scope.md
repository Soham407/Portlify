# Project Scope

> **Last verified**: 2026-03-17

---

## Core Product Definition
A portfolio-building platform where users create, customise, preview, and publicly share professional portfolios with multiple template options and AI-assisted content features.

---

## In-Scope Features

### 1. Authentication & Onboarding
- **Email/password** sign-up, sign-in, sign-out via Supabase Auth
- **OAuth callback** support (`/auth/callback`)
- **Password recovery**: Forgot password → email link → reset password form
- **Multi-step onboarding** (all protected routes):
  1. User Type Selection (fresher, job_seeker, expert, freelancer, professional)
  2. Career Setup (career type selection scoped to user type)
  3. Role Selection
- **Onboarding redirect logic**: `getOnboardingRedirect()` in `AuthContext.tsx` checks profile completeness and directs to the appropriate step

### 2. Portfolio Management
- **CRUD operations**: Create, read, update, delete portfolios
- **Multiple portfolios per user** with types: general, job_specific, industry_specific, client_specific, showcase
- **Default portfolio** designation (one per user)
- **Duplicate portfolio** with deep copy of bio section
- **Section ordering** configurable per user type via `section_order` column and `DEFAULT_SECTION_ORDER` constant
- **Visibility controls**: public/private toggle, moderation status

### 3. Portfolio Builder (`Builder.tsx` — core workspace)
- **Section editors** for: Bio, Skills, Projects, Experience, Education, Certifications, Contact
- **Auto-save** via `useAutoSave` hook (debounced)
- **Avatar upload** with `AvatarUpload` component
- **AI content polishing** with 4 tone presets (formal, friendly, technical, creative)
- **Drag-and-drop** section reordering
- **Validation rules** enforced (from `src/lib/constants.ts`):
  - Bio: 200 chars max, headline 150 chars, name 100 chars
  - Projects: 1–5 count, name 100 chars, description 500 chars
  - Skills: max 20
  - Username: 3–30 chars, pattern `/^[a-z0-9_-]+$/`
  - Password: min 6 chars

### 4. Template System
- **5 templates**: Glass, Night Owl, Vibrant, Editorial, Brutalist
- Template selection page with live previews
- Dynamic template rendering via `getTemplateComponent()` lookup
- Shared `PortfolioData` interface for all templates

### 5. Portfolio Sharing & Public Viewing
- **Public URL**: `/p/:username`
- **View analytics**: IP address, user agent, timestamp (via `log-portfolio-view` edge function)
- **Share permission check**: `can_share_portfolio()` RPC function
- **Completion tracking**: `get_portfolio_completion()` RPC function

### 6. SOP Generator
- AI-powered Statement of Purpose document creation
- Dedicated page at `/sop-generator`
- Uses `generate-sop` edge function

### 7. Data Import
- **LinkedIn import**: Parse structured data from LinkedIn profiles (`parse-linkedin` edge function)
- **GitHub sync**: Import project data from GitHub repositories (`sync-github` edge function)

### 8. Dashboard
- Central hub for portfolio management
- Portfolio cards, completion stats, analytics overview

### 9. Theming
- Light & dark mode via `next-themes` with `class` strategy
- Full CSS variable design system for both modes
- Custom gradient and glassmorphism utilities

---

## Out-of-Scope (Currently)
- Real-time collaboration or live editing
- Peer-to-peer chat / social messaging
- E-commerce / payment processing
- Custom domain routing (fields exist in schema but not functionally wired)
- CI/CD pipeline configuration
- Email/newsletter features
- Native mobile app (React Native)

---

## Security & Privacy

| Concern | Implementation |
|---|---|
| **Authorization** | PostgreSQL Row Level Security (RLS) on all user-owned tables |
| **Auth tokens** | JWT via Supabase Auth; `autoRefreshToken: true` on client |
| **Route protection** | `<ProtectedRoute>` HOC wraps all authenticated pages |
| **Input validation** | Zod schemas on forms + validation rules in `constants.ts` |
| **Content sanitization** | DOMPurify via `src/lib/sanitize.ts` for user-generated HTML |
| **Env secrets** | All keys use `import.meta.env.VITE_*`; `.env` is gitignored |
| **Share checks** | `can_share_portfolio()` server-side RPC before public access |
