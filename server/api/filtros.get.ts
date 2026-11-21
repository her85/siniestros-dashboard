import { getPrisma } from '../utils/db'

export default defineEventHandler(async () => {
  const prisma = getPrisma()
  const [coberturas, zonas, rango] = await Promise.all([
    prisma.cobertura.findMany({ select: { id: true, nombre: true }, orderBy: { nombre: 'asc' } }),
    prisma.zona.findMany({ select: { id: true, nombre: true, region: true }, orderBy: { nombre: 'asc' } }),
    prisma.siniestro.aggregate({ _min: { fechaOcurrencia: true }, _max: { fechaOcurrencia: true } }),
  ])
  return {
    coberturas,
    zonas,
    rango: { desde: rango._min.fechaOcurrencia, hasta: rango._max.fechaOcurrencia },
  }
})
