# Belote Scorekeeper

Mobile-first score tracker for belote. Tracks rounds, scores, capots, belote/rebelote, and running totals with a chart view.

**Stack:** Vue 3 · Pinia · Chart.js · Vite — no backend, scores stored in `localStorage`.

---

## Local development

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

```bash
npm run build    # production build → dist/
npm run preview  # serve the dist/ build locally
```

---

## Deploy to Vercel

### First deploy

1. Push the repo to GitHub (or GitLab / Bitbucket).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Vercel auto-detects Vite. Settings are already in `vercel.json`:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**. Done — Vercel assigns a `*.vercel.app` URL.

### Subsequent deploys

Every push to the default branch triggers an automatic redeploy.

To deploy manually from the CLI:

```bash
npm install -g vercel   # one-time
vercel                  # preview deploy
vercel --prod           # production deploy
```

### Custom domain

In the Vercel dashboard: **Project → Settings → Domains** → add your domain and follow the DNS instructions.

---

## Project structure

```
src/
  components/
    NewGame.vue       # game setup (player names)
    NewRound.vue      # round entry modal
    ScoreBoard.vue    # live scores + stats
    GameHistory.vue   # round-by-round history
    GameCharts.vue    # cumulative score chart
  stores/
    useGameStore.js   # Pinia store, persists to localStorage
  App.vue
  main.js
  style.css
```
