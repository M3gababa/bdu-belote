<template>
  <div class="charts-page">
    <div v-if="!rounds.length" class="empty-state">
      <div class="empty-icon">♦</div>
      <p>Jouez des manches pour voir les statistiques</p>
    </div>

    <template v-else>
      <!-- Score progression -->
      <div class="chart-card">
        <h3 class="chart-title">Progression des scores</h3>
        <div class="chart-wrap">
          <canvas ref="lineRef"></canvas>
        </div>
      </div>

      <!-- Who takes the most -->
      <div class="chart-card">
        <h3 class="chart-title">Preneurs</h3>
        <div class="chart-wrap short">
          <canvas ref="barRef"></canvas>
        </div>
      </div>

      <!-- Trump distribution -->
      <div class="chart-card">
        <h3 class="chart-title">Atouts</h3>
        <div class="chart-wrap short">
          <canvas ref="doughnutRef"></canvas>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useGameStore } from '../stores/useGameStore'

Chart.register(...registerables)

const store = useGameStore()

const lineRef = ref(null)
const barRef = ref(null)
const doughnutRef = ref(null)

const rounds = computed(() => store.game?.rounds ?? [])

const team1Name = computed(() => store.team1Name)
const team2Name = computed(() => store.team2Name)

let lineChart = null
let barChart = null
let doughnutChart = null

const CHART_DEFAULTS = {
  animation: { duration: 400 },
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#888', font: { size: 11 }, boxWidth: 10 },
    },
  },
}

function buildLineData() {
  const r = rounds.value
  let t1 = 0, t2 = 0
  const cumul = r.map((round, i) => {
    t1 += round.finalScores.team1
    t2 += round.finalScores.team2
    return { label: `#${i + 1}`, t1, t2 }
  })

  return {
    labels: cumul.map(c => c.label),
    datasets: [
      {
        label: team1Name.value,
        data: cumul.map(c => c.t1),
        borderColor: '#e63946',
        backgroundColor: 'rgba(230, 57, 70, 0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: '#e63946',
      },
      {
        label: team2Name.value,
        data: cumul.map(c => c.t2),
        borderColor: 'rgba(240,240,240,0.7)',
        backgroundColor: 'rgba(240,240,240,0.04)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: 'rgba(240,240,240,0.7)',
      },
    ],
  }
}

function buildBarData() {
  const allPlayers = [
    ...(store.game?.players.team1 ?? []),
    ...(store.game?.players.team2 ?? []),
  ]
  const counts = Object.fromEntries(allPlayers.map(p => [p, 0]))
  rounds.value.forEach(r => {
    if (r.taker in counts) counts[r.taker]++
  })

  const isTeam1 = p => store.game?.players.team1.includes(p)

  return {
    labels: allPlayers,
    datasets: [{
      label: 'Prises',
      data: allPlayers.map(p => counts[p]),
      backgroundColor: allPlayers.map(p =>
        isTeam1(p) ? 'rgba(230, 57, 70, 0.7)' : 'rgba(240, 240, 240, 0.4)'
      ),
      borderColor: allPlayers.map(p =>
        isTeam1(p) ? '#e63946' : 'rgba(240, 240, 240, 0.6)'
      ),
      borderWidth: 1,
      borderRadius: 5,
    }],
  }
}

function buildDoughnutData() {
  const counts = {}
  rounds.value.forEach(r => {
    counts[r.trump] = (counts[r.trump] ?? 0) + 1
  })

  const entries = Object.entries(counts).filter(([, c]) => c > 0)
  const COLORS = {
    '♥': 'rgba(230, 57, 70, 0.8)',
    '♦': 'rgba(230, 57, 70, 0.5)',
    '♣': 'rgba(180, 180, 180, 0.6)',
    '♠': 'rgba(100, 100, 100, 0.8)',
    'SA': 'rgba(201, 168, 76, 0.7)',
    'TA': 'rgba(69, 123, 157, 0.7)',
  }

  return {
    labels: entries.map(([k]) => k),
    datasets: [{
      data: entries.map(([, v]) => v),
      backgroundColor: entries.map(([k]) => COLORS[k] ?? 'rgba(100,100,100,0.5)'),
      borderColor: '#1a1a1a',
      borderWidth: 2,
      hoverOffset: 4,
    }],
  }
}

function scaleOpts(tickColor = '#555') {
  return {
    x: { ticks: { color: tickColor }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: tickColor }, grid: { color: 'rgba(255,255,255,0.05)' } },
  }
}

function initCharts() {
  if (lineChart) lineChart.destroy()
  if (barChart) barChart.destroy()
  if (doughnutChart) doughnutChart.destroy()

  if (!rounds.value.length) return

  if (lineRef.value) {
    lineChart = new Chart(lineRef.value, {
      type: 'line',
      data: buildLineData(),
      options: {
        ...CHART_DEFAULTS,
        scales: scaleOpts(),
      },
    })
  }

  if (barRef.value) {
    barChart = new Chart(barRef.value, {
      type: 'bar',
      data: buildBarData(),
      options: {
        ...CHART_DEFAULTS,
        plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
        scales: scaleOpts(),
      },
    })
  }

  if (doughnutRef.value) {
    doughnutChart = new Chart(doughnutRef.value, {
      type: 'doughnut',
      data: buildDoughnutData(),
      options: {
        ...CHART_DEFAULTS,
        plugins: {
          ...CHART_DEFAULTS.plugins,
          legend: {
            position: 'right',
            labels: { color: '#888', font: { size: 12 }, boxWidth: 12 },
          },
        },
      },
    })
  }
}

onMounted(initCharts)

watch(() => rounds.value.length, initCharts)

onUnmounted(() => {
  lineChart?.destroy()
  barChart?.destroy()
  doughnutChart?.destroy()
})
</script>

<style scoped>
.charts-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px 0;
  color: var(--text-3);
}

.empty-icon {
  font-size: 40px;
  color: var(--red);
  opacity: 0.4;
}

.empty-state p {
  font-size: 13px;
  text-align: center;
}

.chart-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}

.chart-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 14px;
}

.chart-wrap {
  position: relative;
  height: 200px;
}

.chart-wrap.short {
  height: 160px;
}
</style>
