<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  coberturas: string[]
  zonas: string[]
  celdas: { cobertura: string; zona: string; cantidad: number; costoPromedio: number | null }[]
}>()

const max = computed(() => Math.max(1, ...props.celdas.map((c) => c.cantidad)))

function valor(cobertura: string, zona: string) {
  return props.celdas.find((c) => c.cobertura === cobertura && c.zona === zona)
}

function intensidad(cantidad: number) {
  return Math.max(0.06, cantidad / max.value)
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-left">
      <thead>
        <tr>
          <th class="font-mono text-[10px] uppercase tracking-wider text-paper/40 p-2 sticky left-0 bg-inksoft"></th>
          <th
            v-for="z in zonas"
            :key="z"
            class="font-mono text-[10px] uppercase tracking-wider text-paper/40 p-2 whitespace-nowrap font-normal"
          >
            {{ z }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in coberturas" :key="c">
          <td class="font-mono text-[11px] text-paper/60 p-2 whitespace-nowrap sticky left-0 bg-inksoft">{{ c }}</td>
          <td v-for="z in zonas" :key="z" class="p-1">
            <div
              v-if="valor(c, z)"
              class="w-14 h-10 flex items-center justify-center font-mono text-[11px] text-paper rounded-sm"
              :style="{ backgroundColor: `rgba(193, 98, 45, ${intensidad(valor(c, z)!.cantidad)})` }"
              :title="`${c} · ${z}: ${valor(c, z)!.cantidad} siniestros`"
            >
              {{ valor(c, z)!.cantidad }}
            </div>
            <div v-else class="w-14 h-10 flex items-center justify-center text-paper/15 font-mono text-[11px]">—</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
