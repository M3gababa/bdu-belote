<template>
  <div class="history">
    <div v-if="!rounds.length" class="empty-state">
      <div class="empty-icon">♥</div>
      <p>Aucune manche jouée</p>
      <p class="empty-sub">Appuyez sur + pour commencer</p>
    </div>

    <div v-else>
      <!-- Cumulative scores header -->
      <div class="cumul-banner">
        <div class="cumul-team t1">
          <span class="cumul-name">{{ store.team1Name }}</span>
          <span class="cumul-pts">{{ store.team1Total }}</span>
        </div>
        <div class="cumul-sep">|</div>
        <div class="cumul-team t2">
          <span class="cumul-name">{{ store.team2Name }}</span>
          <span class="cumul-pts">{{ store.team2Total }}</span>
        </div>
      </div>

      <!-- Rounds list (newest first) -->
      <div class="rounds-list">
        <div
          v-for="(round, idx) in reversedRounds"
          :key="round.id"
          class="round-card"
        >
          <div class="round-header">
            <div class="round-number">#{{ rounds.length - idx }}</div>
            <div class="round-meta">
              <span class="suit-badge" :class="getSuitClass(round.trump)">{{ round.trump }}</span>
              <span class="meta-info">{{ round.taker }} prend</span>
              <span class="meta-sep">·</span>
              <span class="meta-info">Dist. {{ round.dealer }}</span>
            </div>
            <button class="delete-btn" @click="confirmDelete(round.id)">✕</button>
          </div>

          <div class="round-scores">
            <div class="rs-team t1" :class="{ winner: round.finalScores.team1 > round.finalScores.team2 }">
              <span class="rs-pts">{{ round.finalScores.team1 }}</span>
              <div class="rs-detail">
                <span v-if="round.belote.team1" class="mini-tag">Belote</span>
                <span v-if="round.finalScores.team1 >= 252" class="mini-tag capot">Capot</span>
              </div>
            </div>
            <div class="rs-sep">—</div>
            <div class="rs-team t2" :class="{ winner: round.finalScores.team2 > round.finalScores.team1 }">
              <span class="rs-pts">{{ round.finalScores.team2 }}</span>
              <div class="rs-detail">
                <span v-if="round.belote.team2" class="mini-tag">Belote</span>
                <span v-if="round.finalScores.team2 >= 252" class="mini-tag capot">Capot</span>
              </div>
            </div>
          </div>

          <!-- Running totals -->
          <div class="running-total">
            <span class="rt-label">Cumul :</span>
            <span class="rt-t1">{{ cumulAt(rounds.length - 1 - idx).t1 }}</span>
            <span class="rt-sep">—</span>
            <span class="rt-t2">{{ cumulAt(rounds.length - 1 - idx).t2 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation -->
    <Teleport to="body">
      <div v-if="deleteId !== null" class="confirm-overlay" @click.self="deleteId = null">
        <div class="confirm-box">
          <p>Supprimer cette manche ?</p>
          <div class="confirm-btns">
            <button class="conf-cancel" @click="deleteId = null">Annuler</button>
            <button class="conf-ok" @click="doDelete">Supprimer</button>
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
const deleteId = ref(null)

const rounds = computed(() => store.game?.rounds ?? [])
const reversedRounds = computed(() => [...rounds.value].reverse())

function cumulAt(index) {
  const r = rounds.value
  let t1 = 0, t2 = 0
  for (let i = 0; i <= index; i++) {
    t1 += r[i].finalScores.team1
    t2 += r[i].finalScores.team2
  }
  return { t1, t2 }
}

function getSuitClass(trump) {
  if (trump === '♥' || trump === '♦') return 'red'
  if (trump === 'SA' || trump === 'TA') return 'gold'
  return ''
}

function confirmDelete(id) {
  deleteId.value = id
}

function doDelete() {
  store.deleteRound(deleteId.value)
  deleteId.value = null
}
</script>

<style scoped>
.history {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 80px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 60px 0;
  color: var(--text-3);
}

.empty-icon {
  font-size: 40px;
  color: var(--red);
  opacity: 0.4;
  line-height: 1;
}

.empty-state p {
  font-size: 14px;
}

.empty-sub {
  font-size: 12px;
  color: var(--text-3);
}

/* Cumul banner */
.cumul-banner {
  display: flex;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 16px;
  gap: 12px;
}

.cumul-team {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cumul-name {
  font-size: 12px;
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.cumul-pts {
  font-size: 20px;
  font-weight: 700;
}

.cumul-pts { color: var(--text); }

.cumul-sep {
  color: var(--text-3);
  font-size: 16px;
  flex-shrink: 0;
}

/* Round cards */
.rounds-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.round-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.round-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.round-number {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-3);
  flex-shrink: 0;
  min-width: 24px;
}

.round-meta {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  min-width: 0;
}

.suit-badge {
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
}

.suit-badge.red { color: var(--red); }
.suit-badge.gold { color: var(--gold); }

.meta-info {
  font-size: 12px;
  color: var(--text-2);
}

.meta-sep {
  color: var(--text-3);
  font-size: 12px;
}

.delete-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--text-3);
  font-size: 12px;
  background: var(--surface-2);
  flex-shrink: 0;
}

/* Scores */
.round-scores {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rs-team {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.rs-team.t2 {
  flex-direction: row-reverse;
}

.rs-sep {
  color: var(--text-3);
  flex-shrink: 0;
}

.rs-pts {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: var(--text-3);
  transition: color 0.15s;
}

.rs-pts { color: var(--text-3); opacity: 1; }
.rs-team.winner .rs-pts { color: var(--red); }

.rs-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mini-tag {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 6px;
  border-radius: 3px;
  background: var(--surface-3);
  color: var(--text-3);
}

.mini-tag.capot {
  background: var(--gold-dim);
  color: var(--gold);
}

/* Running total */
.running-total {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-3);
  padding-top: 4px;
  border-top: 1px solid var(--border);
}

.rt-label {
  flex: 0;
  white-space: nowrap;
}

.rt-t1, .rt-t2 { color: var(--text-2); font-weight: 600; }
.rt-sep { color: var(--text-3); }

/* Confirm dialog */
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
  max-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.confirm-box p {
  font-size: 15px;
  font-weight: 500;
}

.confirm-btns {
  display: flex;
  gap: 10px;
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
