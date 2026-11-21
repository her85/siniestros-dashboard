<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement,
  CategoryScale, LinearScale,
} from 'chart.js'
import { computed } from 'vue';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  labels: string[]
  data: number[]
  color?: string
  suffix?: string
  horizontal?: boolean
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: props.color || '#c1622d',
      borderRadius: 3,
      barThickness: props.horizontal ? 14 : 20,
    },
  ],
}))

const chartOptions = computed(() => ({
  indexAxis: props.horizontal ? 'y' as const : 'x' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#12181f',
      titleColor: '#f3efe6',
      bodyColor: '#f3efe6',
      borderColor: 'rgba(243,239,230,0.15)',
      borderWidth: 1,
      padding: 10,
      callbacks: {
        label: (ctx: any) => `${ctx.formattedValue}${props.suffix || ''}`,
      },
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
}))
</script>

<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>
