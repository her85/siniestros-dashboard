// Genera datos de ejemplo para poder ver el dashboard funcionando de inmediato.
// Uso: DATABASE_URL=postgresql://... node server/db/seed.mjs
import pg from 'pg'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const connectionString = process.env.DATABASE_URL // || 'postgresql://postgres:postgres@localhost:5432/siniestros'
const pool = new pg.Pool({ connectionString }) // usado solo para aplicar el DDL crudo de schema.sql
const prisma = new PrismaClient()

const COBERTURAS = ['Responsabilidad Civil', 'Daños Propios', 'Robo', 'Incendio', 'Cristales', 'Granizo', 'Asistencia Vial']
const ZONAS = [
  { nombre: 'CABA', region: 'AMBA' },
  { nombre: 'GBA Norte', region: 'AMBA' },
  { nombre: 'GBA Sur', region: 'AMBA' },
  { nombre: 'GBA Oeste', region: 'AMBA' },
  { nombre: 'Córdoba', region: 'Centro' },
  { nombre: 'Santa Fe', region: 'Centro' },
  { nombre: 'Mendoza', region: 'Cuyo' },
  { nombre: 'Neuquén', region: 'Patagonia' },
  { nombre: 'Tucumán', region: 'NOA' },
  { nombre: 'Misiones', region: 'NEA' },
]

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick(arr) { return arr[randInt(0, arr.length - 1)] }
function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d }
function fmt(d) { return d.toISOString().slice(0, 10) }

// Costos base y variabilidad por cobertura (para que el dashboard muestre diferencias reales)
const COSTO_BASE = {
  'Responsabilidad Civil': 900000,
  'Daños Propios': 650000,
  'Robo': 1800000,
  'Incendio': 3200000,
  'Cristales': 120000,
  'Granizo': 480000,
  'Asistencia Vial': 60000,
}
// Tiempo de resolución típico (días) por cobertura
const DIAS_BASE = {
  'Responsabilidad Civil': 45,
  'Daños Propios': 18,
  'Robo': 30,
  'Incendio': 60,
  'Cristales': 5,
  'Granizo': 22,
  'Asistencia Vial': 3,
}

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8')
  await pool.query(schema)
  await pool.end()

  await prisma.siniestro.deleteMany()
  await prisma.cobertura.deleteMany()
  await prisma.zona.deleteMany()

  const coberturaIds = {}
  for (const nombre of COBERTURAS) {
    const r = await prisma.cobertura.create({ data: { nombre } })
    coberturaIds[nombre] = r.id
  }

  const zonaIds = {}
  for (const z of ZONAS) {
    const r = await prisma.zona.create({ data: { nombre: z.nombre, region: z.region } })
    zonaIds[z.nombre] = r.id
  }

  const hoy = new Date()
  const inicio = addDays(hoy, -365)
  const N = 2400
  const rows = []

  for (let i = 0; i < N; i++) {
    const cobertura = pick(COBERTURAS)
    const zona = pick(ZONAS).nombre
    const diasDesdeInicio = randInt(0, 365)
    const fechaOcurrencia = addDays(inicio, diasDesdeInicio)
    const fechaApertura = addDays(fechaOcurrencia, randInt(0, 3))

    const diasResolucionBase = DIAS_BASE[cobertura]
    const diasResolucion = Math.max(1, Math.round(diasResolucionBase * (0.5 + Math.random())))
    const seCierra = fechaApertura < addDays(hoy, -diasResolucion) && Math.random() < 0.88
    const estado = seCierra ? (Math.random() < 0.08 ? 'rechazado' : 'cerrado') : 'abierto'
    const fechaCierre = estado !== 'abierto' ? addDays(fechaApertura, diasResolucion) : null

    const costoBase = COSTO_BASE[cobertura]
    const costoEstimado = Math.round(costoBase * (0.6 + Math.random() * 0.8))
    const costoFinal = estado === 'cerrado' ? Math.round(costoEstimado * (0.75 + Math.random() * 0.5)) : (estado === 'rechazado' ? 0 : null)

    const numero = `SIN-${fmt(fechaOcurrencia).replace(/-/g, '')}-${String(i).padStart(5, '0')}`

    rows.push({
      numeroSiniestro: numero,
      coberturaId: coberturaIds[cobertura],
      zonaId: zonaIds[zona],
      fechaOcurrencia,
      fechaApertura,
      fechaCierre,
      estado,
      costoEstimado,
      costoFinal,
    })
  }

  await prisma.siniestro.createMany({ data: rows })

  console.log(`Seed completo: ${rows.length} siniestros, ${COBERTURAS.length} coberturas, ${ZONAS.length} zonas.`)
  await prisma.$disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await prisma.$disconnect()
  process.exit(1)
})
