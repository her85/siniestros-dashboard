<script setup lang="ts">
const props = defineProps<{
  coberturas: { id: number; nombre: string }[]
  zonas: { id: number; nombre: string; region: string }[]
  modelValue: { desde?: string; hasta?: string; coberturas: number[]; zonas: number[] }
}>()

const emit = defineEmits(['update:modelValue'])

const inputDesde = ref<HTMLInputElement | null>(null)
const inputHasta = ref<HTMLInputElement | null>(null)
const errorFecha = ref('')

function toggle(list: number[], id: number) {
  const i = list.indexOf(id)
  const next = [...list]
  if (i === -1) next.push(id)
  else next.splice(i, 1)
  return next
}

function toggleCobertura(id: number) {
  emit('update:modelValue', { ...props.modelValue, coberturas: toggle(props.modelValue.coberturas, id) })
}
function toggleZona(id: number) {
  emit('update:modelValue', { ...props.modelValue, zonas: toggle(props.modelValue.zonas, id) })
}
function setFecha(campo: 'desde' | 'hasta', event: Event) {
  const input = event.target as HTMLInputElement
  const valor = input.value
  if (!input.validity.valid || (valor && !/^\d{4}-\d{2}-\d{2}$/.test(valor))) {
    errorFecha.value = 'Ingresá una fecha válida con un año de cuatro dígitos.'
    input.value = props.modelValue[campo] || ''
    return
  }
  const otraFecha = props.modelValue[campo === 'desde' ? 'hasta' : 'desde']
  if (valor && otraFecha && (campo === 'desde' ? valor > otraFecha : valor < otraFecha)) {
    errorFecha.value = 'La fecha desde no puede ser posterior a la fecha hasta.'
    input.value = props.modelValue[campo] || ''
    return
  }
  errorFecha.value = ''
  emit('update:modelValue', { ...props.modelValue, [campo]: valor || undefined })
}
function limpiar() {
  if (inputDesde.value) inputDesde.value.value = ''
  if (inputHasta.value) inputHasta.value.value = ''
  errorFecha.value = ''
  emit('update:modelValue', { desde: undefined, hasta: undefined, coberturas: [], zonas: [] })
}
</script>

<template>
  <aside class="border border-[var(--line)] bg-inksoft/40 p-5 flex flex-col gap-6 h-fit">
    <div class="flex items-center justify-between">
      <h2 class="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/50">Filtros</h2>
      <button class="font-mono text-[10px] uppercase tracking-wider text-rust hover:text-paper transition-colors" @click="limpiar">
        Limpiar
      </button>
    </div>

    <div class="flex flex-col gap-2">
      <span class="font-mono text-[10px] uppercase tracking-wider text-paper/40">Rango de fechas</span>
      <div class="flex flex-col gap-2">
        <label class="flex flex-col gap-1 font-mono text-xs text-paper/60">
          Desde
          <input
            ref="inputDesde"
            type="date"
            min="0001-01-01"
            max="9999-12-31"
            class="bg-ink border border-[var(--line)] text-paper font-mono text-xs px-2 py-1.5 focus:outline-none focus:border-rust [color-scheme:dark]"
            :value="modelValue.desde || ''"
            :aria-describedby="errorFecha ? 'error-fecha' : undefined"
            @change="setFecha('desde', $event)"
          />
        </label>
        <label class="flex flex-col gap-1 font-mono text-xs text-paper/60">
          Hasta
          <input
            ref="inputHasta"
            type="date"
            min="0001-01-01"
            max="9999-12-31"
            class="bg-ink border border-[var(--line)] text-paper font-mono text-xs px-2 py-1.5 focus:outline-none focus:border-rust [color-scheme:dark]"
            :value="modelValue.hasta || ''"
            :aria-describedby="errorFecha ? 'error-fecha' : undefined"
            @change="setFecha('hasta', $event)"
          />
        </label>
        <p v-if="errorFecha" id="error-fecha" role="alert" class="text-xs text-paper">
          {{ errorFecha }}
        </p>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <span class="font-mono text-[10px] uppercase tracking-wider text-paper/40">Cobertura</span>
      <div class="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
        <label
          v-for="c in coberturas"
          :key="c.id"
          class="flex items-center gap-2 text-sm text-paper/75 cursor-pointer hover:text-paper"
        >
          <input
            type="checkbox"
            class="accent-rust"
            :checked="modelValue.coberturas.includes(c.id)"
            @change="toggleCobertura(c.id)"
          />
          {{ c.nombre }}
        </label>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <span class="font-mono text-[10px] uppercase tracking-wider text-paper/40">Zona geográfica</span>
      <div class="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
        <label
          v-for="z in zonas"
          :key="z.id"
          class="flex items-center gap-2 text-sm text-paper/75 cursor-pointer hover:text-paper"
        >
          <input
            type="checkbox"
            class="accent-rust"
            :checked="modelValue.zonas.includes(z.id)"
            @change="toggleZona(z.id)"
          />
          {{ z.nombre }}
          <span class="text-paper/30 text-xs">{{ z.region }}</span>
        </label>
      </div>
    </div>
  </aside>
</template>
