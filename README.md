# TTFM Production — website

A Next.js (App Router) production build for [thetruefamemedia.com](https://thetruefamemedia.com).

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). (This URL is local-only — nothing in the
deployed site references it.)

## Production build

```bash
npm run build
npm run start
```

`npm run build` must succeed with zero errors before deploying.

## Deploying to Vercel

1. Push this project to a Git repository (GitHub/GitLab/Bitbucket), or import it directly as a
   folder via the Vercel CLI (`vercel`).
2. In the Vercel dashboard, **New Project → Import** this repository. Framework preset:
   **Next.js** (auto-detected).
3. **Environment Variables** — add:
   - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — the verification code Google Search Console gives
     you when you add `thetruefamemedia.com` as a property (Settings → Ownership verification →
     HTML tag → copy just the `content="..."` value). Leave it unset if you haven't verified yet;
     the site works fine either way, and the meta tag only renders once this is set.
4. **Domains** — in the project's Settings → Domains, add `thetruefamemedia.com` (and
   `www.thetruefamemedia.com` if you want the `www` redirect) and follow Vercel's DNS
   instructions at your domain registrar.
5. Deploy. Once live, re-check Google Search Console — the sitemap is at
   `https://thetruefamemedia.com/sitemap.xml` and robots at
   `https://thetruefamemedia.com/robots.txt`.
6. For the YouTube API OAuth consent screen, the required Privacy Policy and Terms of Service
   URLs are:
   - `https://thetruefamemedia.com/privacy-policy`
   - `https://thetruefamemedia.com/terms`

## Project structure

- `app/` — routes (App Router). Notable pages: `/`, `/creators`, `/privacy-policy`, `/terms`,
  and a custom `not-found.tsx` (404).
- `components/` — sections, layout chrome, and shared UI.
- `public/videos/`, `public/images/` — prototype media, each with a `MANIFEST.md` listing
  source and license for every file (all free for commercial use). Replace any file by keeping
  its filename so components don't need code changes.
- `data/` — structured content (service/craft data, creators data).

## Content notes

- Contact details, domain, and stats live in a handful of places: `app/layout.tsx`,
  `app/sitemap.ts`, `app/robots.ts`, `app/creators/layout.tsx`,
  `components/layout/Footer.tsx`, `components/sections/Contact.tsx`,
  `components/sections/Numbers.tsx`.
- `/privacy-policy` and `/terms` content is sourced from the client-provided legal documents for
  BK Media OS / The True Fame Media's YouTube API usage — update those two page files directly if
  the underlying policy changes.
