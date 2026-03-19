# Claude Instructions

> Read `Context.md` and `Scope.md` in this folder before making any changes.

---

## 1. Mandatory Pre-checks

- [ ] **Read `.ai/Context.md`** for architecture, schema, and folder map
- [ ] **Read `.ai/Scope.md`** for feature boundaries and validation rules
- [ ] **Check `src/integrations/supabase/types.ts`** before writing any Supabase query — verify table names, column names, and types against the auto-generated definitions
- [ ] **Search existing hooks in `src/hooks/`** before creating new data-fetching logic — a hook may already exist

---

## 2. Code Conventions

### TypeScript
- `strict: false` is the current tsconfig setting — do NOT assume strict null checks are enforced
- Prefer explicit types over `any`; use `unknown` when the type is truly unknown
- Use `arrow functions` for all React components and hooks
- Import using the `@/` alias (e.g., `import { cn } from "@/lib/utils"`)

### React Patterns
- **Functional components only** — no class components
- State management: `useState`, `useReducer`, or React Query cache — never raw `useRef` for state
- Auth state: always use `useAuth()` from `@/contexts/AuthContext` — never create a separate Supabase auth listener
- Theme: use `useTheme()` re-exported from `@/contexts/ThemeContext`

### Styling
- **Tailwind CSS only** — no inline `style={}` objects unless absolutely necessary (e.g., dynamic values from data)
- Use `cn()` from `@/lib/utils` for conditional class merging (not raw template literals)
- Use existing design tokens from `index.css`: `bg-primary`, `text-muted-foreground`, `bg-surface`, `shadow-card`, `glass`, `text-gradient`, etc.
- For dark mode: use `dark:` Tailwind variants — the token system handles it via CSS variables

### Component Usage
- **Always check `src/components/ui/`** first — 49 shadcn components are installed
- Do NOT install duplicate UI packages (no Material UI, Chakra, etc.)
- For forms: use `react-hook-form` + `zod` resolvers with shadcn `<Form>` components
- For notifications: use `sonner` toast (preferred) — it's already mounted in `App.tsx`

---

## 3. Data Layer Rules

### Supabase Queries
- **Every query must be wrapped in a React Query hook** in `src/hooks/`
- Pattern: `useQuery` for reads, `useMutation` for writes
- Always call `queryClient.invalidateQueries()` in `onSuccess` callbacks (see `usePortfolio.ts` for the pattern)
- Access the Supabase client via: `import { supabase } from "@/integrations/supabase/client"`
- Never import from `@supabase/supabase-js` directly in components

### Schema Awareness
- `types.ts` is auto-generated — **never edit it manually**
- To regenerate types, use: Supabase CLI or MCP `generate_typescript_types`
- When adding a new table: create a migration in `supabase/migrations/`, then regenerate types

### RLS Requirements
- Every new table MUST have RLS policies
- Assume `auth.uid()` is the authenticated user
- Always provide the migration SQL alongside any schema change suggestion

---

## 4. File Organization

| What | Where |
|---|---|
| New page component | `src/pages/NewPage.tsx` + add route in `App.tsx` |
| New reusable component | `src/components/` (create subfolder if domain-specific) |
| New shadcn component | Run `npx shadcn@latest add <component>` |
| New data hook | `src/hooks/useNewThing.ts` |
| New constant/enum | `src/lib/constants.ts` |
| New utility function | `src/lib/` (new file or extend `utils.ts`) |
| Database migration | `supabase/migrations/<timestamp>_<name>.sql` |
| Edge function | `supabase/functions/<function-name>/index.ts` |

---

## 5. Template System

When modifying or creating portfolio templates:
- Implement the `PortfolioData` interface from `src/components/templates/PortfolioTemplateProps.ts`
- Register in `src/components/templates/index.ts` `TEMPLATE_MAP`
- Add entry in `TEMPLATES` array in `src/lib/constants.ts`
- Template IDs are: `minimal`, `developer`, `creative`, `corporate`, `photography`

---

## 6. Safety Rules

1. **NEVER hardcode Supabase URLs or keys** — use `import.meta.env.VITE_*`
2. **NEVER bypass `<ProtectedRoute>`** for authenticated pages
3. **NEVER edit `src/integrations/supabase/types.ts`** manually
4. **NEVER edit `src/components/ui/`** files manually (managed by shadcn CLI)
5. **NEVER use `require()`** — this is an ESM-only Vite project
6. **NEVER suggest installing new dependencies** without explicitly noting it — prefer native solutions first
7. **Always sanitize user-generated HTML** using `src/lib/sanitize.ts`
8. **Provide incremental changes** — small, atomic edits over sweeping rewrites

---

## 7. Testing

- Framework: **Vitest** + **Testing Library**
- Test files go in `src/test/`
- Globals are enabled (`vitest/globals` in tsconfig types)
- Run tests: `npm run test` (single run) or `npm run test:watch`

---

## 8. Commands Reference

```sh
npm run dev          # Start dev server (port 8080)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint
npm run test         # Vitest single run
npm run test:watch   # Vitest watch mode
```
