# Foursquare Media Gallery (fgs-praise26)

A media gallery web app for **Foursquare Gospel Church Awesome Arena** — streams videos hosted on Google Drive, with likes, comments (with threaded replies), share tracking, and a CMS-style admin panel.

- **Live site:** https://fgc-awesome-arena.vercel.app
- **Repo:** github.com/Bluezo-tech/FGS-Awesom-Arena-Praise-Night26
- **Built by:** [Bluezo-Tech](https://github.com/Bluezo-tech)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind / hand-written CSS in `app/globals.css` |
| Database | Supabase (Postgres) |
| Video source | Google Drive (via a service-account-authenticated streaming proxy) |
| Hosting | Vercel |
| Analytics | Vercel Web Analytics |

---

## Getting Started (Local Setup)

### 1. Clone and install
```bash
git clone https://github.com/Bluezo-tech/FGS-Awesom-Arena-Praise-Night26.git
cd FGS-Awesom-Arena-Praise-Night26
npm install
```

### 2. Set up environment variables
Copy the example file and fill in real values (ask a project owner for these — they are **not** in git):
```bash
cp .env.example .env.local
```

You'll need:
- `GOOGLE_DRIVE_FOLDER_ID` — the Drive folder holding the videos
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` — a Google Cloud service account with read access to that Drive folder
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project keys (public, safe client-side)
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only**, never expose this, used for admin writes
- `ADMIN_EMAIL` — email allowed to log into `/admin`
- `NEXT_PUBLIC_SITE_URL` — used for share links / Open Graph metadata (defaults to `https://foursquare.media` if unset)

### 3. Set up the database
Run `supabase/schema.sql` once in the Supabase project's **SQL Editor**. It's idempotent (`create table if not exists`), so it's safe to re-run if the schema changes — just paste the whole file in again.

### 4. Run locally
```bash
npm run dev
```

---

## Available Scripts
```bash
npm run dev     # start local dev server
npm run build   # production build
npm run start   # run a production build locally
npm run lint    # next lint
```

---

## Project Structure

```
app/
  page.tsx                        # homepage (renders MediaGallery)
  layout.tsx                      # root layout, includes <Analytics />
  admin/page.tsx                  # admin panel page
  watch/[id]/page.tsx             # video watch page
  globals.css                     # all site styling
  api/
    videos/                       # public video list/detail endpoints
      route.ts
      [id]/route.ts
      [id]/like/route.ts
      [id]/view/route.ts
      [id]/share/route.ts
      [id]/comments/route.ts      # GET/POST comments + replies
    admin/                        # service-role-key-gated admin endpoints
      videos/route.ts
      comments/route.ts
      settings/route.ts
    settings/route.ts             # public read of site_settings (CMS content)
    drive-stream/[fileId]/route.ts # authenticated Google Drive video proxy

components/
  site-header.tsx                 # shared header (logo, nav) — used on home + watch page
  site-footer.tsx                 # shared footer (socials, TikTok embed, links)
  media-gallery.tsx               # homepage video grid/library
  video-player.tsx                # <video> wrapper, resolves Drive-proxy vs other sources
  video-watch.tsx                 # watch page: player, likes, shares, comments/replies UI
  admin-panel.tsx                 # admin UI for managing videos/comments/settings

lib/
  google-drive.ts                 # Google Drive service-account client + listing
  supabase-admin.ts               # Supabase client using the service role key (server only)
  videos.ts                       # merges Drive file data with Supabase video_metadata

supabase/
  schema.sql                      # full DB schema — tables, indexes, RLS policies
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how these pieces fit together.

---

## Deployment

- **Vercel is Git-linked** to the `main` branch — any `git push origin main` auto-deploys to production.
- Direct `vercel --prod` CLI deploys have been unreliable on some networks; **git push is the reliable path**.
- Environment variables live in the Vercel dashboard (Project → Settings → Environment Variables), and must be kept in sync with `.env.local` manually — they are **not** synced automatically from `.env.example`.

---

## Security Notes

- `.env.local`, `.next/`, and `tsconfig.tsbuildinfo` are gitignored — **never commit these**.
- `SUPABASE_SERVICE_ROLE_KEY` and the Google service account private key are server-only secrets. If GitHub push protection ever flags a leaked secret, rotate the key in Supabase/Google Cloud immediately and update Vercel's env vars.
- Comments are currently **auto-approved** on submission (no moderation queue) — see `app/api/videos/[id]/comments/route.ts`.

---

## Known Pending Work

- [ ] Full CMS editability — extend `public.site_settings` + `admin-panel.tsx` so header logo, footer text/social links, hero section, About section copy, and video categories are all editable from `/admin` without a code change.
- [ ] Confirm repo visibility (public vs. private) is set appropriately for a commercial project.
