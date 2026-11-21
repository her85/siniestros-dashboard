# Dashboard de KPIs de Siniestros

Aplicación Nuxt 3 + PostgreSQL para visualizar tiempos de resolución, costos promedio y frecuencia de siniestros, segmentados por cobertura y zona geográfica.

## Stack

- **Nuxt 3** (Vue 3, server API routes con Nitro)
- **PostgreSQL** (vía `pg`)
- **Chart.js / vue-chartjs** para las visualizaciones
- **Tailwind CSS** para estilos

## KPIs incluidos

- Siniestros totales, abiertos, cerrados, rechazados
- Tiempo de resolución promedio y mediana (días entre apertura y cierre)
- Costo promedio y costo total de siniestros cerrados
- Tasa de resolución
- Evolución mensual (frecuencia y tiempo de resolución)
- Frecuencia, tiempo de resolución y costo promedio **por cobertura**
- Frecuencia y costo promedio **por zona geográfica**
- Matriz cruzada cobertura × zona (heatmap)

Todos los KPIs son filtrables por rango de fechas, cobertura y zona desde el panel lateral.
El rango utiliza la fecha de ocurrencia e incluye ambos extremos; «Limpiar» restablece todos los filtros.

## 1. Configurar PostgreSQL

Creá una base de datos y copiá `.env.example` a `.env`:

```bash
cp .env.example .env
```

Editá `DATABASE_URL` con tus credenciales, por ejemplo:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/siniestros
```

## 2. Instalar dependencias

```bash
npm install
```

## 3. Crear el esquema y cargar datos de ejemplo

El script de seed crea las tablas (`coberturas`, `zonas`, `siniestros`) y genera ~2400 siniestros de ejemplo distribuidos en el último año, con costos y tiempos de resolución realistas por tipo de cobertura.

```bash
npm run db:seed
```

> Para conectar tu propia fuente de datos reales, simplemente apuntá `DATABASE_URL` a tu base y saltá el seed — el schema en `server/db/schema.sql` documenta la estructura esperada. También podés adaptar las queries en `server/api/kpis/*` a tu modelo de datos existente (por ejemplo, si ya tenés una tabla de siniestros con otros nombres de columna).

## 4. Levantar el proyecto

```bash
npm run dev
```

Abrí `http://localhost:3000`.

## Estructura del proyecto

```
server/
  db/
    schema.sql          # DDL de las tablas
    seed.mjs             # generador de datos de ejemplo
  utils/
    db.ts                # pool de conexión a PostgreSQL
    filtros.ts            # parseo de filtros (fecha, cobertura, zona) desde query params
  api/
    filtros.get.ts                 # coberturas, zonas y rango de fechas disponibles
    kpis/
      resumen.get.ts               # KPIs agregados (tarjetas superiores)
      por-cobertura.get.ts         # frecuencia / tiempos / costos por cobertura
      por-zona.get.ts              # frecuencia / tiempos / costos por zona
      serie-temporal.get.ts        # evolución mensual
      matriz.get.ts                # cruce cobertura x zona
pages/
  index.vue              # dashboard principal
components/
  FiltrosPanel.vue        # filtros de fecha / cobertura / zona
  KpiCard.vue              # tarjeta de KPI individual
  BarChart.vue             # gráfico de barras (frecuencia, tiempos, costos)
  LineChart.vue            # serie temporal
  HeatMatrix.vue            # heatmap cobertura x zona
composables/
  useSiniestros.ts          # helpers de formato y armado de query params
```

## Adaptar a datos reales

Si ya tenés un sistema de siniestros, lo más simple es:

1. Reemplazar `server/db/schema.sql` por una vista (`CREATE VIEW`) que exponga las columnas que usan las queries: `cobertura_id`/nombre, `zona_id`/nombre, `fecha_apertura`, `fecha_cierre`, `estado`, `costo_final`.
2. O ajustar directamente los `SELECT` en `server/api/kpis/*.get.ts` a tus nombres de tabla/columna reales.

## Producción

```bash
npm run build
node .output/server/index.mjs
```

Asegurate de definir `DATABASE_URL` en el entorno de producción (Docker, Vercel, Railway, un VPS, etc.).
