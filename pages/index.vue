<script setup lang="ts">
import { useFetch } from 'nuxt/app'
import { computed, ref, watch } from 'vue'
import { formatMoneda, formatDias, formatNumero, filtrosToQuery, type Filtros } from '~/composables/useSiniestros'

const filtros = ref<Filtros>({ desde: undefined, hasta: undefined, coberturas: [], zonas: [] })

const { data: opciones } = await useFetch('/api/filtros')

const query = computed(() => filtrosToQuery(filtros.value))

const { data: resumen, refresh: refreshResumen } = await useFetch('/api/kpis/resumen', { query })
const { data: porCobertura, refresh: refreshCobertura } = await useFetch('/api/kpis/por-cobertura', { query })
const { data: porZona, refresh: refreshZona } = await useFetch('/api/kpis/por-zona', { query })
const { data: serie, refresh: refreshSerie } = await useFetch('/api/kpis/serie-temporal', { query })
const { data: matriz, refresh: refreshMatriz } = await useFetch('/api/kpis/matriz', { query })

watch(filtros, () => {
  refreshResumen()
  refreshCobertura()
  refreshZona()
  refreshSerie()
  refreshMatriz()
}, { deep: true })

const coberturasLabels = computed(() => (porCobertura.value || []).map((c) => c.cobertura))
const coberturasTiempos = computed(() => (porCobertura.value || []).map((c) => c.tiempoResolucionPromedio ?? 0))
const coberturasCostos = computed(() => (porCobertura.value || []).map((c) => c.costoPromedio ?? 0))
const coberturasFrecuencia = computed(() => (porCobertura.value || []).map((c) => c.cantidad))

const zonasLabels = computed(() => (porZona.value || []).map((z) => z.zona))
const zonasFrecuencia = computed(() => (porZona.value || []).map((z) => z.cantidad))
const zonasCostos = computed(() => (porZona.value || []).map((z) => z.costoPromedio ?? 0))

const serieLabels = computed(() => (serie.value || []).map((s) => s.mes))
const serieFrecuencia = computed(() => (serie.value || []).map((s) => s.cantidad))
const serieTiempos = computed(() => (serie.value || []).map((s) => s.tiempoResolucionPromedio ?? 0))

const tasaResolucion = computed(() => {
  const r = resumen.value
  if (!r || !r.totalSiniestros) return null
  return ((r.cerrados / r.totalSiniestros) * 100).toFixed(1)
})
</script>

<template>
  <div class="min-h-screen bg-ink text-paper">
    <!-- Encabezado -->
    <header class="border-b border-[var(--line)] px-6 md:px-10 py-6 flex flex-col md:flex-row md:items-end justify-between gap-3">
      <div>
        <span class="font-mono text-[11px] uppercase tracking-[0.2em] text-rust">Registro de Siniestros</span>
        <h1 class="font-display text-4xl md:text-5xl mt-1">Panel de KPIs</h1>
      </div>
      <div class="font-mono text-xs text-paper/40">
        Periodo de datos: {{ opciones?.rango?.desde || '—' }} → {{ opciones?.rango?.hasta || '—' }}
      </div>
    </header>

    <div class="px-6 md:px-10 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
      <FiltrosPanel
        v-if="opciones"
        v-model="filtros"
        :coberturas="opciones.coberturas"
        :zonas="opciones.zonas"
      />

      <main class="flex flex-col gap-8 min-w-0">
        <!-- Tarjetas KPI -->
        <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            etiqueta="Siniestros totales"
            :valor="formatNumero(resumen?.totalSiniestros)"
            :detalle="`${resumen?.abiertos ?? 0} abiertos · ${resumen?.cerrados ?? 0} cerrados`"
            acento="rust"
          />
          <KpiCard
            etiqueta="Tiempo de resolución"
            :valor="formatDias(resumen?.tiempoResolucionPromedio)"
            :detalle="`Mediana: ${formatDias(resumen?.tiempoResolucionMediana)}`"
            acento="teal"
          />
          <KpiCard
            etiqueta="Costo promedio"
            :valor="formatMoneda(resumen?.costoPromedio)"
            :detalle="`Total: ${formatMoneda(resumen?.costoTotal)}`"
            acento="rust"
          />
          <KpiCard
            etiqueta="Tasa de resolución"
            :valor="tasaResolucion ? `${tasaResolucion}%` : '—'"
            :detalle="`${resumen?.rechazados ?? 0} rechazados`"
            acento="alert"
          />
        </section>

        <!-- Serie temporal -->
        <section class="border border-[var(--line)] bg-inksoft/40 p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-display text-xl">Evolución mensual</h2>
            <span class="font-mono text-[10px] uppercase tracking-wider text-paper/40">Frecuencia y tiempo de resolución</span>
          </div>
          <div class="h-72">
            <LineChart
              :labels="serieLabels"
              :series="[
                { label: 'Siniestros / mes', data: serieFrecuencia, color: '#c1622d' },
                { label: 'Días de resolución (prom.)', data: serieTiempos, color: '#2e6e62' },
              ]"
            />
          </div>
        </section>

        <!-- Por cobertura -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="border border-[var(--line)] bg-inksoft/40 p-5">
            <h3 class="font-display text-lg mb-4">Frecuencia por cobertura</h3>
            <div class="h-64">
              <BarChart :labels="coberturasLabels" :data="coberturasFrecuencia" color="#c1622d" suffix=" siniestros" />
            </div>
          </div>
          <div class="border border-[var(--line)] bg-inksoft/40 p-5">
            <h3 class="font-display text-lg mb-4">Tiempo de resolución por cobertura</h3>
            <div class="h-64">
              <BarChart :labels="coberturasLabels" :data="coberturasTiempos" color="#2e6e62" suffix=" días" />
            </div>
          </div>
          <div class="border border-[var(--line)] bg-inksoft/40 p-5">
            <h3 class="font-display text-lg mb-4">Costo promedio por cobertura</h3>
            <div class="h-64">
              <BarChart :labels="coberturasLabels" :data="coberturasCostos" color="#b33f3f" />
            </div>
          </div>
        </section>

        <!-- Por zona -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border border-[var(--line)] bg-inksoft/40 p-5">
            <h3 class="font-display text-lg mb-4">Frecuencia por zona geográfica</h3>
            <div class="h-80">
              <BarChart :labels="zonasLabels" :data="zonasFrecuencia" color="#c1622d" horizontal suffix=" siniestros" />
            </div>
          </div>
          <div class="border border-[var(--line)] bg-inksoft/40 p-5">
            <h3 class="font-display text-lg mb-4">Costo promedio por zona</h3>
            <div class="h-80">
              <BarChart :labels="zonasLabels" :data="zonasCostos" color="#b33f3f" horizontal />
            </div>
          </div>
        </section>

        <!-- Matriz cobertura x zona -->
        <section class="border border-[var(--line)] bg-inksoft/40 p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-display text-xl">Cobertura × Zona</h2>
            <span class="font-mono text-[10px] uppercase tracking-wider text-paper/40">Cantidad de siniestros</span>
          </div>
          <HeatMatrix
            v-if="opciones"
            :coberturas="opciones.coberturas.map((c) => c.nombre)"
            :zonas="opciones.zonas.map((z) => z.nombre)"
            :celdas="matriz || []"
          />
        </section>
      </main>
    </div>
  </div>
</template>
