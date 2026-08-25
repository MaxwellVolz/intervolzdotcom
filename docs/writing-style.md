# Writing style — articles on intervolz.com

How posts in `content/posts/` are written. Derived from the existing corpus, not
invented: every rule below is followed by at least three published articles, and
the examples are quotes, not inventions.

**Read this before drafting a post.** It exists so the voice does not have to be
re-derived from the archive every time.

Reference articles, in rough order of how current the voice is:

| Article                              | Why read it                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| `developing-slashwork.mdx`           | The current template. Dated beats, commit anchors, a pivot, bold-lead lessons. |
| `the-standard-stack-with-claude.mdx` | Best use of tables and ASCII flow diagrams. Teaching register.                 |
| `developing-sollewitt.mdx`           | Best "here is the bug and the fix" section. Code excerpts done right.          |

---

## 1. Mechanics

### File and URL

- `content/posts/<slug>.mdx` — **`.mdx`, never `.md`**
- Slug is the filename; `trailingSlash: true`, so it serves at `/<slug>/`
- Dev-story posts are named `developing-<project>` by convention
  (`developing-slashwork`, `developing-sollewitt`, `developing-ggoverlay`)

### Frontmatter

Every field, every time — Decap writes them all, so hand-written posts should match.

```yaml
---
title: Zero → WebApp with Claude
date: 2026-06-22T10:00:00.000-07:00
description: 'Part two of building with Claude: the standard stack. Next.js on Vercel, Supabase and Stripe, deployed the same way every time so each feature is routine.'
cover: ''
technical: true
draft: false
work: false
pinned: false
in_progress: false
tags: ai llm web automation react
---
```

What each one **actually does** (`lib/getPosts.ts`, `pages/index.tsx`):

| Field         | Effect                                                                                                                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`       | Heading and `<title>`. Not repeated as an `#` in the body.                                                                                                                                                           |
| `date`        | ISO 8601 **with offset** (`-07:00` PDT / `-08:00` PST). Sorts within a bucket.                                                                                                                                       |
| `description` | **Required.** The `<meta name="description">`, the og/twitter description, the RSS summary, and the SERP snippet. 150–160 characters, one sentence, no throat-clearing. Write it like the lede: what it is, plainly. |
| `cover`       | Optional image for the index, the post header, and the og:image. `''` is normal.                                                                                                                                     |
| `technical`   | Buckets the post under `> ls ~/technical/`. No effect on ordering.                                                                                                                                                   |
| `work`        | Buckets under `> ls ~/shipped/`.                                                                                                                                                                                     |
| `in_progress` | Buckets under `> ls ~/now/`. Combines with `work`; suppresses `technical`.                                                                                                                                           |
| `draft`       | Hides from the homepage — **but the page still builds and is reachable at its URL**. This is how you stage an unpublished post on a deploy.                                                                          |
| `pinned`      | **Inert.** Present in the Decap form and read by nothing. Leave it `false`.                                                                                                                                          |
| `tags`        | Space-separated string.                                                                                                                                                                                              |

**How the buckets are assigned.** `getAllPosts()` does not assign buckets;
`pages/index.tsx` does. `~/now` (`in_progress`) and `~/shipped` (`work`) are
independent, so a post that is released and still being worked on appears in
both. `~/technical` is the catch-all and stays exclusive: it takes a post only
when neither of the other two claimed it, which is what keeps nearly every
write-up from listing twice. Everything, including all of the above, is also
listed in `~/all`, which is the full archive and is paged.

**Ordering is date, newest first, in every section.** `getAllPosts()` sorts once by
`date` descending and each section filters that array, so `date` is the only thing
that decides position. Flags decide _which_ section a post appears in; they never
decide where it sits inside one.

Until 2026-08-11 the comparator had a `technical` term ahead of the date, and it ran
backwards — it sorted technical posts to the _bottom_ of any list they shared with
non-technical ones, regardless of date. It was removed rather than corrected, because
no section wants a secondary key once the buckets are exclusive.

### Tags

Space-separated, lowercase, no `#` (the template adds it). A tag with no entry in
`TAG_COLORS` (`pages/index.tsx`) silently renders grey — **add the tag there when
introducing one**, and give it the hue of its family (languages warm, AI violet,
frontend emerald/cyan, automation teal).

### Images

- Live in `public/imgs/`, referenced as `/imgs/name.png`
- Prefixed by project: `sol_*`, `wayne_mo_*`, `sol_hn_*`
- **Write both an alt and a caption.** The alt is the first argument, the
  caption is the title attribute. Alt describes the image for a reader who
  cannot see it (and for search); the caption is the note under it. When the
  caption already describes the image, reuse it as the alt.
- **The title attribute is the caption** — always write one:

```text
![](/imgs/sollewitt_11.png "Wall Drawing #11 — generated in the browser")
```

- Decap uploads land in `public/uploads/` instead. Both work; `imgs/` is for
  images committed by hand.

### MDX substitutions — the gotchas

`lib/remarkSubstitutions.ts` rewrites **prose text nodes** before rendering.
Code fences and inline code are untouched.

| You type    | You get           |
| ----------- | ----------------- |
| `->`        | →                 |
| `<-`        | ←                 |
| `<3`        | ♥                |
| `::cmd+k::` | a `<Kbd>` element |

So "drops from 5 to <3 seconds" renders as "5 to ♥ seconds". Check any prose
containing `<3` or a literal arrow you wanted to keep.

---

## 2. The shape of an article

Not a rigid template — a set of beats that show up in the same order.

```
Lede            1–3 sentences. What it is, plainly.
                Then the hook: the tension the piece resolves.
Links           "Live at: ..." / HN / repo. Bare, on their own lines.
Cover image     Optional, with a caption.
---
The idea        Where it came from. Often the original brief, quoted.
The build       2–5 sections, one per real phase. Dated if the timeline matters.
The wall        What did not work. Non-negotiable — every good post has one.
The fix         What you did about it.
Where it is now Current state, honestly scoped.
What I learned  3–5 bold-lead paragraphs.
What's next     Bulleted, short, includes the unfinished parts.
Sign-off        "Thanks for reading. More soon."
```

Section headings are `##`. Plain-language beats, never `Introduction` /
`Conclusion` / `Overview`. Good ones from the corpus:

> `## The part that did not work` · `## The Diagonal Problem` ·
> `## The thing that bites everyone: secrets and env vars` ·
> `## Moving the box (July 14)` · `## Rung 0: the simplest possible web app`

Use `---` between major sections when the piece is a reference (`sollewitt`,
`standard-stack`). Use it sparingly — after the lede only — when the piece is a
narrative (`slashwork`).

### The lede

No throat-clearing. No "In this post I'll walk through". State the thing, then
turn:

> slashwork is a subagent offload network for Claude Code. [...]
>
> **That is not what I set out to build.** For five weeks it was a competition
> arena. Then, in a single afternoon, I deleted the arena and rebuilt the pieces
> into this. Here is how that happened.

> Instruction-driven generative wall drawings in the browser. A tribute to Sol
> LeWitt, built with Next.js and Canvas 2D.

---

## 3. Voice

**First person, past tense for the build, present for the current state.** "I
flipped the framing." "It is live at slashwork.sh."

**Plain declaratives. Short sentences.** The rhythm is flat on purpose, so the
occasional one-line paragraph lands:

> Nobody competes. Everybody trades.

> The arena ran. The arena did not fill.

**No hype adjectives.** Nothing in the corpus is amazing, incredible, powerful,
seamless, robust, or a game-changer. Claims are made with numbers instead.

**Admit failure flatly, without self-deprecation.** State what broke, then what
it cost:

> First pass at diagonal lines was wrong. I was parameterizing start and end
> points on opposing edges and interpolating — which produces fan lines that
> converge, not parallel hatching.

**Diagnose, do not just narrate.** The best paragraphs name the underlying
mistake:

> When you are debating whether to split your arena into two arenas, and tuning
> the sort links on a leaderboard nobody is reading, the leaderboard is not the
> problem. The problem is that nobody wants to compete.

**Second person is allowed when teaching**, not when recounting. "You bring your
tuned Claude Code setup." "You'll want the brain from part one set up first."

**Bold carries the load, italics almost never.** Bold the claim, not the noun:

> Entitlement is **derived, never stored as a flag a client could flip**.

**Contractions are inconsistent across the corpus and that is fine.** `slashwork`
avoids them ("It is live at"); `standard-stack` uses them ("isn't just a clever
prompt"). Pick one per article and hold it.

**American spellings.** `center`, `organized`, `visualization`, `behavior`, `color`.
Parts of the older corpus drift British (`behaviours`, `organised`, `colours`); like
the em dashes, that is a habit of the archive rather than a standard to continue. New
writing is American throughout, and a piece is never half and half.

**No em dashes.** The older articles are full of them; new writing does not use
them. A colon, a comma pair, or two sentences carries the same break, and the
result reads less like a machine wrote it. This applies to prose, headings,
captions and bullets. Quoted code is excerpted rather than rewritten, so trim an
excerpt past the dash instead of editing someone's comment.

---

## 4. Devices

### Tables — for choices and mappings

Two or three columns. A `Concern | Choice | Why` table beats three paragraphs.

```markdown
| Piece       | Choice                                                                 |
| ----------- | ---------------------------------------------------------------------- |
| Coordinator | Rust, axum + sqlx, one process serving htmx pages, a JSON API, and SSE |
| Database    | Postgres (Neon first, then Fly Postgres)                               |
```

The before/after table is the signature move for a pivot or refactor:

```markdown
| Arena machinery                           | Became                                   |
| ----------------------------------------- | ---------------------------------------- |
| Credits ledger (pay to enter a challenge) | The exchange: routing a task charges you |
```

### ASCII diagrams — in bare code fences, no language tag

For pipelines, data flow, and ladders. `→ ↓ ──▶ │ └─` are all in use.

```
Claude Code spawns a subagent      (PreToolUse hook on Task)
        ↓
   routable?  ── no ──→  local spawn, exactly as before
        ↓ yes
   POST /api/tasks  ── no claim in 3–5s ──→  local spawn
```

Annotate branches inline. Put the failure path on the right.

### Code — short, real, and named

Excerpts from the actual repo with the actual identifiers. Ten to twenty lines.
Tag the language (` ```ts `, ` ```bash `). Keep the comment that explains the
maths if there is one. Follow the block with prose that reads it back:

> Each line satisfies `ly = lx + k` in cell-local coordinates. `k` sweeps from
> `-w` to `h`, evenly spaced.

### Numbers, always with their budget

Never a bare number. Give it the thing it is measured against:

> At 300 nodes a tick costs **~0.2ms** on an M-series Mac against a 6ms budget.

> 257 commits in June. · Twelve PRs, plan to arena-removed, in one day.

### Commit hashes and dates as anchors

Short hash in backticks, in parentheses, after the claim. Dates in section
headings when the timeline is the story.

> The pivot plan landed as `d331fec` on July 8. · On July 14 [...] (`2ec57f0`),
> then `retire fly.toml` (`82b3ba6`).

### What I learned

Bold lead sentence stating the lesson as a general claim, then one to three
sentences grounding it in what happened. Three to five of them.

> **A general engine survives a pivot.** The arena and the exchange are the same
> coordinator, the same credits, the same judge, the same SSE. Because none of it
> was welded to the word "competition," flipping the product was mostly renaming.

> **Refs over state for animation.** React state triggers re-renders. Mutable
> refs don't. For anything running at 60fps, refs are the only sane option.

The lesson must be transferable. "I should have tested earlier" is not a lesson;
"a boundary maintained by good intentions is a boundary that is gone in six
months" is.

---

## 5. Before publishing

- [ ] Frontmatter complete, `date` carries the right UTC offset
- [ ] `description` written: 150–160 characters, one sentence, reads like the lede
- [ ] Every tag has a `TAG_COLORS` entry in `pages/index.tsx`
- [ ] Every image has **alt text** and a caption in its title attribute
- [ ] Body starts at `##` — the `#` is the frontmatter title, rendered for you
- [ ] No `<3` or stray `->` in prose that you meant literally
- [ ] There is a section about what did not work
- [ ] Every number has the budget it is measured against
- [ ] Lessons are transferable claims, not diary entries
- [ ] No hype adjectives
- [ ] `npx prettier --write content/posts/<slug>.mdx` — format **only your post**.
      Do not run `npm run format`: the repo has never been fully Prettier-clean, so
      it rewrites 60+ unrelated files including built assets under `public/`.
- [ ] `npm run build` passes
- [ ] Staged with `draft: true` and read **on a phone** before publishing
