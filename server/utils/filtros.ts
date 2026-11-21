import type { H3Event } from 'h3'
import { getQuery } from 'h3'

export interface FiltrosSiniestros {
  desde?: string
  hasta?: string
  coberturaIds: number[]
  zonaIds: number[]
}

export function parseFiltros(event: H3Event): FiltrosSiniestros {
  const q = getQuery(event)
  const toIds = (v: unknown): number[] => {
    if (!v) return []
    const arr = Array.isArray(v) ? v : String(v).split(',')
    return arr.map((x) => Number(x)).filter((n) => !Number.isNaN(n))
  }
  return {
    desde: q.desde ? String(q.desde) : undefined,
    hasta: q.hasta ? String(q.hasta) : undefined,
    coberturaIds: toIds(q.coberturas),
    zonaIds: toIds(q.zonas),
  }
}

// Construye la cláusula WHERE y el array de parámetros a partir de los filtros.
export function buildWhere(f: FiltrosSiniestros) {
  const clauses: string[] = []
  const params: any[] = []

  if (f.desde) {
    params.push(f.desde)
    clauses.push(`fecha_ocurrencia >= $${params.length}::date`)
  }
  if (f.hasta) {
    params.push(f.hasta)
    clauses.push(`fecha_ocurrencia <= $${params.length}::date`)
  }
  if (f.coberturaIds.length) {
    params.push(f.coberturaIds)
    clauses.push(`cobertura_id = ANY($${params.length}::int[])`)
  }
  if (f.zonaIds.length) {
    params.push(f.zonaIds)
    clauses.push(`zona_id = ANY($${params.length}::int[])`)
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  return { where, params }
}
