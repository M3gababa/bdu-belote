<template>
  <div class="app">
    <NewGame v-if="!store.hasGame" />

    <template v-else>
      <header class="header">
        <div class="header-scores">
          <div class="header-team" :class="{ leading: store.team1Total > store.team2Total }">
            <div class="team-label" :class="{ 'c-red': store.team1Total > store.team2Total }">{{ store.game.players.team1.join(' / ') }}</div>
            <div class="team-score-big" :class="{ 'c-red': store.team1Total > store.team2Total }">{{ store.team1Total }}</div>
          </div>
          <div class="header-center">
            <div class="header-wins-row">
              <span class="win-count" :class="{ 'c-red': store.team1GameWins > store.team2GameWins }">{{ store.team1GameWins }}</span>
              <span class="header-vs">VS</span>
              <span class="win-count" :class="{ 'c-red': store.team2GameWins > store.team1GameWins }">{{ store.team2GameWins }}</span>
            </div>
            <div class="header-rounds">Partie {{ store.currentPartyNumber }} · {{ store.game.rounds.length }} manches</div>
          </div>
          <div class="header-team" :class="{ leading: store.team2Total > store.team1Total }">
            <div class="team-label" :class="{ 'c-red': store.team2Total > store.team1Total }">{{ store.game.players.team2.join(' / ') }}</div>
            <div class="team-score-big" :class="{ 'c-red': store.team2Total > store.team1Total }">{{ store.team2Total }}</div>
          </div>
        </div>
      </header>

      <main class="content">
        <ScoreBoard v-if="activeTab === 'scores'" />
        <GameHistory v-else-if="activeTab === 'history'" />
        <GameCharts v-else-if="activeTab === 'charts'" />
        <GamesList v-else-if="activeTab === 'parties'" />
      </main>

      <nav class="bottom-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          <span class="nav-label">{{ tab.label }}</span>
        </button>
      </nav>

      <button v-if="!store.currentGameWinner" class="fab" @click="showNewRound = true" aria-label="Nouvelle manche">
        <span>+</span>
      </button>
    </template>

    <Teleport to="body">
      <NewRound v-if="showNewRound" @close="showNewRound = false" />
      <WinModal v-if="store.currentGameWinner !== null" :winner="store.currentGameWinner" />
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGameStore } from './stores/useGameStore'
import NewGame from './components/NewGame.vue'
import NewRound from './components/NewRound.vue'
import ScoreBoard from './components/ScoreBoard.vue'
import GameHistory from './components/GameHistory.vue'
import GameCharts from './components/GameCharts.vue'
import GamesList from './components/GamesList.vue'
import WinModal from './components/WinModal.vue'

const store = useGameStore()
const activeTab = ref('scores')
const showNewRound = ref(false)

const tabs = [
  { id: 'scores', icon: '♠', label: 'Scores' },
  { id: 'history', icon: '♥', label: 'Manches' },
  { id: 'charts', icon: '♦', label: 'Stats' },
  { id: 'parties', icon: '★', label: 'Parties' },
]
</script>

<style scoped>
.app {
  height: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  overflow: hidden;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 0 0 1px var(--border);
}

/* Header */
.header {
  flex-shrink: 0;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: calc(var(--safe-top) + 12px) 16px 12px;
}

.header-scores {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-team {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: opacity 0.2s;
}

.header-team:not(.leading) {
  opacity: 0.65;
}

.header-team:nth-child(3) {
  align-items: flex-end;
  text-align: right;
}

.team-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.team-label { color: var(--text-2); }
.team-label.c-red { color: var(--red); }

.team-score-big {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--text);
}

.team-score-big.c-red { color: var(--red); }

.header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.header-wins-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.win-count {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-3);
  min-width: 18px;
  text-align: center;
}

.win-count.c-red { color: var(--red); }

.header-vs {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-3);
  letter-spacing: 0.1em;
}

.header-rounds {
  font-size: 10px;
  color: var(--text-3);
  white-space: nowrap;
}

/* Content */
.content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

/* Bottom nav */
.bottom-nav {
  flex-shrink: 0;
  display: flex;
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding-bottom: var(--safe-bottom);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 0 8px;
  color: var(--text-3);
  transition: color 0.15s;
  min-height: 52px;
}

.nav-item.active {
  color: var(--red);
}

.nav-icon {
  font-size: 18px;
  line-height: 1;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* FAB */
.fab {
  position: fixed;
  right: 20px;
  bottom: calc(var(--safe-bottom) + 72px);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--red);
  color: white;
  font-size: 26px;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(230, 57, 70, 0.4);
  transition: transform 0.15s, box-shadow 0.15s;
  z-index: 10;
  line-height: 1;
}

.fab:active {
  transform: scale(0.94);
  box-shadow: 0 2px 8px rgba(230, 57, 70, 0.3);
}
</style>
