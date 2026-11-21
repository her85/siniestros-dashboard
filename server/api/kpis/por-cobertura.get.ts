import { query } from '../../utils/db'
import { parseFiltros, buildWhere } from '../../utils/filtros'

export default defineEventHandler(async (event) => {
  const f = parseFiltros(event)
  const { where, params } = buildWhere(f)

  const rows = await query(
    `
    SELECT
      c.nombre AS cobertura,
      COUNT(s.*) AS cantidad,
      AVG(s.fecha_cierre - s.fecha_apertura) FILTER (WHERE s.estado = 'cerrado') AS tiempo_resolucion_prom,
      AVG(s.costo_final) FILTER (WHERE s.estado = 'cerrado') AS costo_promedio,
      SUM(s.costo_final) FILTER (WHERE s.estado = 'cerrado') AS costo_total
    FROM siniestros s
    JOIN coberturas c ON c.id = s.cobertura_id
    ${where}
    GROUP BY c.nombre
    ORDER BY cantidad DESC
    `,
    params
  )

  return rows.map((r: any) => ({
    cobertura: r.cobertura,
    cantidad: Number(r.cantidad),
    tiempoResolucionPromedio: r.tiempo_resolucion_prom ? Number(r.tiempo_resolucion_prom) : null,
    costoPromedio: r.costo_promedio ? Number(r.costo_promedio) : null,
    costoTotal: r.costo_total ? Number(r.costo_total) : 0,
  }))
})
