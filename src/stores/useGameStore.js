import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'belote_v2'

const TRUMP_TO_TEXT = {
  '♥': 'Coeur', '♦': 'Carreau', '♣': 'Trefle', '♠': 'Pique',
  'SA': 'Sans Atout', 'TA': 'Tout Atout',
}
const TEXT_TO_TRUMP = Object.fromEntries(
  Object.entries(TRUMP_TO_TEXT).map(([sym, name]) => [name.toLowerCase(), sym])
)

export const useGameStore = defineStore('game', () => {
  const game = ref(null)
  const completedGames = ref([])
  const lastPlayers = ref(null)

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      game.value = data.current ?? null
      completedGames.value = data.completedGames ?? []
      lastPlayers.value = data.last ?? null
    }
  } catch {}

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      current: game.value,
      completedGames: completedGames.value,
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

  const team1GameWins = computed(() =>
    completedGames.value.filter(g => g.winner === 1).length
  )
  const team2GameWins = computed(() =>
    completedGames.value.filter(g => g.winner === 2).length
  )

  const currentPartyNumber = computed(() => completedGames.value.length + 1)

  const currentGameWinner = computed(() => {
    if (!game.value?.rounds.length) return null
    const t1 = team1Total.value
    const t2 = team2Total.value
    if (t1 >= 1000 && t2 >= 1000) return t1 >= t2 ? 1 : 2
    if (t1 >= 1000) return 1
    if (t2 >= 1000) return 2
    return null
  })

  const allRounds = computed(() => [
    ...completedGames.value.flatMap(g => g.rounds),
    ...(game.value?.rounds ?? []),
  ])

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
    completedGames.value = []
    persist()
  }

  function addRound({ dealer, taker, trump, team1CardScore, team2CardScore, capotTeam, belote }) {
    if (!game.value) return
    const t1Card = Math.max(0, Math.min(252, Number(team1CardScore)))
    const t2Card = Math.max(0, Math.min(252, Number(team2CardScore)))
    game.value.rounds.push({
      id: Date.now(),
      dealer,
      taker,
      trump,
      capotTeam: capotTeam ?? null,
      belote: { team1: !!belote.team1, team2: !!belote.team2 },
      finalScores: {
        team1: t1Card + (belote.team1 ? 20 : 0),
        team2: t2Card + (belote.team2 ? 20 : 0),
      },
    })
    persist()
  }

  function completeCurrentGame() {
    if (!game.value) return
    completedGames.value.push({
      id: game.value.id,
      players: game.value.players,
      rounds: [...game.value.rounds],
      winner: currentGameWinner.value,
      startedAt: game.value.startedAt,
      completedAt: new Date().toISOString(),
      finalScores: { team1: team1Total.value, team2: team2Total.value },
    })
    game.value = {
      id: Date.now(),
      startedAt: new Date().toISOString(),
      players: game.value.players,
      rounds: [],
    }
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
    completedGames.value = []
    persist()
  }

  function trumpToText(sym) {
    return TRUMP_TO_TEXT[sym] ?? sym
  }

  function textToTrump(text) {
    return TEXT_TO_TRUMP[text.trim().toLowerCase()] ?? text.trim()
  }

  function exportGameCSV(gameObj) {
    const lines = ['Donneur,Preneur,Atout,Score 1,Score 2,Belote 1,Belote 2']
    gameObj.rounds.forEach(r => {
      lines.push([
        r.dealer, r.taker, trumpToText(r.trump),
        r.finalScores.team1, r.finalScores.team2,
        r.belote.team1 ? 1 : 0, r.belote.team2 ? 1 : 0,
      ].join(','))
    })
    return lines.join('\n')
  }

  function exportAllCSV() {
    const lines = ['Partie,Donneur,Preneur,Atout,Score 1,Score 2,Belote 1,Belote 2']
    const all = [...completedGames.value]
    if (game.value?.rounds.length) all.push(game.value)
    all.forEach((g, idx) => {
      g.rounds.forEach(r => {
        lines.push([
          idx + 1, r.dealer, r.taker, trumpToText(r.trump),
          r.finalScores.team1, r.finalScores.team2,
          r.belote.team1 ? 1 : 0, r.belote.team2 ? 1 : 0,
        ].join(','))
      })
    })
    return lines.join('\n')
  }

  function importCSV(csvText) {
    if (!game.value) return { ok: false, count: 0 }
    const lines = csvText.trim().split('\n')
    const first = lines[0].toLowerCase()
    const start = (first.includes('donneur') || first.includes('partie')) ? 1 : 0
    let count = 0
    lines.slice(start).forEach((line, idx) => {
      const raw = line.trim()
      if (!raw) return
      const parts = raw.split(',')
      let dealer, taker, trump, score1, score2, belote1, belote2
      if (parts.length >= 8) {
        ;[, dealer, taker, trump, score1, score2, belote1, belote2] = parts
      } else {
        ;[dealer, taker, trump, score1, score2, belote1, belote2] = parts
      }
      if (!dealer?.trim()) return
      game.value.rounds.push({
        id: Date.now() + idx,
        dealer: dealer.trim(),
        taker: taker.trim(),
        trump: textToTrump(trump ?? ''),
        capotTeam: null,
        belote: { team1: belote1?.trim() === '1', team2: belote2?.trim() === '1' },
        finalScores: { team1: Number(score1), team2: Number(score2) },
      })
      count++
    })
    persist()
    return { ok: true, count }
  }

  return {
    game, completedGames, lastPlayers, hasGame,
    team1Total, team2Total, team1Name, team2Name,
    team1GameWins, team2GameWins, currentPartyNumber, currentGameWinner, allRounds,
    startGame, addRound, completeCurrentGame, deleteRound, endGame,
    exportGameCSV, exportAllCSV, importCSV,
  }
})
