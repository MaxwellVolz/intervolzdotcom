# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a statically-generated blog/portfolio site built with Next.js, MDX, and Decap CMS. Content is Git-backed with automated Jenkins deployment to NGINX via Cloudflare Tunnel. The site serves as a personal portfolio showcasing blog posts bucketed on the homepage as `now` (in progress), `shipped` (`work: true`), `technical`, and everything else as articles.

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
  - `title`, `date`, `cover` (optional image)
  - `in_progress` (current work), `work` (shipped projects), `technical` (build
    write-ups; also sorts above non-technical posts), `draft` (hidden from the
    homepage, still builds at its URL), `pinned` (inert — read by nothing)
  - `tags` (space-separated or array)
- **Media**: Uploaded to `public/uploads`

### MDX Processing Pipeline

Blog posts are processed with these plugins (configured in `pages/[slug].tsx`):

1. **remarkSubstitutions** (`lib/remarkSubstitutions.ts`): Custom text replacements
   - `->` → `→`, `<-` → `←`, `<3` → `♥`
   - `::text::` → `<Kbd>text</Kbd>` component
2. **remarkGfm**: GitHub-flavored markdown support
3. **rehypePrettyCode**: Syntax highlighting with `github-dark` theme

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

- **`pages/index.tsx`**: Homepage with post listings in four `ls`-styled buckets (`~/now/`, `~/shipped/`, `~/technical/`, `~/articles/`) and the `TAG_COLORS` map
- **`pages/[slug].tsx`**: Individual blog post template
- **`pages/admin.tsx`**: Decap CMS entry point
- **`pages/layout/`**: IDE-themed layout components (unused in current build)
- **`pages/scenes/`**: Three.js experimental pages
- **Special pages**: `room.tsx`, `earth.tsx`, `dank.tsx`, `arcade.tsx`, `leaderboard.tsx` (interactive demos)

### Styling

- **Tailwind CSS**: Primary styling system with custom theme
- **Typography**: `@tailwindcss/typography` for prose content
- **Fonts**: Inter (sans), Orbitron (display), Roboto Mono (monospace)
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
3. Use `in_progress: true` for current work, `work: true` for shipped projects,
   `technical: true` for build write-ups (`pinned` is inert — nothing reads it)
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
