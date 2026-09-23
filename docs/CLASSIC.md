# Deploying the Classic Museum Version

The original ("v1 classic") app is frozen on:

- **Branch:** `archive/v1`
- **Tag:** `v1-classic`

This document explains how to run it as a separate "museum" Vercel project alongside the active revival.

---

## 1. What is the classic version?

The classic app is the first production release of Learning The Useless: Digits of Pi + Flags
games with Supabase auth, friend leaderboards, and the original retro-white UI (commit `1074adb`,
September 2023). It shares the same Supabase project (`qrciyzovgxpamjuacxnx`, name
`LearningTheUseless`) and must continue to do so — a second Supabase project is not possible on
the free tier (the `readchinese` project occupies the other slot).

---

## 2. Creating the museum Vercel project

### Steps in the Vercel dashboard

1. **New Project → Import Git Repository** — choose `Mart100/LearningTheUseless`.
2. **Project name:** `learning-the-useless-classic` (or any name you prefer).
3. **Framework Preset:** SvelteKit (Vercel auto-detects this).
4. Under **Git Branch**, select `archive/v1` instead of `main`.
5. **Disable auto-deploy for this project** (see §3 below) so the classic snapshot stays frozen.
6. Add environment variables (§4 below) and click **Deploy**.

---

## 3. Keeping the classic pinned (disable auto-deploy)

You want the classic project to _never_ redeploy when new commits land on `archive/v1`
(there should not be any, but belt-and-suspenders):

- In the classic Vercel project: **Settings → Git → Deploy Hooks / Branch Controls** — set
  "Production Branch" to `archive/v1` and **turn off** "Auto-deploy on push".
- Alternatively: delete the GitHub integration from the classic project entirely and
  rely only on manual "Redeploy from existing build" if you ever need to rebuild.

The `v1-classic` annotated tag marks the exact commit that should always serve as the museum.
If you ever need to manually trigger a build, select the tag or the commit SHA in the Vercel UI.

---

## 4. Environment variables

The classic app uses exactly the same env vars as the revival. Reuse the same Supabase project —
**do not create a new one**.

| Variable | Value |
|---|---|
| `PUBLIC_SUPABASE_URL` | `https://qrciyzovgxpamjuacxnx.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | *(your existing anon key)* |

Copy these from your current production Vercel project under **Settings → Environment Variables**,
or from your `.env.local` file. No schema changes are needed; the classic app uses the existing
`profiles`, `game_pi`, `game_flags`, and `game_stats` tables unchanged.

---

## 5. Domain strategy

Two reasonable options:

### Option A — Classic on a subdomain (recommended)

| Project | Domain |
|---|---|
| Revival (main) | `learning-the-useless.vercel.app` (production) |
| Classic (museum) | `classic.learning-the-useless.vercel.app` |

This keeps the production URL for the revival and gives the museum a memorable address.
Add the custom domain under the classic project's **Settings → Domains**.

### Option B — Classic keeps the production URL during transition

If you want to leave the live site untouched while the revival is in beta:

- Keep the classic Vercel project as the main `learning-the-useless.vercel.app` project.
- Deploy the revival to a separate Vercel project with its own URL (e.g.
  `learning-the-useless-next.vercel.app`).
- Swap the production domain once the revival is ready.

---

## 6. Optional "This is the classic version" banner

Since the classic is a completely separate Vercel deployment, you don't _need_ to modify
`archive/v1` at all. If you want a lightweight visual hint for users who end up on the museum URL,
add one line to `src/app.html` (in a branch off `archive/v1`, or as a one-off Vercel environment
variable driven message):

```html
<!-- add inside <body>, before %sveltekit.body% -->
<div style="background:#1a1a2e;color:#7c3aed;text-align:center;padding:6px;font-family:sans-serif;font-size:13px">
  📦 You are viewing the classic v1 museum snapshot —
  <a href="https://learning-the-useless.vercel.app" style="color:#06b6d4">visit the revival →</a>
</div>
```

This is intentionally _not_ committed to `archive/v1` to keep it truly frozen. Apply it only if
you decide the banner is worth a one-off commit.

---

## 7. Quick reference

| Thing | Value |
|---|---|
| Frozen branch | `archive/v1` |
| Frozen tag | `v1-classic` |
| Supabase project id | `qrciyzovgxpamjuacxnx` |
| Supabase project name | `LearningTheUseless` |
| Suggested museum domain | `classic.learning-the-useless.vercel.app` |
| Museum Vercel project name | `learning-the-useless-classic` |
