import { query } from '../../utils/db'
import { parseFiltros, buildWhere } from '../../utils/filtros'

export default defineEventHandler(async (event) => {
  const f = parseFiltros(event)
  const { where, params } = buildWhere(f)

  const rows = await query(
    `
    SELECT
      c.nombre AS cobertura,
      z.nombre AS zona,
      COUNT(s.*) AS cantidad,
      AVG(s.costo_final) FILTER (WHERE s.estado = 'cerrado') AS costo_promedio
    FROM siniestros s
    JOIN coberturas c ON c.id = s.cobertura_id
    JOIN zonas z ON z.id = s.zona_id
    ${where}
    GROUP BY c.nombre, z.nombre
    `,
    params
  )

  return rows.map((r: any) => ({
    cobertura: r.cobertura,
    zona: r.zona,
    cantidad: Number(r.cantidad),
    costoPromedio: r.costo_promedio ? Number(r.costo_promedio) : null,
  }))
})
