# Gemini Instructions

> Read `Context.md` and `Scope.md` in this folder before making any changes.

---

## 1. Mandatory Pre-checks

- [ ] **Read `.ai/Context.md`** for architecture, schema, and folder map
- [ ] **Read `.ai/Scope.md`** for feature boundaries and validation rules
- [ ] **Verify column names** against `src/integrations/supabase/types.ts` before writing any database query
- [ ] **Search `src/hooks/`** before creating new data-fetching logic — reuse existing hooks

---

## 2. Environment Constraints

### Vite + ESM Only
- This is a **Vite** project with `"type": "module"` — **never use `require()`**
- All imports must be ES module syntax: `import ... from "..."`  
- Path alias: `@/` maps to `./src/` — always use it (e.g., `import { cn } from "@/lib/utils"`)
- Dev server runs on `port 8080` with HMR overlay disabled
- Build target: `ES2020`

### TypeScript
- `strict: false` — implicit `any` is allowed but discouraged
- `noUnusedLocals: false`, `noUnusedParameters: false` — cleanup is not enforced
- Prefer explicit types; use `unknown` over `any` where possible
- Always export component types from the module they belong to

---

## 3. Code Conventions

### Components
- **Arrow function components only** — no `function` declarations for components
- Use `React.FC<Props>` optionally or rely on return-type inference
- State: `useState`, `useReducer`, or React Query cache
- Auth: always via `useAuth()` from `@/contexts/AuthContext`
- Theme: always via `useTheme()` from `@/contexts/ThemeContext` (re-exports `next-themes`)

### Styling
- **Tailwind CSS only** — no raw CSS files unless for complex animations with no Tailwind equivalent
- Class merging: use `cn()` from `src/lib/utils.ts` (wraps `clsx` + `tailwind-merge`)
- Design tokens are CSS variables in `src/index.css` — use them via Tailwind classes:
  - Colors: `bg-primary`, `text-foreground`, `bg-surface`, `bg-surface-elevated`, `text-muted-foreground`
  - Gradients: `bg-gradient-primary`, `bg-gradient-hero`, `text-gradient`
  - Shadows: `shadow-glow`, `shadow-card`
  - Effects: `glass` (glassmorphism combo utility)
- Dark mode: `dark:` variants — CSS variables automatically switch

### Forms
- Use `react-hook-form` + `zod` schema resolvers
- Use shadcn `<Form>`, `<FormField>`, `<FormItem>`, `<FormControl>` components from `src/components/ui/form.tsx`
- Refer to validation constants in `src/lib/constants.ts` for limits

### Notifications
- Use **sonner** for toast notifications (already mounted as `<Sonner />` in `App.tsx`)
- The app also has a shadcn `<Toaster />` — `sonner` is preferred for new code

---

## 4. Data Layer

### Supabase Client
```typescript
import { supabase } from "@/integrations/supabase/client";
```
- The client is a typed singleton: `createClient<Database>(URL, KEY)`
- Never create additional Supabase client instances

### React Query Pattern
Every database operation follows this pattern (see `src/hooks/usePortfolio.ts` as reference):
```typescript
// Read
const { data, isLoading } = useQuery({
  queryKey: ["entity-name", userId],
  queryFn: async () => {
    const { data, error } = await supabase.from("table").select("*").eq("user_id", userId);
    if (error) throw error;
    return data;
  },
  enabled: !!userId,
});

// Write
const mutation = useMutation({
  mutationFn: async (payload) => {
    const { data, error } = await supabase.from("table").insert(payload).select().single();
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["entity-name"] });
  },
});
```

### Schema Rules
- `src/integrations/supabase/types.ts` is **auto-generated** — never edit manually
- When suggesting schema changes, always provide the migration SQL
- Every new table must include RLS policies

---

## 5. File Placement

| New Item | Location |
|---|---|
| Route page | `src/pages/PageName.tsx` → register in `App.tsx` routes |
| Domain component | `src/components/<domain>/ComponentName.tsx` |
| UI primitive | `npx shadcn@latest add <name>` (never create manually) |
| Data hook | `src/hooks/useEntityName.ts` |
| Constant/enum | Add to `src/lib/constants.ts` |
| Utility | `src/lib/utilityName.ts` or extend `utils.ts` |
| DB migration | `supabase/migrations/<timestamp>_<description>.sql` |
| Edge function | `supabase/functions/<name>/index.ts` |

---

## 6. Template System

5 portfolio templates in `src/components/templates/`:
- All implement `PortfolioData` interface from `PortfolioTemplateProps.ts`
- Registry: `TEMPLATE_MAP` in `src/components/templates/index.ts`
- Metadata: `TEMPLATES` array in `src/lib/constants.ts`
- To add a template: create component → add to `TEMPLATE_MAP` → add to `TEMPLATES` constant

---

## 7. Prohibited Actions

1. ❌ `require()` — ESM only
2. ❌ Editing `src/integrations/supabase/types.ts`
3. ❌ Editing `src/components/ui/*` files (shadcn-managed)
4. ❌ Hardcoding Supabase URLs or keys
5. ❌ Installing UI libraries (no MUI, Chakra, Mantine, etc.)
6. ❌ Creating separate auth listeners (use `useAuth()` context)
7. ❌ Bypassing `<ProtectedRoute>` for authenticated routes
8. ❌ Suggesting new `npm install` without flagging it explicitly

---

## 8. Output Format

- Use **PowerShell** syntax for terminal commands (Windows environment)
- Format all code with proper TypeScript syntax
- When showing file changes, specify the exact file path with `@/` alias
- Use markdown diff blocks for before/after comparisons
- Keep explanations concise — prioritize working code over lengthy descriptions

---

## 9. Commands Reference

```powershell
npm run dev          # Start dev server (port 8080)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run test         # Vitest single run
npm run test:watch   # Vitest watch mode
```
