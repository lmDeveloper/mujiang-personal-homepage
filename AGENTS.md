# AGENTS.md

## Project Background

This is the personal homepage project for `木匠`.

Positioning:
- Chinese name or nickname: `木匠`
- Identity: software developer, big data expert, and AI research practitioner
- Core message: embrace AI, use AI to reshape business workflows, and improve productivity and work efficiency
- Keywords: `Vue`, `AI`, `网页资讯`
- Language style: bilingual Chinese and English for personal introduction and navigation

The site is a static Vue + Vite developer card. It includes:
- Hero section with a technology-focused visual image
- Bilingual identity and introduction
- AI news section grouped by date
- About section describing AI workflow, productivity, and data experience

The project intentionally does not use a backend service or database. AI news is generated into static JSON and read by the frontend.

## Important Paths

Project root:

```text
/Users/limin/Downloads/codex/工作处理/personal-homepage
```

Main source files:

```text
src/App.vue                  Main page component and content structure
src/style.css                Global styling, responsive layout, animations
src/main.ts                  Vue app entry
src/types.ts                 Shared TypeScript types
src/vite-env.d.ts            Vite type declarations
src/assets/mujiang-avatar.png
                              Generated technology visual image
```

AI news:

```text
public/data/ai-news.json     Static news data read by the frontend
scripts/update-ai-news.mjs   RSS/news aggregation script
```

Build and tooling:

```text
package.json                 Scripts and dependencies
pnpm-lock.yaml               Locked pnpm dependencies
vite.config.ts               Vite config, including GitHub Pages base path logic
tsconfig.json                TypeScript config
start.sh                     Shell-friendly helper for dev/build/preview
dev-local.sh                 Convenience wrapper for local dev
```

Deployment:

```text
.github/workflows/deploy.yml GitHub Actions workflow for news refresh and Pages deploy
netlify.toml                 Netlify build config
.gitignore                   Ignored local/build files
.gitattributes               Git text normalization
README.md                    User-facing project docs
AGENTS.md                    Project-level instructions for future agents
```

Generated or ignored local directories:

```text
dist/                        Vite build output, ignored by Git
node_modules/                Local dependencies, ignored by Git
.netlify/                    Netlify local state, ignored by Git
.DS_Store                    macOS metadata, ignored by Git
```

## Commands

Preferred package manager:

```bash
pnpm
```

Install dependencies:

```bash
pnpm install
```

Start local dev server:

```bash
pnpm dev
```

If `pnpm` is not available in the shell, use the project helper:

```bash
./start.sh dev
```

Build:

```bash
pnpm build
```

Shell-friendly build:

```bash
./start.sh build
```

Preview built site:

```bash
pnpm preview
```

Shell-friendly preview:

```bash
./start.sh preview
```

Refresh AI news locally:

```bash
pnpm update:news
```

## Development Rules

- Keep the project static. Do not add a backend, database, or browser-side API key unless explicitly requested.
- The frontend must read AI news from `public/data/ai-news.json`.
- Do not fetch live news directly from the browser.
- Keep the `AiNewsItem` shape stable:

```ts
type AiNewsItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  date: string;
  language: "zh" | "en";
  tags: string[];
};
```

- Preserve bilingual Chinese and English personal introduction content.
- News titles may remain in their source language.
- The hero visual should stay technology/data/AI oriented and should not be portrait-centered.
- Keep mobile layout readable. Long news titles and buttons must wrap cleanly.
- Avoid committing generated files or local state:
  - `dist/`
  - `node_modules/`
  - `.netlify/`
  - `.DS_Store`
- Use scoped edits. Do not refactor unrelated files during small content or deployment updates.
- Before finalizing code changes, run:

```bash
./start.sh build
```

## GitHub Repository

Repository:

```text
https://github.com/lmDeveloper/mujiang-personal-homepage
```

Remote:

```text
origin https://github.com/lmDeveloper/mujiang-personal-homepage.git
```

Default branch:

```text
main
```

GitHub Pages URL:

```text
https://lmdeveloper.github.io/mujiang-personal-homepage/
```

GitHub Pages deployment mode:

```text
GitHub Actions
```

Workflow:

```text
.github/workflows/deploy.yml
```

Workflow triggers:
- Manual: `workflow_dispatch`
- Scheduled: daily at `00:12 UTC`, around `08:12` Beijing time
- Push to `main`

Workflow behavior:
1. Check out repository.
2. Install Node `22` and pnpm `10.12.1`.
3. Run `pnpm install --frozen-lockfile`.
4. Run `pnpm update:news`.
5. Commit changed `public/data/ai-news.json` automatically.
6. Run `pnpm build`.
7. Upload `dist` as a GitHub Pages artifact.
8. Deploy with `actions/deploy-pages`.

Important note:
- GitHub Pages does not refresh AI news on every page visit.
- News updates only when the GitHub Actions workflow runs and redeploys the static JSON.

Useful GitHub commands:

```bash
gh auth status
gh repo view lmDeveloper/mujiang-personal-homepage
gh workflow run "Deploy personal homepage" --repo lmDeveloper/mujiang-personal-homepage --ref main
gh run list --repo lmDeveloper/mujiang-personal-homepage --limit 5
```

## Netlify Deployment

Netlify production URL:

```text
https://mujiang-personal-homepage.netlify.app
```

Netlify project:

```text
https://app.netlify.com/projects/mujiang-personal-homepage
```

Netlify site ID:

```text
a45df862-eda7-46a9-b5d5-68a2a6e05f1b
```

Netlify config:

```text
netlify.toml
```

Netlify build settings:

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
  PNPM_VERSION = "10.12.1"
```

Deployment notes:
- The current Netlify site was deployed by direct upload through the Netlify integration.
- The GitHub repository exists now, but Netlify may not be connected to GitHub as a continuous deployment source unless configured in the Netlify dashboard.
- If connecting Netlify to GitHub later, use the same build command and publish directory from `netlify.toml`.

## Vite Base Path Rule

`vite.config.ts` computes the base path from `GITHUB_REPOSITORY`:

```ts
base: process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split("/")[1]}/`
  : "/",
```

This means:
- Local development uses `/`.
- Netlify uses `/`.
- GitHub Pages uses `/mujiang-personal-homepage/`.

Do not hardcode the GitHub Pages base path elsewhere unless this deployment strategy changes.

## Current Public URLs

GitHub Pages:

```text
https://lmdeveloper.github.io/mujiang-personal-homepage/
```

Netlify:

```text
https://mujiang-personal-homepage.netlify.app
```

