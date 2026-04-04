# Lily’s Beauty Lounge

Next.js site with online booking (Clover payments), admin tools, and optional Upstash Redis for serverless persistence.

## Local development

```bash
npm install
cp .env.example .env.local
# Fill .env.local, then:
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Admin console: `/admin`.

## Deploy on Vercel

1. Push this repo to GitHub (see below).
2. In [Vercel](https://vercel.com/new), **Import** the repository. Framework: **Next.js** (auto-detected).
3. Add a **Redis** store (e.g. Upstash from Vercel Marketplace) and set:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Copy variables from [`.env.example`](./.env.example) into **Project → Settings → Environment Variables** (Production and Preview as needed). Never commit real secrets.

Required for payments: `CLOVER_ENV`, `CLOVER_ACCESS_TOKEN`, `CLOVER_PAKMS_KEY`. For expiring OAuth tokens: `CLOVER_APP_ID`, `CLOVER_REFRESH_TOKEN`, and Redis so refreshed tokens persist. Exchange a one-time OAuth code locally with `npm run clover:oauth -- <CODE>` (needs `CLOVER_APP_SECRET` in `.env.local`).

## Push to GitHub (first time)

```bash
cd lilys-beauty-lounge
git init
git add .
git commit -m "Initial commit"
```

Create an empty repository on GitHub (no README/license), then:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_USER/YOUR_REPO` with your GitHub username and repository name.

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run clover:oauth -- <code>` | Exchange Clover OAuth code for tokens (local) |
