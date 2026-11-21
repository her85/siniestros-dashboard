<script setup lang="ts">
defineProps<{
  etiqueta: string
  valor: string
  detalle?: string
  acento?: 'rust' | 'teal' | 'alert'
}>()
</script>

<template>
  <div class="relative border border-[var(--line)] bg-inksoft/60 p-5 flex flex-col gap-2 min-w-0">
    <span
      class="absolute top-0 left-0 h-full w-[3px]"
      :class="{
        'bg-rust': acento === 'rust' || !acento,
        'bg-teal': acento === 'teal',
        'bg-alert': acento === 'alert',
      }"
    />
    <span class="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/50">{{ etiqueta }}</span>
    <span class="font-display text-3xl leading-none text-paper truncate">{{ valor }}</span>
    <span v-if="detalle" class="font-mono text-[11px] text-paper/40">{{ detalle }}</span>
  </div>
</template>
