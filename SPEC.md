# Spécification — Belote Scorekeeper

## Vue d'ensemble

Application web mobile-first de comptage de points pour la belote à quatre joueurs (2 vs 2). Pas de backend : toutes les données sont stockées dans `localStorage` (clé `belote_v2`).

---

## Concepts métier

### Session
Une session commence quand on saisit les noms des quatre joueurs et se termine quand on clique "Terminer la session". Les équipes et l'historique sont liés à la session.

### Partie
Une partie est un jeu complet. Elle se termine dès qu'une équipe atteint ou dépasse **1000 points**. Si les deux équipes dépassent 1000 au même tour, la plus haute l'emporte. Une session contient une ou plusieurs parties avec les mêmes joueurs.

### Manche
Une manche est un tour de jeu. Elle enregistre le donneur, le preneur, l'atout, les scores et les éventuelles belote/rebelote.

### Capot
Score de 252 pts pour une équipe (l'autre marque 0). Le score de 272 correspond à un capot avec belote/rebelote (+20 pts).

---

## Flux utilisateur

```
Démarrage
  └─ Saisie des 4 joueurs (2 par équipe)
       └─ Partie en cours
            ├─ Saisie de manche (modal)
            ├─ Consultation scores / historique / stats / parties
            ├─ Score ≥ 1000 → WinModal
            │    ├─ "Nouvelle partie" → reset scores, même joueurs
            │    └─ "Terminer la session" → retour à l'écran de démarrage
            └─ "Terminer la session" (bouton Scores) → retour démarrage
```

---

## Saisie d'une manche

Champs obligatoires pour valider :
- **Donneur** — chip parmi les 4 joueurs
- **Preneur** — chip parmi les 4 joueurs
- **Atout** — ♥ ♦ ♣ ♠ SA (Sans Atout) TA (Tout Atout)

Champs optionnels :
- **Score cartes** — sélectionner l'équipe (1 ou 2) et saisir son score manuellement
  - Plage valide : 0–252 (252 = capot, l'autre équipe marque 0 ; entre 0 et 162 l'autre équipe marque 162 − score)
  - La preview affiche les deux scores en temps réel
- **Belote / Rebelote** — +20 pts par équipe concernée

Le score final affiché en bas est : score cartes + belote éventuelle.

---

## Navigation (onglets)

| Icône | Onglet | Contenu |
|-------|--------|---------|
| ♠ | Scores | Scores en direct, barre de progression, dernière manche, récapitulatif (manches, victoires, capots) |
| ♥ | Manches | Historique détaillé des manches de la partie en cours avec cumuls |
| ♦ | Stats | Graphiques avec toggle Partie en cours / Toutes les parties |
| ★ | Parties | Liste des parties de la session, import/export CSV |

---

## Scores et couleurs

- L'équipe qui **mène** (score cumulé le plus élevé) est affichée en **rouge** dans le header et le scoreboard.
- L'équipe qui **gagne une manche** est affichée en **rouge** dans l'historique.
- En cas d'égalité, les deux équipes s'affichent en couleur neutre (noir).
- Le compteur de **parties gagnées** est affiché de part et d'autre du "VS" dans le header ; l'équipe en tête est en rouge.

---

## Statistiques

Trois graphiques, chacun recalculé selon le scope actif :

| Graphique | Type | Description |
|-----------|------|-------------|
| Progression des scores | Lignes (sans remplissage) | Courbes cumulatives — Éq. 1 en rouge, Éq. 2 en gris foncé |
| Preneurs | Barres grises | Nombre de prises par joueur |
| Atouts | Donut | Répartition des atouts joués |

**Toggle scope :** "Partie en cours" (par défaut) / "Toutes les parties"

---

## Onglet Parties

### Liste des parties
- Partie en cours en haut (badge "En cours")
- Parties terminées dessous, de la plus récente à la plus ancienne
- Par partie : numéro, vainqueur, score final, nombre de manches, date
- Bouton expand ▾ pour voir le détail des manches (tableau : #, atout, preneur, score Éq. 1, score Éq. 2)
- Bouton ↓ pour exporter la partie en CSV

### Import / Export CSV

**Export global** — toutes les parties de la session, format :
```
Partie,Donneur,Preneur,Atout,Score 1,Score 2,Belote 1,Belote 2
```

**Export par partie** — format :
```
Donneur,Preneur,Atout,Score 1,Score 2,Belote 1,Belote 2
```

**Import** — le fichier CSV est importé dans la **partie en cours**. Les deux formats sont acceptés (avec ou sans colonne Partie). Les atouts peuvent être écrits en toutes lettres ou avec le symbole.

**Correspondance atouts :**

| Symbole | Texte CSV |
|---------|-----------|
| ♥ | Coeur |
| ♦ | Carreau |
| ♣ | Trefle |
| ♠ | Pique |
| SA | Sans Atout |
| TA | Tout Atout |

**Noms de fichiers :**
- Export global : `YYYYMMDD-belote.csv`
- Export par partie : `YYYYMMDD-belote-partie-N.csv`

---

## Persistance des données

Clé localStorage : `belote_v2`

```json
{
  "current": {
    "id": 1234567890,
    "startedAt": "2026-06-28T10:00:00.000Z",
    "players": { "team1": ["Alice", "Bob"], "team2": ["Carol", "Dave"] },
    "rounds": [
      {
        "id": 1234567891,
        "dealer": "Alice",
        "taker": "Bob",
        "trump": "♥",
        "capotTeam": null,
        "belote": { "team1": false, "team2": false },
        "finalScores": { "team1": 92, "team2": 70 }
      }
    ]
  },
  "completedGames": [
    {
      "id": 1234567800,
      "players": { "team1": ["Alice", "Bob"], "team2": ["Carol", "Dave"] },
      "rounds": [ ... ],
      "winner": 1,
      "startedAt": "...",
      "completedAt": "...",
      "finalScores": { "team1": 1082, "team2": 754 }
    }
  ],
  "last": { "team1": ["Alice", "Bob"], "team2": ["Carol", "Dave"] }
}
```

`last` est utilisé pour proposer de reprendre les mêmes joueurs lors du prochain démarrage.

---

## Structure des fichiers

```
src/
  components/
    NewGame.vue       # écran de démarrage
    NewRound.vue      # modal de saisie d'une manche
    ScoreBoard.vue    # scores en direct + récapitulatif stats
    GameHistory.vue   # historique manches (partie en cours)
    GameCharts.vue    # graphiques Chart.js
    GamesList.vue     # onglet Parties (historique, CSV)
    WinModal.vue      # modal victoire (≥ 1000 pts)
  stores/
    useGameStore.js   # état global, logique métier, persistance
  App.vue             # layout, header, navigation, modals
  main.js
  style.css           # variables CSS (thème clair), reset
```

---

## Contraintes techniques

- **Pas de router** : navigation par onglets gérée avec un `ref` dans App.vue.
- **Pas de backend** : toutes les données vivent dans `localStorage`.
- **Mobile-first** : max-width 800px centré sur desktop, `dvh` pour la hauteur.
- **Thème** : fond blanc cassé (`#f5f4f0`), texte noir (`#111`), accent rouge (`#d9313d`), or (`#9a6f00`).
- **Atouts ♣ ♠** : affichés en noir (`var(--text)`) dans la saisie.
