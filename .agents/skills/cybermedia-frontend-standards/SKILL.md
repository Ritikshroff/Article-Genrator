---
name: cybermedia-frontend-standards
description: >
  Coding standards, architecture rules, and conventions for the CyberMedia
  AI Editorial Copilot Next.js frontend. Activate when making ANY change to
  the frontend codebase — new features, bug fixes, refactors, or reviews.
---

# CyberMedia Frontend — Agent & Developer Standards

## Stack
- **Framework**: Next.js (App Router) — read `node_modules/next/dist/docs/` before writing routing code
- **Language**: TypeScript (strict mode)
- **Styling**: Vanilla CSS + Tailwind-like utility classes inline (NO Tailwind library)
- **State**: React `useState` / `useContext` — no external state libraries
- **Data fetching**: `apiFetch` wrapper in `src/lib/apiClient.ts` — ALWAYS use this, never raw `fetch` for API calls
- **Auth**: `useAuth()` from `src/lib/authContext.tsx` — single source of truth for user/session

---

## Directory Structure (enforce this)
```
src/
  app/                        ← Next.js App Router pages
    (page)/page.tsx           ← Keep pages thin — no business logic here
    articles/[id]/page.tsx
    login/page.tsx
    api/generate/route.ts     ← Server-side API route (streaming)
  components/                 ← Shared, reusable UI components only
    OutputPanel.tsx           ← TODO: split into tab components
    Skeletons.tsx
    StepProgress.tsx
    ThemeToggle.tsx
    CustomSelect.tsx
    ui/                       ← Atomic base components (button, etc.)
  lib/
    apiClient.ts              ← API wrapper — DO NOT duplicate fetch logic elsewhere
    authContext.tsx           ← Auth context — DO NOT create parallel auth state
    types.ts                  ← ALL shared TypeScript interfaces (mirror backend schemas)
    magazineConfig.ts         ← Publication config
    utils.ts                  ← Pure utility functions only
```

### File Size Limits (hard rules)
- **Page files**: max ~300 lines. Extract into feature components or custom hooks if larger.
- **Component files**: max ~400 lines. Split into sub-components if larger.
- **`OutputPanel.tsx`** is currently 101KB — any new tab/section MUST be its own component file in `components/output/`.

---

## TypeScript Rules

### Always type API responses — NEVER use `any`
```ts
// ❌ Wrong
const [articles, setArticles] = useState<any[]>([]);

// ✅ Correct — use interface from src/lib/types.ts
import type { ArticleListItem } from "@/lib/types";
const [articles, setArticles] = useState<ArticleListItem[]>([]);
```

### All API response shapes must exist in `src/lib/types.ts`
```ts
// src/lib/types.ts — mirror backend schemas.py exactly
export interface ArticleListItem {
  id: string;
  title: string;
  publication: string;
  status: ArticleStatus;
  created_by_name: string;
  reviewed_by_name: string | null;
  author_rating: number | null;
  created_at: string;
  updated_at: string;
}

export type ArticleStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "revision_requested"
  | "published";
```

---

## React Patterns

### Effects — data fetching
```ts
// ✅ Correct pattern — fetch inside effect, no duplicate router.replace()
useEffect(() => {
  if (authLoading) return;
  if (!user || !requiredParam) return; // AuthProvider handles redirect
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<MyType>("/endpoint");
      setData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, [authLoading, user, requiredParam]);
```

### Never redirect inside page effects
The `AuthProvider` in `authContext.tsx` already handles `!token → /login` redirect. 
**Do NOT add `router.replace("/login")` in page-level effects** — this causes React error #310 in production (competing state updates).

### Custom hooks for complex state
Extract all non-trivial state + logic from page components into `use*.ts` hooks:
```ts
// src/features/generator/useGenerator.ts
export function useGenerator() {
  const [status, setStatus] = useState<GeneratorStatus>("idle");
  // ... all generation logic
  return { status, handleGenerate, handleReset, packageData };
}
```

### Error/loading states — every async operation needs all 3
```tsx
if (isLoading) return <MySkeletonComponent />;
if (error) return <ErrorDisplay message={error} />;
return <ActualContent data={data} />;
```

---

## UI / UX Rules

### Never use `alert()` or `confirm()`
```ts
// ❌ Wrong
alert("Failed: " + err.message);
if (!confirm("Delete?")) return;

// ✅ Correct — use a toast or modal component
// (implement a simple toast context or use a status message div)
```

### Brand colors — use CSS variables, not hardcoded hex
```css
/* globals.css */
:root {
  --color-dq: #e30613;     /* Dataquest / PCQuest red */
  --color-vd: #00839b;     /* Voice&Data teal */
}
```
```tsx
// ❌ Wrong
style={{ color: "#e30613" }}
// ✅ Correct
style={{ color: "var(--color-dq)" }}
// or use the className pattern already established
```

### Skeleton components for ALL async content
Every page/section that fetches data must show a skeleton while loading, not a blank/spinner.

---

## Authentication Rules
- The `isLoading` (authLoading) state from `useAuth()` starts as `true` — always guard against it before making API calls
- `isEditor` and `isAuthor` booleans from `useAuth()` control what UI is shown — use these, never `user.role === "editor"` inline
- Session is stored in `localStorage` (`auth_token`, `auth_user`) — do not duplicate or shadow these

---

## API Client Rules
- ALWAYS use `apiFetch<T>()` from `@/lib/apiClient` for all backend calls
- NEVER call `https://api.cybermedia.in` directly in components — let `getApiBaseUrl()` handle environment routing
- The only exception is the streaming `/api/generate` route which uses raw `fetch` with `response.body.getReader()` — this is intentional

---

## What NOT to do
- ❌ Do not add `useRouter` to `useEffect` dependency arrays unless `router` is actually used inside the effect
- ❌ Do not create new auth state — all auth is in `authContext.tsx`
- ❌ Do not inline `fetch()` calls — always go through `apiFetch`
- ❌ Do not put business logic in page files — use components or custom hooks
- ❌ Do not commit `.env.local` — it is gitignored for a reason
- ❌ Do not commit `node_modules/`, `.next/`, or `*.zip` files
