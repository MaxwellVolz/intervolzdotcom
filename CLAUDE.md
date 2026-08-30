# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a statically-generated blog/portfolio site built with Next.js, MDX, and Decap CMS. Content is Git-backed with automated Jenkins deployment to NGINX via Cloudflare Tunnel. The homepage leads with hand-listed grids of things you can open (`~/live` products, `~/games`, `~/art`), then article buckets: `devlog` (build stories) and `work` (`work: true`), which a post can be in at the same time, plus `tutorials` as the exclusive catch-all, with `all` listing the complete archive.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production (outputs to /out)
npm run build

# Format code
npm run format
```

## Architecture

### Static Site Generation

- **Next.js**: Configured with `output: 'export'` for static export
- **Content**: MDX files in `/content/posts` with gray-matter frontmatter
- **Routes**: Dynamic routing via `pages/[slug].tsx` for blog posts
- **Rendering**: `next-mdx-remote` for MDX serialization with remark/rehype plugins

### Content Management

- **Decap CMS**: Visual editor accessible at `/admin` route
- **Config**: `public/admin/config.yml` defines content schema
- **Frontmatter fields**:
  - `title`, `date`, `description` (meta description, 150-160 chars — required),
    `cover` (optional image)
  - `devlog` (build stories), `work` (client engagements), `technical` (build
    write-ups), `draft` (hidden from the homepage, still builds at its URL),
    `pinned` (inert — read by nothing). Flags pick the section only; every
    section is ordered by `date`, newest first.
  - `tags` (space-separated or array)
- **Media**: Uploaded to `public/uploads`

### MDX Processing Pipeline

Blog posts are processed with these plugins (configured in `pages/[slug].tsx`):

1. **remarkSubstitutions** (`lib/remarkSubstitutions.ts`): Custom text replacements
   - `->` → `→`, `<-` → `←`, `<3` → `♥`
   - `::text::` → `<Kbd>text</Kbd>` component
2. **remarkGfm**: GitHub-flavored markdown support
3. **rehypePrettyCode**: Syntax highlighting with `github-dark` theme

### SEO Files

`scripts/generate-seo-files.mjs` runs as the npm `prebuild` step and writes
`robots.txt`, `sitemap.xml`, `rss.xml` and `llms.txt` into `public/` (they are
gitignored — the build regenerates them). They must be produced by the build:
`deploy_blog.sh` does `rm -rf` on the web root, so hand-placed files do not survive.

Add new standalone apps under `public/` to the `SUB_APPS` list in that script so
they land in the sitemap. Thin or duplicate routes go in `EXCLUDED` and should also
carry `<Seo noindex>`.

All page metadata goes through `components/Seo.tsx`; site-level constants live in
`lib/site.ts`. Do not hand-write `<Head>` meta in a page.

### Deployment Flow

1. **Git Push**: Commits to master branch trigger Jenkins webhook
2. **Jenkins Pipeline** (`Jenkinsfile`):
   - Installs dependencies with npm
   - Builds site with `npm run build` (NODE_ENV=production)
   - Executes `sudo /usr/local/bin/deploy_blog.sh intervolz out`
   - Archives artifacts
3. **NGINX**: Serves static files from `/var/www/intervolz`
4. **Cloudflare Tunnel**: Exposes localhost:80 without public IP

### Page Organization

- **`pages/index.tsx`**: Homepage. Holds `ZONES` (hand-listed grids: `~/live`, `~/games`, `~/art`) which render first, then three curated `ls`-styled buckets: `~/devlog/` and `~/work/` are independent filters and a post can appear in both, `~/tutorials/` takes only what neither claimed. Then `~/all/` as the full paged archive. Also holds the `TAG_COLORS` map.
  A live product is a `ZONES` item, never a post flag: `~/live` answers "what is running," which is a fact about a URL
- **`pages/[slug].tsx`**: Individual blog post template
- **Decap CMS**: served statically from `public/admin/` (there is no `pages/admin.tsx`)
- **`components/layout/`**: IDE-themed layout components (unused in current build).
  They live in `components/` deliberately — inside `pages/` Next exported each one
  as its own indexable URL.
- **`pages/scenes/`**: Three.js experimental pages
- **Special pages**: `room.tsx`, `earth.tsx` (interactive demos), `old.tsx` (previous
  homepage), `404.tsx`. All are `noindex`.

### Styling

- **Tailwind CSS**: Primary styling system with custom theme
- **Typography**: `@tailwindcss/typography` for prose content
- **Fonts**: Orbitron (display), Roboto Mono (monospace), both self-hosted WOFF2 in
  `public/fonts/`. `sans` is the system stack — Inter was shipped but never applied,
  and was removed.
- **Color scheme**: VSCode-inspired dark theme colors, plus muted tag colors
- **Dark mode**: Managed via `data-theme` attribute on `<html>`, persisted to localStorage

### Path Aliases

TypeScript configured with `@/*` alias mapping to project root:

```typescript
import { Kbd } from '@/components/Kbd';
```

## Content Workflow

### Writing Style — READ THIS FIRST

**Before drafting or editing any article, read [`docs/writing-style.md`](docs/writing-style.md).**

It is the derived house style for `content/posts/`: frontmatter semantics (what each
flag actually does), the article skeleton, voice rules with examples from the corpus,
the table / ASCII-diagram / code-excerpt conventions, the MDX substitution gotchas,
and a pre-publish checklist. Do not re-derive the voice by reading the archive.

### Creating Posts

**Via Decap CMS (Recommended)**:

1. Visit http://localhost:3000/admin
2. Authenticate with GitHub
3. Create/edit post with visual editor
4. Publish triggers Git commit and deployment

**Manual**:

1. Create `.mdx` file in `content/posts/`
2. Add frontmatter with required fields (`title`, `date`, `tags`)
3. Use `devlog: true` for a build story, `work: true` for a client engagement,
   `technical: true` for a teaching post (`pinned` is inert — nothing reads it)
4. Commit and push to trigger deployment

**Staging a post for review**: set `draft: true`. It is hidden from the homepage
but still builds at `/<slug>/`, so a branch preview deploy is readable on a phone.

### Tag System

Tags use predefined colors in the `TAG_COLORS` map in `pages/index.tsx`. A tag with
no entry renders grey, so add new tags there when introducing one. Current families:

- Frontend: `web`, `react`, `threeJS`, `dataviz`, `javascript`
- Languages/backend: `python`, `rust`, `swift`, `fastapi`, `backend`
- AI: `ai`, `llm`, `ml`
- 3D/creative: `blender`, `art`, `unity`
- Automation/devops: `automation`, `n8n`, `docker`, `windows`, `CI/CD`
- Writing/meta: `howto`, `blog`, `rant`, `@meta`

## Special Features

### Copy Code Buttons

Automatic copy buttons added to code blocks via `useEffect` in `pages/[slug].tsx`. No configuration needed.

### SVG Support

Webpack configured to handle SVG imports as React components via `@svgr/webpack`.

### Three.js Integration

Experimental 3D scenes in `/lib` directory:

- `initEarth.tsx`, `initScene.tsx`: Scene setup utilities
- `loadGLTFRoom.tsx`: GLTF model loading
- `RendererManager.tsx`: Three.js renderer lifecycle

## Important Notes

- Site uses `trailingSlash: true` - all routes end with `/`
- TypeScript strict mode is disabled (`strict: false`)
- Development uses `next dev`, production builds use `next build` (not `next start`)
- Static export means no server-side runtime features (no API routes in production)
- Blog posts require `.mdx` extension (not `.md`)
