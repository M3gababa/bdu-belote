# Belote Scorekeeper

Compteur de points pour la belote, pensé pour mobile. Gère les manches, les parties (première équipe à 1000 pts), l'historique, les statistiques et l'import/export CSV.

**Stack:** Vue 3 · Pinia · Chart.js · Vite — pas de backend, données stockées dans `localStorage`.

---

## Local development

```bash
npm install
npm run dev
```

App disponible sur `http://localhost:5173`.

```bash
npm run build    # build de production → dist/
npm run preview  # servir le build dist/ en local
```

---

## Deploy to Vercel

### Premier déploiement

1. Pusher le repo sur GitHub (ou GitLab / Bitbucket).
2. Aller sur [vercel.com](https://vercel.com) → **Add New Project** → importer le repo.
3. Vercel détecte Vite automatiquement. La config est dans `vercel.json` :
   - Build command : `npm run build`
   - Output directory : `dist`
4. Cliquer **Deploy**. Vercel attribue une URL `*.vercel.app`.

### Déploiements suivants

Chaque push sur la branche par défaut déclenche un redéploiement automatique.

Déploiement manuel via CLI :

```bash
npm install -g vercel   # une seule fois
vercel                  # preview deploy
vercel --prod           # production deploy
```

### Domaine personnalisé

Dans le dashboard Vercel : **Project → Settings → Domains** → ajouter le domaine et suivre les instructions DNS.

---

## Project structure

```
src/
  components/
    NewGame.vue       # écran de démarrage (saisie des joueurs)
    NewRound.vue      # modal de saisie d'une manche
    ScoreBoard.vue    # scores en direct + récapitulatif
    GameHistory.vue   # historique des manches de la partie en cours
    GameCharts.vue    # graphiques (progression, preneurs, atouts)
    GamesList.vue     # onglet Parties : historique, import/export CSV
    WinModal.vue      # modal de fin de partie (victoire à 1000 pts)
  stores/
    useGameStore.js   # store Pinia, persistance localStorage (clé belote_v2)
  App.vue
  main.js
  style.css
```

---

## CSV format

Les exports utilisent le séparateur virgule. Les atouts sont écrits en toutes lettres.

### Export par partie
```
Donneur,Preneur,Atout,Score 1,Score 2,Belote 1,Belote 2
Alice,Bob,Coeur,92,70,0,0
```

### Export global (toutes les parties)
```
Partie,Donneur,Preneur,Atout,Score 1,Score 2,Belote 1,Belote 2
1,Alice,Bob,Coeur,92,70,0,0
```

**Valeurs d'atout :** `Coeur` · `Carreau` · `Trefle` · `Pique` · `Sans Atout` · `Tout Atout`

**Noms de fichiers :** `YYYYMMDD-belote.csv` (global) · `YYYYMMDD-belote-partie-N.csv` (par partie)
