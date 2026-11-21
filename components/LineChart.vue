<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement,
  CategoryScale, LinearScale, Filler,
} from 'chart.js'
import { computed } from 'vue';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler)

const props = defineProps<{
  labels: string[]
  series: { label: string; data: number[]; color: string }[]
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.series.map((s) => ({
    label: s.label,
    data: s.data,
    borderColor: s.color,
    backgroundColor: s.color + '22',
    fill: true,
    tension: 0.35,
    pointRadius: 2,
    pointHoverRadius: 4,
    borderWidth: 2,
  })),
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: {
      display: true,
      labels: { color: 'rgba(243,239,230,0.7)', font: { family: 'IBM Plex Mono', size: 10 }, boxWidth: 10 },
    },
    tooltip: {
      backgroundColor: '#12181f',
      titleColor: '#f3efe6',
      bodyColor: '#f3efe6',
      borderColor: 'rgba(243,239,230,0.15)',
      borderWidth: 1,
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(243,239,230,0.06)' },
      ticks: { color: 'rgba(243,239,230,0.55)', font: { family: 'IBM Plex Mono', size: 10 } },
    },
    y: {
      grid: { color: 'rgba(243,239,230,0.06)' },
      ticks: { color: 'rgba(243,239,230,0.55)', font: { family: 'IBM Plex Mono', size: 10 } },
    },
  },
}
</script>

<template>
  <Line :data="chartData" :options="chartOptions" />
</template>
