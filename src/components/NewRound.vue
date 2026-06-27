<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Nouvelle manche</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- Dealer -->
        <div class="form-group">
          <label class="form-label">Donneur</label>
          <div class="chips">
            <button
              v-for="player in allPlayers"
              :key="'d-' + player"
              :class="['chip', { active: dealer === player, 'team1-chip': isTeam1(player), 'team2-chip': !isTeam1(player) }]"
              @click="dealer = player"
            >{{ player }}</button>
          </div>
        </div>

        <!-- Taker -->
        <div class="form-group">
          <label class="form-label">Preneur</label>
          <div class="chips">
            <button
              v-for="player in allPlayers"
              :key="'t-' + player"
              :class="['chip', { active: taker === player, 'team1-chip': isTeam1(player), 'team2-chip': !isTeam1(player) }]"
              @click="taker = player"
            >{{ player }}</button>
          </div>
        </div>

        <!-- Trump suit -->
        <div class="form-group">
          <label class="form-label">Atout</label>
          <div class="chips trump-chips">
            <button
              v-for="suit in TRUMP_SUITS"
              :key="suit.val"
              :class="['chip', 'suit-chip', suit.cls, { active: trump === suit.val }]"
              @click="trump = suit.val"
            >{{ suit.val }}</button>
          </div>
        </div>

        <!-- Score input -->
        <div class="form-group">
          <label class="form-label">Score cartes</label>
          <div class="chips">
            <button
              :class="['chip', 'team1-chip', { active: scoringTeam === 1 }]"
              @click="scoringTeam = 1"
            >{{ store.team1Name }}</button>
            <button
              :class="['chip', 'team2-chip', { active: scoringTeam === 2 }]"
              @click="scoringTeam = 2"
            >{{ store.team2Name }}</button>
          </div>
          <div class="score-row">
            <input
              v-model.number="activeScore"
              type="number"
              inputmode="numeric"
              min="0"
              max="252"
              class="score-input"
              @blur="clampScore"
            />
          </div>
          <div class="score-preview">
            <div class="preview-team t1">
              <span class="preview-name">{{ store.team1Name }}</span>
              <span class="preview-pts">{{ team1CardScore }} pts</span>
            </div>
            <div class="preview-sep">|</div>
            <div class="preview-team t2">
              <span class="preview-name">{{ store.team2Name }}</span>
              <span class="preview-pts">{{ team2CardScore }} pts</span>
            </div>
          </div>
        </div>

        <!-- Belote / Rebelote -->
        <div class="form-group">
          <label class="form-label">Belote / Rebelote (+20 pts)</label>
          <div class="belote-row">
            <button
              :class="['belote-btn', { active: belote.team1, 't1-active': belote.team1 }]"
              @click="belote.team1 = !belote.team1"
            >
              <span>{{ store.team1Name }}</span>
              <span class="belote-badge">{{ belote.team1 ? '✓ +20' : '+20' }}</span>
            </button>
            <button
              :class="['belote-btn', { active: belote.team2, 't2-active': belote.team2 }]"
              @click="belote.team2 = !belote.team2"
            >
              <span>{{ store.team2Name }}</span>
              <span class="belote-badge">{{ belote.team2 ? '✓ +20' : '+20' }}</span>
            </button>
          </div>
        </div>

        <!-- Final scores preview -->
        <div class="final-preview">
          <div class="final-label">Score final</div>
          <div class="final-scores">
            <div class="final-team t1">
              <span class="final-name">{{ store.team1Name }}</span>
              <span class="final-pts">{{ displayFinal1 }}</span>
            </div>
            <div class="final-sep">—</div>
            <div class="final-team t2">
              <span class="final-name">{{ store.team2Name }}</span>
              <span class="final-pts">{{ displayFinal2 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">Annuler</button>
        <button class="confirm-btn" :disabled="!isValid" @click="submit">
          Valider la manche
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useGameStore } from '../stores/useGameStore'

const emit = defineEmits(['close'])
const store = useGameStore()

const TRUMP_SUITS = [
  { val: '♥', cls: 'suit-red' },
  { val: '♦', cls: 'suit-red' },
  { val: '♣', cls: 'suit-dark' },
  { val: '♠', cls: 'suit-dark' },
  { val: 'SA', cls: 'suit-gold' },
  { val: 'TA', cls: 'suit-gold' },
]

const dealer = ref('')
const taker = ref('')
const trump = ref('')
const scoringTeam = ref(1)
const rawScore = ref(81)
const belote = reactive({ team1: false, team2: false })

const allPlayers = computed(() => [
  ...(store.game?.players.team1 ?? []),
  ...(store.game?.players.team2 ?? []),
])

function isTeam1(player) {
  return store.game?.players.team1.includes(player)
}

const activeScore = computed({
  get: () => rawScore.value,
  set: (v) => { rawScore.value = Math.max(0, Math.min(252, Number(v) || 0)) },
})

function complement(score) {
  return score === 252 ? 0 : Math.max(0, 162 - score)
}

const team1CardScore = computed(() =>
  scoringTeam.value === 1 ? rawScore.value : complement(rawScore.value)
)

const team2CardScore = computed(() =>
  scoringTeam.value === 2 ? rawScore.value : complement(rawScore.value)
)

const displayFinal1 = computed(() => team1CardScore.value + (belote.team1 ? 20 : 0))
const displayFinal2 = computed(() => team2CardScore.value + (belote.team2 ? 20 : 0))

function clampScore() {
  rawScore.value = Math.max(0, Math.min(252, Number(rawScore.value) || 0))
}

const isValid = computed(() => dealer.value && taker.value && trump.value)

function submit() {
  if (!isValid.value) return
  store.addRound({
    dealer: dealer.value,
    taker: taker.value,
    trump: trump.value,
    team1CardScore: team1CardScore.value,
    team2CardScore: team2CardScore.value,
    capotTeam: null,
    belote: { team1: belote.team1, team2: belote.team2 },
  })
  emit('close')
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal {
  background: var(--surface);
  border-radius: var(--radius) var(--radius) 0 0;
  border: 1px solid var(--border);
  border-bottom: none;
  width: 100%;
  max-width: 480px;
  max-height: 92dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.modal-header h2 {
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-2);
  font-size: 16px;
  border-radius: 50%;
  background: var(--surface-2);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.form-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-2);
  text-align: center;
}

/* Chips */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.chip {
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: 13px;
  transition: all 0.15s;
  min-height: 36px;
}

.chip.active {
  border-color: var(--text-2);
  color: var(--text);
  background: var(--surface-3);
}

.chip.team1-chip.active {
  border-color: var(--red);
  color: var(--red);
  background: var(--red-dim);
}

.chip.team2-chip.active {
  border-color: var(--text);
  color: var(--text);
  background: var(--surface-3);
}

/* Trump chips */
.trump-chips {
  gap: 8px;
}

.suit-chip {
  font-size: 18px;
  padding: 8px 16px;
  min-width: 48px;
  text-align: center;
}

.suit-red { color: var(--red); }
.suit-red.active { border-color: var(--red); background: var(--red-dim); }

.suit-dark { color: var(--text); }
.suit-dark.active { border-color: var(--text); background: var(--surface-3); }

.suit-gold { color: var(--gold); font-size: 12px; }
.suit-gold.active { border-color: var(--gold); background: var(--gold-dim); }

/* Score input */
.score-row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.score-input {
  flex: 1;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  padding: 10px 8px;
  min-width: 0;
  height: 44px;
}

.score-input::-webkit-inner-spin-button,
.score-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.score-preview {
  display: flex;
  align-items: center;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  width: 100%;
}

.preview-team {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
}

.preview-team.t1 { border-right: 1px solid var(--border); }

.preview-sep {
  color: var(--text-3);
  font-size: 12px;
  padding: 0 2px;
}

.preview-name {
  font-size: 12px;
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.preview-pts {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  flex-shrink: 0;
}

.t1 .preview-pts { color: var(--red); }

/* Belote */
.belote-row {
  display: flex;
  gap: 8px;
  width: 100%;
}

.belote-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  font-size: 12px;
  color: var(--text-2);
  transition: all 0.15s;
}

.belote-btn.t1-active {
  border-color: var(--red);
  background: var(--red-dim);
  color: var(--red);
}

.belote-btn.t2-active {
  border-color: var(--text);
  background: var(--surface-3);
  color: var(--text);
}

.belote-badge {
  font-size: 13px;
  font-weight: 600;
}

/* Final preview */
.final-preview {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  width: 100%;
}

.final-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-3);
  padding: 8px 14px 0;
}

.final-scores {
  display: flex;
  align-items: center;
  padding: 8px 14px 12px;
  gap: 8px;
}

.final-team {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.final-team:nth-child(3) {
  align-items: flex-end;
  text-align: right;
}

.final-sep {
  color: var(--text-3);
  font-size: 14px;
  flex-shrink: 0;
}

.final-name {
  font-size: 11px;
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.final-pts {
  font-size: 22px;
  font-weight: 700;
}

.t1 .final-pts { color: var(--red); }
.t2 .final-pts { color: var(--text); }

/* Footer */
.modal-footer {
  display: flex;
  gap: 10px;
  padding: 12px 20px calc(var(--safe-bottom) + 12px);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.cancel-btn {
  flex: 0 0 auto;
  padding: 13px 20px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  color: var(--text-2);
  font-size: 14px;
}

.confirm-btn {
  flex: 1;
  padding: 13px;
  border-radius: var(--radius-sm);
  background: var(--red);
  color: white;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.15s;
}

.confirm-btn:disabled {
  opacity: 0.35;
}

.confirm-btn:not(:disabled):active {
  opacity: 0.85;
}
</style>
