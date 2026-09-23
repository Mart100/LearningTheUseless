# Learning The Useless — Knowledge Arcade

A collection of mini-games for facts nobody asked you to learn.
Currently live at **[learning-the-useless.vercel.app](https://learning-the-useless.vercel.app/)**.

> **Looking for the original v1 build?**
> See [`docs/CLASSIC.md`](docs/CLASSIC.md) for how to deploy the frozen museum snapshot
> (`archive/v1` / tag `v1-classic`) as its own Vercel project.

---

## Games

| Game | Route | Supabase table |
|---|---|---|
| Digits of Pi | `/pi` | `game_pi` |
| World Flags | `/flags` | `game_flags` |

Adding a third game = one entry in `src/lib/games/registry.ts` + a new route.

---

## Stack (revival, Phase 1+)

| Tool | Version |
|---|---|
| Svelte | 5 |
| SvelteKit | 2 |
| Vite | 5 |
| `@supabase/ssr` | 0.5+ |
| `@sveltejs/adapter-vercel` | 5 |

Auth is handled server-side via `@supabase/ssr` (`createServerClient` in hooks,
`createBrowserClient` / `createServerClient` in the layout load).

---

## Local development

### Prerequisites

- Node.js 20+
- A Supabase project (reuse `qrciyzovgxpamjuacxnx` or create your own for local dev)

### Setup

```bash
npm install
```

Create `.env.local`:

```env
PUBLIC_SUPABASE_URL=https://qrciyzovgxpamjuacxnx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

```bash
npm run dev
```

### Type generation

```bash
npm run updateSupabaseTypes
```

### Build

```bash
npm run build
npm run preview
```

---

## Supabase schema (existing — no migrations needed for Phase 1)

| Table | Purpose |
|---|---|
| `profiles` | User profiles: `id, username, avatar_url, following` |
| `game_pi` | Pi game scores: `id, user_id, score, played_at` |
| `game_flags` | Flags game scores: `id, user_id, score, played_at` |
| `game_stats` | Aggregate stats per game: `game, data` |

---

## Deployment (Vercel)

The app deploys automatically from `main` via the existing Vercel project.

For the classic museum deployment, see [`docs/CLASSIC.md`](docs/CLASSIC.md).
