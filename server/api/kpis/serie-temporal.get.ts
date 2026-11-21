import { query } from '../../utils/db'
import { parseFiltros, buildWhere } from '../../utils/filtros'

export default defineEventHandler(async (event) => {
  const f = parseFiltros(event)
  const { where, params } = buildWhere(f)

  const rows = await query(
    `
    SELECT
      TO_CHAR(DATE_TRUNC('month', fecha_ocurrencia), 'YYYY-MM') AS mes,
      COUNT(*) AS cantidad,
      AVG(fecha_cierre - fecha_apertura) FILTER (WHERE estado = 'cerrado') AS tiempo_resolucion_prom,
      AVG(costo_final) FILTER (WHERE estado = 'cerrado') AS costo_promedio
    FROM siniestros
    ${where}
    GROUP BY 1
    ORDER BY 1
    `,
    params
  )

  return rows.map((r: any) => ({
    mes: r.mes,
    cantidad: Number(r.cantidad),
    tiempoResolucionPromedio: r.tiempo_resolucion_prom ? Number(r.tiempo_resolucion_prom) : null,
    costoPromedio: r.costo_promedio ? Number(r.costo_promedio) : null,
  }))
})
