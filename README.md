# 木匠 Developer Card

An independent Vue + Vite personal homepage for 木匠: software developer, big
data expert, and AI research practitioner. The main visual is an AI data
workshop image rather than a portrait-centered avatar.

## Local Development

```bash
pnpm install
pnpm dev
```

If `pnpm` is not available in this Codex desktop environment, run:

```bash
./start.sh dev
```

Then open `http://127.0.0.1:5173/`.

Other shell-friendly commands:

```bash
./start.sh preview
./start.sh build
```

## Build

```bash
pnpm build
```

## GitHub Setup

This repository is ready for GitHub Pages.

1. Create a GitHub repository, for example `mujiang-personal-homepage`.
2. Push this project to the repository's `main` branch.
3. In GitHub, open `Settings -> Pages`.
4. Set `Build and deployment` to `GitHub Actions`.
5. Run the `Deploy personal homepage` workflow manually, or push to `main`.

The Vite base path is computed from `GITHUB_REPOSITORY`, so the same build works
for both Netlify (`/`) and GitHub Pages (`/<repo-name>/`).

## AI News

The homepage reads static data from `public/data/ai-news.json`. Refresh it
locally with:

```bash
pnpm update:news
```

On GitHub Pages, `.github/workflows/deploy.yml` runs daily, refreshes public RSS
items, builds the site, and deploys the `dist` artifact.

## Personal Links

Personal links are intentionally hidden until real URLs are added in
`src/App.vue`.
