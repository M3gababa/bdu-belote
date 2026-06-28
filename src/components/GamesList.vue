<template>
  <div class="parties-page">
    <!-- Top actions -->
    <div class="top-actions">
      <button class="action-btn" @click="exportAll">Exporter tout</button>
      <button class="action-btn import-btn" @click="fileInput.click()">Importer CSV</button>
      <input ref="fileInput" type="file" accept=".csv,text/csv" style="display:none" @change="handleImport" />
    </div>

    <div v-if="importFeedback" class="import-feedback">{{ importFeedback }}</div>

    <div v-if="!completedGames.length && !store.game?.rounds.length" class="empty-state">
      <div class="empty-icon">♠</div>
      <p>Aucune partie jouée</p>
    </div>

    <template v-else>
      <!-- Current game -->
      <div v-if="store.game" class="game-card current">
        <div class="game-header">
          <span class="party-num">Partie {{ store.currentPartyNumber }}</span>
          <span class="status-badge current-badge">En cours</span>
          <span class="round-count">{{ store.game.rounds.length }} manches</span>
          <button class="icon-btn" @click="exportGame(store.game, store.currentPartyNumber)" title="Exporter">↓</button>
          <button class="icon-btn" @click="toggleExpand('current')" >{{ expanded === 'current' ? '▴' : '▾' }}</button>
        </div>
        <div class="game-score">
          <span :class="['score-val', { 'c-red': store.team1Total > store.team2Total }]">{{ store.team1Total }}</span>
          <span class="score-sep">—</span>
          <span :class="['score-val', { 'c-red': store.team2Total > store.team1Total }]">{{ store.team2Total }}</span>
        </div>
        <div v-if="expanded === 'current'" class="rounds-detail">
          <RoundDetail :rounds="store.game.rounds" :team1-name="store.team1Name" :team2-name="store.team2Name" />
        </div>
      </div>

      <!-- Completed games (newest first) -->
      <div
        v-for="(g, idx) in reversedCompleted"
        :key="g.id"
        class="game-card"
      >
        <div class="game-header">
          <span class="party-num">Partie {{ completedGames.length - idx }}</span>
          <span class="status-badge" :class="g.winner === 1 ? 'win1' : 'win2'">
            {{ g.winner === 1 ? store.team1Name : store.team2Name }} gagne
          </span>
          <span class="round-count">{{ g.rounds.length }} manches</span>
          <button class="icon-btn" @click="exportGame(g, completedGames.length - idx)" title="Exporter">↓</button>
          <button class="icon-btn" @click="toggleExpand(g.id)">{{ expanded === g.id ? '▴' : '▾' }}</button>
        </div>
        <div class="game-score">
          <span :class="['score-val', { 'c-red': g.finalScores.team1 > g.finalScores.team2 }]">{{ g.finalScores.team1 }}</span>
          <span class="score-sep">—</span>
          <span :class="['score-val', { 'c-red': g.finalScores.team2 > g.finalScores.team1 }]">{{ g.finalScores.team2 }}</span>
        </div>
        <div class="game-date">{{ formatDate(g.completedAt) }}</div>
        <div v-if="expanded === g.id" class="rounds-detail">
          <RoundDetail :rounds="g.rounds" :team1-name="store.team1Name" :team2-name="store.team2Name" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/useGameStore'

const store = useGameStore()

const completedGames = computed(() => store.completedGames)
const reversedCompleted = computed(() => [...completedGames.value].reverse())

const expanded = ref(null)
const fileInput = ref(null)
const importFeedback = ref('')

function toggleExpand(id) {
  expanded.value = expanded.value === id ? null : id
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

function todayPrefix() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function exportGame(gameObj, num) {
  downloadCSV(store.exportGameCSV(gameObj), `${todayPrefix()}-belote-partie-${num}.csv`)
}

function exportAll() {
  downloadCSV(store.exportAllCSV(), `${todayPrefix()}-belote.csv`)
}

function handleImport(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const { ok, count } = store.importCSV(ev.target.result)
    importFeedback.value = ok ? `${count} manche(s) importée(s)` : 'Erreur d\'import'
    setTimeout(() => { importFeedback.value = '' }, 3000)
  }
  reader.readAsText(file)
  e.target.value = ''
}
</script>

<script>
// RoundDetail sub-component defined inline
const RoundDetail = {
  props: ['rounds', 'team1Name', 'team2Name'],
  template: `
    <div class="rd-wrap">
      <div class="rd-header">
        <span>#</span>
        <span>Atout · Preneur</span>
        <span class="rd-score">{{ team1Name }}</span>
        <span class="rd-score">{{ team2Name }}</span>
      </div>
      <div v-for="(r, i) in rounds" :key="r.id" class="rd-row">
        <span class="rd-num">{{ i + 1 }}</span>
        <span class="rd-meta">{{ r.trump }} · {{ r.taker }}</span>
        <span class="rd-pts" :class="{ 'c-red': r.finalScores.team1 > r.finalScores.team2 }">{{ r.finalScores.team1 }}</span>
        <span class="rd-pts" :class="{ 'c-red': r.finalScores.team2 > r.finalScores.team1 }">{{ r.finalScores.team2 }}</span>
      </div>
    </div>
  `,
}
export default { components: { RoundDetail } }
</script>

<style scoped>
.parties-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 80px;
}

.top-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-2);
  font-size: 13px;
  font-weight: 500;
}

.import-btn {
  background: var(--surface-2);
}

.import-feedback {
  font-size: 12px;
  color: var(--gold);
  text-align: center;
  padding: 4px;
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
  opacity: 0.3;
}

.empty-state p { font-size: 13px; }

/* Game cards */
.game-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.game-card.current {
  border-color: var(--red-dim-2);
}

.game-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.party-num {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-2);
  flex-shrink: 0;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}

.current-badge { background: var(--red-dim); color: var(--red); }
.win1 { background: var(--red-dim); color: var(--red); }
.win2 { background: var(--surface-3); color: var(--text-2); }

.round-count {
  font-size: 11px;
  color: var(--text-3);
  flex: 1;
}

.icon-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: 13px;
  flex-shrink: 0;
}

.game-score {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.score-val {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-3);
}

.score-val.c-red { color: var(--red); }

.score-sep {
  font-size: 16px;
  color: var(--text-3);
}

.game-date {
  font-size: 11px;
  color: var(--text-3);
  margin-top: -4px;
}

/* Round detail */
.rounds-detail {
  border-top: 1px solid var(--border);
  padding-top: 10px;
  margin-top: 4px;
}

:deep(.rd-wrap) {
  display: flex;
  flex-direction: column;
  gap: 0;
}

:deep(.rd-header) {
  display: grid;
  grid-template-columns: 24px 1fr 60px 60px;
  gap: 8px;
  padding: 4px 0 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-3);
  border-bottom: 1px solid var(--border);
  margin-bottom: 4px;
}

:deep(.rd-row) {
  display: grid;
  grid-template-columns: 24px 1fr 60px 60px;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 1px solid var(--surface-2);
  align-items: center;
}

:deep(.rd-num) {
  font-size: 11px;
  color: var(--text-3);
}

:deep(.rd-meta) {
  font-size: 12px;
  color: var(--text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.rd-score) {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-3);
  text-align: right;
}

:deep(.rd-pts) {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-3);
  text-align: right;
}

:deep(.rd-pts.c-red) { color: var(--red); }

.c-red { color: var(--red); }
</style>
