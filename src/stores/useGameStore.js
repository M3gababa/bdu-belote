import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'belote_v1'

export const useGameStore = defineStore('game', () => {
  const game = ref(null)
  const lastPlayers = ref(null)

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      game.value = data.current ?? null
      lastPlayers.value = data.last ?? null
    }
  } catch {}

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      current: game.value,
      last: lastPlayers.value,
    }))
  }

  const hasGame = computed(() => game.value !== null)

  const team1Total = computed(() =>
    game.value?.rounds.reduce((sum, r) => sum + r.finalScores.team1, 0) ?? 0
  )

  const team2Total = computed(() =>
    game.value?.rounds.reduce((sum, r) => sum + r.finalScores.team2, 0) ?? 0
  )

  const team1Name = computed(() => game.value?.players.team1.join(' / ') ?? 'Équipe 1')
  const team2Name = computed(() => game.value?.players.team2.join(' / ') ?? 'Équipe 2')

  function startGame(players) {
    if (game.value) {
      lastPlayers.value = {
        team1: [...game.value.players.team1],
        team2: [...game.value.players.team2],
      }
    }
    game.value = {
      id: Date.now(),
      startedAt: new Date().toISOString(),
      players,
      rounds: [],
    }
    persist()
  }

  function addRound({ dealer, taker, trump, team1CardScore, team2CardScore, capotTeam, belote }) {
    if (!game.value) return

    const t1Card = Math.max(0, Math.min(252, Number(team1CardScore)))
    const t2Card = Math.max(0, Math.min(252, Number(team2CardScore)))
    const t1Final = t1Card + (belote.team1 ? 20 : 0)
    const t2Final = t2Card + (belote.team2 ? 20 : 0)

    game.value.rounds.push({
      id: Date.now(),
      dealer,
      taker,
      trump,
      capotTeam: capotTeam ?? null,
      belote: { team1: !!belote.team1, team2: !!belote.team2 },
      finalScores: { team1: t1Final, team2: t2Final },
    })

    persist()
  }

  function deleteRound(roundId) {
    if (!game.value) return
    game.value.rounds = game.value.rounds.filter(r => r.id !== roundId)
    persist()
  }

  function endGame() {
    if (game.value) {
      lastPlayers.value = {
        team1: [...game.value.players.team1],
        team2: [...game.value.players.team2],
      }
    }
    game.value = null
    persist()
  }

  return {
    game,
    lastPlayers,
    hasGame,
    team1Total,
    team2Total,
    team1Name,
    team2Name,
    startGame,
    addRound,
    deleteRound,
    endGame,
  }
})
