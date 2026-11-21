import { query } from '../../utils/db'
import { parseFiltros, buildWhere } from '../../utils/filtros'

export default defineEventHandler(async (event) => {
  const f = parseFiltros(event)
  const { where, params } = buildWhere(f)

  const rows = await query(
    `
    SELECT
      COUNT(*) AS total_siniestros,
      COUNT(*) FILTER (WHERE estado = 'abierto') AS abiertos,
      COUNT(*) FILTER (WHERE estado = 'cerrado') AS cerrados,
      COUNT(*) FILTER (WHERE estado = 'rechazado') AS rechazados,
      AVG(fecha_cierre - fecha_apertura) FILTER (WHERE estado = 'cerrado') AS tiempo_resolucion_prom,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (fecha_cierre - fecha_apertura)) FILTER (WHERE estado = 'cerrado') AS tiempo_resolucion_mediana,
      AVG(costo_final) FILTER (WHERE estado = 'cerrado') AS costo_promedio,
      SUM(costo_final) FILTER (WHERE estado = 'cerrado') AS costo_total
    FROM siniestros
    ${where}
    `,
    params
  )

  // Frecuencia: siniestros por día en el rango filtrado (para tasa diaria)
  const rango = await query(
    `SELECT MIN(fecha_ocurrencia) AS desde, MAX(fecha_ocurrencia) AS hasta FROM siniestros ${where}`,
    params
  )

  const r = rows[0] || {}
  const rr = rango[0] || {}
  let frecuenciaDiaria = null
  if (rr.desde && rr.hasta) {
    const dias = Math.max(1, (new Date(rr.hasta).getTime() - new Date(rr.desde).getTime()) / 86400000)
    frecuenciaDiaria = Number(r.total_siniestros) / dias
  }

  return {
    totalSiniestros: Number(r.total_siniestros || 0),
    abiertos: Number(r.abiertos || 0),
    cerrados: Number(r.cerrados || 0),
    rechazados: Number(r.rechazados || 0),
    tiempoResolucionPromedio: r.tiempo_resolucion_prom ? Number(r.tiempo_resolucion_prom) : null,
    tiempoResolucionMediana: r.tiempo_resolucion_mediana ? Number(r.tiempo_resolucion_mediana) : null,
    costoPromedio: r.costo_promedio ? Number(r.costo_promedio) : null,
    costoTotal: r.costo_total ? Number(r.costo_total) : 0,
    frecuenciaDiaria,
  }
})
