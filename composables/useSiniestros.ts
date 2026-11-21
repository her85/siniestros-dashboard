export interface Filtros {
  desde?: string
  hasta?: string
  coberturas: number[]
  zonas: number[]
}

export function filtrosToQuery(f: Filtros) {
  const q: Record<string, string> = {}
  if (f.desde) q.desde = f.desde
  if (f.hasta) q.hasta = f.hasta
  if (f.coberturas.length) q.coberturas = f.coberturas.join(',')
  if (f.zonas.length) q.zonas = f.zonas.join(',')
  return q
}

export function formatMoneda(v: number | null | undefined) {
  if (v === null || v === undefined) return '—'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(v)
}

export function formatDias(v: number | null | undefined) {
  if (v === null || v === undefined) return '—'
  return `${v.toFixed(1)} días`
}

export function formatNumero(v: number | null | undefined) {
  if (v === null || v === undefined) return '—'
  return new Intl.NumberFormat('es-AR').format(v)
}
