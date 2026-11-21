-- Esquema para el Dashboard de KPIs de Siniestros

CREATE TABLE IF NOT EXISTS coberturas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS zonas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  region VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS siniestros (
  id SERIAL PRIMARY KEY,
  numero_siniestro VARCHAR(30) NOT NULL UNIQUE,
  cobertura_id INTEGER NOT NULL REFERENCES coberturas(id),
  zona_id INTEGER NOT NULL REFERENCES zonas(id),
  fecha_ocurrencia DATE NOT NULL,
  fecha_apertura DATE NOT NULL,
  fecha_cierre DATE,
  estado VARCHAR(20) NOT NULL DEFAULT 'abierto', -- abierto, cerrado, rechazado
  costo_estimado NUMERIC(12,2) NOT NULL DEFAULT 0,
  costo_final NUMERIC(12,2),
  creado_en TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_siniestros_cobertura ON siniestros(cobertura_id);
CREATE INDEX IF NOT EXISTS idx_siniestros_zona ON siniestros(zona_id);
CREATE INDEX IF NOT EXISTS idx_siniestros_fecha ON siniestros(fecha_ocurrencia);
CREATE INDEX IF NOT EXISTS idx_siniestros_estado ON siniestros(estado);
