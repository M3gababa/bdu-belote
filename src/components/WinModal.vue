<template>
  <div class="overlay">
    <div class="win-card">
      <div class="trophy">🏆</div>
      <div class="win-title">Victoire !</div>
      <div class="win-team" :class="{ 'c-red': winner === 1 }">
        {{ winner === 1 ? store.team1Name : store.team2Name }}
      </div>
      <div class="win-sub">remporte la partie</div>

      <div class="final-scores">
        <div class="fs-team" :class="{ 'c-red': store.team1Total > store.team2Total }">
          <span class="fs-name">{{ store.team1Name }}</span>
          <span class="fs-pts">{{ store.team1Total }}</span>
        </div>
        <span class="fs-sep">—</span>
        <div class="fs-team right" :class="{ 'c-red': store.team2Total > store.team1Total }">
          <span class="fs-name">{{ store.team2Name }}</span>
          <span class="fs-pts">{{ store.team2Total }}</span>
        </div>
      </div>

      <div class="win-meta">
        {{ store.game?.rounds.length }} manches · Partie {{ store.currentPartyNumber }}
      </div>

      <div class="win-actions">
        <button class="new-party-btn" @click="newParty">Nouvelle partie</button>
        <button class="end-btn" @click="endSession">Terminer la session</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/useGameStore'

const store = useGameStore()
defineProps({ winner: Number })

function newParty() {
  store.completeCurrentGame()
}
function endSession() {
  store.endGame()
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.win-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 32px 24px 24px;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.trophy {
  font-size: 48px;
  line-height: 1;
  margin-bottom: 4px;
}

.win-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-3);
}

.win-team {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.win-team.c-red { color: var(--red); }

.win-sub {
  font-size: 13px;
  color: var(--text-2);
  margin-top: -6px;
}

.final-scores {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0 4px;
  width: 100%;
  justify-content: center;
}

.fs-team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.fs-team.right { align-items: center; }

.fs-name {
  font-size: 11px;
  color: var(--text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.fs-pts {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
}

.fs-team.c-red .fs-pts { color: var(--red); }

.fs-sep {
  font-size: 18px;
  color: var(--text-3);
  flex-shrink: 0;
}

.win-meta {
  font-size: 12px;
  color: var(--text-3);
}

.win-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-top: 8px;
}

.new-party-btn {
  width: 100%;
  padding: 13px;
  border-radius: var(--radius-sm);
  background: var(--red);
  color: white;
  font-size: 15px;
  font-weight: 600;
}

.end-btn {
  width: 100%;
  padding: 11px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  color: var(--text-3);
  font-size: 13px;
  background: var(--surface);
}
</style>
