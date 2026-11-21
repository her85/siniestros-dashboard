# Dashboard de KPIs de Siniestros

Proyecto de portfolio que propone un tablero de seguimiento para analizar la gestión de siniestros de seguros. Combina una definición funcional de indicadores con una implementación interactiva en Nuxt y PostgreSQL.

## Contexto y necesidad

El seguimiento de siniestros requiere consultar información sobre volumen, tiempos de resolución y costos. Este tablero reúne esos indicadores en una vista y permite segmentarlos para facilitar el análisis por cobertura y zona geográfica.

## Objetivo

Brindar una herramienta de consulta que permita identificar tendencias y comparar la frecuencia, los tiempos de resolución y los costos de los siniestros.

**Usuarios destinatarios:** equipos de siniestros, analistas de negocio y responsables de gestión que necesiten consultar indicadores consolidados.

## Alcance funcional

El tablero permite:

- Consultar un resumen de siniestros, tiempos de resolución, costos y tasa de resolución.
- Analizar la evolución mensual de la cantidad de siniestros y el tiempo promedio de resolución.
- Comparar frecuencia, tiempo promedio y costo promedio por cobertura.
- Comparar frecuencia y costo promedio por zona geográfica.
- Visualizar la cantidad de siniestros en una matriz de cobertura y zona.
- Filtrar los indicadores por fecha de ocurrencia, una o varias coberturas y una o varias zonas.
- Restablecer todos los filtros mediante la opción **Limpiar**.

El proyecto utiliza datos de ejemplo y está orientado a la consulta; no incluye funciones para registrar o modificar siniestros.

## Indicadores y criterios de cálculo

| Indicador | Criterio |
| --- | --- |
| Total de siniestros | Cantidad de registros que cumplen los filtros seleccionados. |
| Abiertos, cerrados y rechazados | Cantidad de registros por estado dentro del conjunto filtrado. |
| Tiempo de resolución | Días entre la fecha de apertura y la fecha de cierre de los siniestros cerrados. Se muestran el promedio y la mediana. |
| Costo promedio y total | Promedio y suma del costo final de los siniestros cerrados. |
| Tasa de resolución | Siniestros cerrados / total de siniestros filtrados × 100. |
| Evolución mensual | Cantidad de siniestros y tiempo promedio de resolución, agrupados por mes de ocurrencia. |
| Matriz cobertura × zona | Cantidad de siniestros para cada combinación de cobertura y zona. |

Las fechas **Desde** y **Hasta** se aplican sobre la fecha de ocurrencia e incluyen ambos extremos. Es posible utilizar un solo límite; si se indican ambos, la fecha inicial no puede ser posterior a la final. Los filtros de fecha, cobertura y zona se combinan entre sí.

Los valores monetarios se presentan en pesos argentinos (ARS). Los datos generados son ficticios y no representan indicadores reales de una aseguradora.

## Escenarios de uso

1. **Analizar un período:** seleccionar las fechas Desde y Hasta para consultar los indicadores de los siniestros ocurridos en ese intervalo.
2. **Comparar coberturas:** seleccionar una o varias coberturas y observar su frecuencia, tiempo de resolución y costo promedio.
3. **Analizar una zona:** seleccionar una o varias zonas y revisar su participación en los indicadores y en la matriz.
4. **Volver a la vista general:** seleccionar **Limpiar** para quitar las fechas, coberturas y zonas elegidas.

## Tecnologías

- **Nuxt 3 y Vue 3:** interfaz y rutas de API.
- **PostgreSQL y Prisma:** persistencia y consultas de datos. El seed también utiliza `pg` para aplicar el esquema SQL.
- **Chart.js y vue-chartjs:** visualizaciones.
- **Tailwind CSS:** estilos.

## Ejecución local

### 1. Configurar la base de datos

Creá una base PostgreSQL y copiá `.env.example` a `.env`:

```bash
cp .env.example .env
```

Configurá `DATABASE_URL` en `.env` con la conexión a tu base. Por ejemplo, para una base local:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/siniestros
```

No publiques `.env` ni credenciales reales. Para una base alojada, usá la URL y los parámetros de conexión provistos por el servicio.

### 2. Instalar dependencias

```bash
npm install
```

### 3. Cargar datos de ejemplo

```bash
npm run db:seed
```

El seed crea las tablas si no existen y genera aproximadamente 2.400 siniestros ficticios. **Antes de cargarlos, elimina los registros existentes de siniestros, coberturas y zonas.** Ejecutalo únicamente en una base de pruebas.

### 4. Iniciar el tablero

```bash
npm run dev
```

Abrí `http://localhost:3000`.

## Estructura principal

```text
components/           Componentes visuales, gráficos y filtros
composables/          Formato de valores y construcción de filtros
pages/                Página principal del dashboard
prisma/schema.prisma  Modelos de datos de Prisma
server/api/           Opciones de filtros y endpoints de indicadores
server/db/            Esquema SQL y generador de datos de ejemplo
server/utils/         Conexión a la base y procesamiento de filtros
```

## Adaptación a datos reales

Para conectar una fuente real, revisá el modelo de datos, los estados y las reglas de cálculo con el área de negocio. La base debe ser compatible con los modelos de Prisma y las consultas SQL existentes, o bien deberán adaptarse ambos a la estructura disponible. No ejecutes el seed sobre datos reales.

## Producción

```bash
npm run build
node .output/server/index.mjs
```

Definí `DATABASE_URL` de forma segura en el entorno de despliegue.
