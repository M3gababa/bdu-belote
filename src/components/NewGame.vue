<template>
  <div class="welcome">
    <div class="welcome-top">
      <div class="logo">
        <span class="logo-suit red">♥</span>
        <span class="logo-suit">♠</span>
        <span class="logo-suit red">♦</span>
        <span class="logo-suit">♣</span>
      </div>
      <h1 class="title">Belote</h1>
      <p class="subtitle">Compteur de points</p>
    </div>

    <div class="form-card">
      <div v-if="store.lastPlayers" class="reuse-banner">
        <span>Même joueurs qu'avant ?</span>
        <button class="reuse-btn" @click="reuseLastPlayers">Reprendre</button>
      </div>

      <div class="teams-grid">
        <div class="team-column">
          <div class="team-header red">
            <span class="team-suit">♥ ♦</span>
            <span>Équipe 1</span>
          </div>
          <div class="player-inputs">
            <div class="input-wrapper" v-for="(_, i) in 2" :key="i">
              <span class="input-icon">👤</span>
              <input
                v-model="team1[i]"
                :placeholder="`Joueur ${i + 1}`"
                type="text"
                class="player-input"
                autocomplete="off"
                autocorrect="off"
                spellcheck="false"
                maxlength="20"
              />
            </div>
          </div>
        </div>

        <div class="team-divider">
          <div class="divider-line"></div>
          <span class="divider-vs">VS</span>
          <div class="divider-line"></div>
        </div>

        <div class="team-column">
          <div class="team-header white">
            <span class="team-suit">♠ ♣</span>
            <span>Équipe 2</span>
          </div>
          <div class="player-inputs">
            <div class="input-wrapper" v-for="(_, i) in 2" :key="i">
              <span class="input-icon">👤</span>
              <input
                v-model="team2[i]"
                :placeholder="`Joueur ${i + 3}`"
                type="text"
                class="player-input"
                autocomplete="off"
                autocorrect="off"
                spellcheck="false"
                maxlength="20"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        class="start-btn"
        :disabled="!canStart"
        @click="startGame"
      >
        Commencer la partie
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/useGameStore'

const store = useGameStore()

const team1 = ref(['', ''])
const team2 = ref(['', ''])

const canStart = computed(() =>
  team1.value.every(n => n.trim()) && team2.value.every(n => n.trim())
)

function reuseLastPlayers() {
  team1.value = [...store.lastPlayers.team1]
  team2.value = [...store.lastPlayers.team2]
}

function startGame() {
  if (!canStart.value) return
  store.startGame({
    team1: team1.value.map(n => n.trim()),
    team2: team2.value.map(n => n.trim()),
  })
}
</script>

<style scoped>
.welcome {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: calc(var(--safe-top) + 20px) 20px calc(var(--safe-bottom) + 20px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  gap: 24px;
}

.welcome-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 16px;
}

.logo {
  display: flex;
  gap: 8px;
  font-size: 32px;
  line-height: 1;
  margin-bottom: 4px;
}

.logo-suit {
  color: var(--text-3);
  transition: color 0.2s;
}

.logo-suit.red {
  color: var(--red);
}

.title {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text);
}

.subtitle {
  font-size: 13px;
  color: var(--text-3);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.form-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reuse-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--gold-dim);
  border: 1px solid rgba(201, 168, 76, 0.3);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 13px;
  color: var(--gold);
}

.reuse-btn {
  background: var(--gold);
  color: #000;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
  letter-spacing: 0.02em;
}

.teams-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.team-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.team-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding-bottom: 6px;
}

.team-header.red { color: var(--red); }
.team-header.white { color: var(--text-2); }

.team-suit {
  font-size: 14px;
  letter-spacing: 2px;
}

.player-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0 10px;
  transition: border-color 0.15s;
}

.input-wrapper:focus-within {
  border-color: var(--text-3);
}

.input-icon {
  font-size: 13px;
  opacity: 0.4;
  flex-shrink: 0;
}

.player-input {
  flex: 1;
  background: none;
  border: none;
  color: var(--text);
  padding: 11px 0;
  font-size: 14px;
  min-width: 0;
}

.player-input::placeholder {
  color: var(--text-3);
}

.team-divider {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 16px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.divider-vs {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-3);
  letter-spacing: 0.1em;
  flex-shrink: 0;
}

.start-btn {
  background: var(--red);
  color: white;
  font-size: 15px;
  font-weight: 600;
  padding: 14px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.02em;
  transition: opacity 0.15s, transform 0.1s;
  width: 100%;
}

.start-btn:disabled {
  opacity: 0.35;
}

.start-btn:not(:disabled):active {
  transform: scale(0.98);
  opacity: 0.9;
}
</style>
