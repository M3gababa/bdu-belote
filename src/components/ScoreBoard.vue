<template>
  <div class="scoreboard">
    <!-- Score cards -->
    <div class="teams-row">
      <div :class="['team-card', { leading: store.team1Total > store.team2Total }]">
        <div class="team-players">
          <span v-for="p in store.game.players.team1" :key="p" class="player-pill">{{ p }}</span>
        </div>
        <div :class="['big-score', { 'c-red': store.team1Total > store.team2Total }]">{{ store.team1Total }}</div>
        <div v-if="store.team1Total > store.team2Total" class="lead-badge">Mène</div>
      </div>
      <div :class="['team-card', { leading: store.team2Total > store.team1Total }]">
        <div class="team-players">
          <span v-for="p in store.game.players.team2" :key="p" class="player-pill">{{ p }}</span>
        </div>
        <div :class="['big-score', { 'c-red': store.team2Total > store.team1Total }]">{{ store.team2Total }}</div>
        <div v-if="store.team2Total > store.team1Total" class="lead-badge">Mène</div>
      </div>
    </div>

    <!-- Progress bar -->
    <div v-if="total > 0" class="progress-wrap">
      <div class="progress-bar">
        <div class="progress-t1" :style="{ width: team1Pct + '%' }"></div>
      </div>
      <div class="progress-labels">
        <span class="red">{{ team1Pct }}%</span>
        <span class="text-muted">{{ total }} pts joués</span>
        <span>{{ team2Pct }}%</span>
      </div>
    </div>

    <!-- Last round -->
    <div v-if="lastRound" class="last-round-section">
      <div class="section-title">Dernière manche</div>
      <div class="last-round-card">
        <div class="lr-meta">
          <span class="lr-suit">{{ lastRound.trump }}</span>
          <span class="lr-info">{{ lastRound.taker }} prend · Dist. {{ lastRound.dealer }}</span>
        </div>
        <div class="lr-scores">
          <div class="lr-score" :class="{ winner: lastRound.finalScores.team1 > lastRound.finalScores.team2 }">
            <span class="lr-name">{{ store.team1Name }}</span>
            <span class="lr-pts">{{ lastRound.finalScores.team1 }}</span>
          </div>
          <div class="lr-sep">—</div>
          <div class="lr-score" :class="{ winner: lastRound.finalScores.team2 > lastRound.finalScores.team1 }">
            <span class="lr-name">{{ store.team2Name }}</span>
            <span class="lr-pts">{{ lastRound.finalScores.team2 }}</span>
          </div>
        </div>
        <div v-if="lastRound.belote.team1 || lastRound.belote.team2" class="lr-belote">
          <span v-if="lastRound.belote.team1" class="belote-tag t1">Belote {{ store.team1Name }}</span>
          <span v-if="lastRound.belote.team2" class="belote-tag t2">Belote {{ store.team2Name }}</span>
        </div>
        <div v-if="lastRound.finalScores.team1 >= 252 || lastRound.finalScores.team2 >= 252" class="lr-capot">
          Capot {{ lastRound.finalScores.team1 >= 252 ? store.team1Name : store.team2Name }} !
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-section">
      <div class="section-title">Récapitulatif</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ store.game.rounds.length }}</div>
          <div class="stat-label">Manches</div>
        </div>
        <div class="stat-card">
          <div class="stat-value red">{{ team1Wins }}</div>
          <div class="stat-label">Victoires Éq. 1</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ team2Wins }}</div>
          <div class="stat-label">Victoires Éq. 2</div>
        </div>
        <div class="stat-card">
          <div class="stat-value gold">{{ capotCount }}</div>
          <div class="stat-label">Capots</div>
        </div>
      </div>
    </div>

    <!-- End game -->
    <div class="end-section">
      <button class="end-btn" @click="confirmEnd = true">Terminer la partie</button>
    </div>

    <!-- Confirm dialog -->
    <Teleport to="body">
      <div v-if="confirmEnd" class="confirm-overlay" @click.self="confirmEnd = false">
        <div class="confirm-box">
          <p>Terminer la partie en cours ?</p>
          <p class="confirm-sub">Les données ne seront plus accessibles.</p>
          <div class="confirm-btns">
            <button class="conf-cancel" @click="confirmEnd = false">Annuler</button>
            <button class="conf-ok" @click="doEndGame">Terminer</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/useGameStore'

const store = useGameStore()
const confirmEnd = ref(false)

const lastRound = computed(() => {
  const rounds = store.game?.rounds ?? []
  return rounds.length ? rounds[rounds.length - 1] : null
})

const total = computed(() => store.team1Total + store.team2Total)
const team1Pct = computed(() => total.value ? Math.round((store.team1Total / total.value) * 100) : 50)
const team2Pct = computed(() => 100 - team1Pct.value)

const team1Wins = computed(() =>
  store.game?.rounds.filter(r => r.finalScores.team1 > r.finalScores.team2).length ?? 0
)
const team2Wins = computed(() =>
  store.game?.rounds.filter(r => r.finalScores.team2 > r.finalScores.team1).length ?? 0
)
const capotCount = computed(() =>
  store.game?.rounds.filter(r => r.finalScores.team1 >= 252 || r.finalScores.team2 >= 252).length ?? 0
)

function doEndGame() {
  store.endGame()
  confirmEnd.value = false
}
</script>

<style scoped>
.scoreboard {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px;
}

/* Teams */
.teams-row {
  display: flex;
  gap: 10px;
}

.team-card {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  transition: border-color 0.2s;
}

.team-card.leading {
  border-color: var(--red-dim-2);
  background: linear-gradient(135deg, var(--surface) 0%, var(--red-dim) 100%);
}

.team-players {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.player-pill {
  font-size: 12px;
  color: var(--text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.big-score {
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--text);
}

.big-score.c-red { color: var(--red); }

.lead-badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--red-dim);
  color: var(--red);
}

/* Progress */
.progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-bar {
  height: 6px;
  background: var(--surface-3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-t1 {
  height: 100%;
  background: var(--red);
  border-radius: 3px;
  transition: width 0.4s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.red { color: var(--red); }
.gold { color: var(--gold); }
.text-muted { color: var(--text-3); }

/* Last round */
.section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-3);
  margin-bottom: 8px;
}

.last-round-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lr-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lr-suit {
  font-size: 20px;
  line-height: 1;
}

.lr-info {
  font-size: 12px;
  color: var(--text-2);
}

.lr-scores {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lr-score {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lr-score:nth-child(3) {
  align-items: flex-end;
}

.lr-sep {
  color: var(--text-3);
  flex-shrink: 0;
}

.lr-name {
  font-size: 11px;
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lr-pts {
  font-size: 22px;
  font-weight: 700;
}

.lr-pts { color: var(--text-2); }
.lr-score.winner .lr-pts { color: var(--red); }

.lr-belote {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.belote-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
}

.belote-tag.t1 { background: var(--red-dim); color: var(--red); }
.belote-tag.t2 { background: var(--surface-3); color: var(--text-2); }

.lr-capot {
  font-size: 12px;
  color: var(--gold);
  font-weight: 500;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  color: var(--text);
}

.stat-value.red { color: var(--red); }
.stat-value.gold { color: var(--gold); }

.stat-label {
  font-size: 9px;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
  line-height: 1.2;
}

/* End */
.end-section {
  padding-top: 4px;
}

.end-btn {
  width: 100%;
  padding: 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  color: var(--text-3);
  font-size: 13px;
  background: var(--surface);
}

/* Confirm */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.confirm-box {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.confirm-box p {
  font-size: 15px;
  font-weight: 500;
}

.confirm-sub {
  font-size: 13px;
  color: var(--text-2);
  font-weight: 400 !important;
}

.confirm-btns {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.conf-cancel {
  flex: 1;
  padding: 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  color: var(--text-2);
  font-size: 14px;
}

.conf-ok {
  flex: 1;
  padding: 12px;
  border-radius: var(--radius-sm);
  background: var(--red);
  color: white;
  font-size: 14px;
  font-weight: 600;
}
</style>
