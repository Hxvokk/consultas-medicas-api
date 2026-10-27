-- Migration for existing Supabase databases. Safe to run more than once.
ALTER TABLE medico
    ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS cita (
    id_cita     SERIAL PRIMARY KEY,
    id_paciente INT NOT NULL REFERENCES paciente(id_paciente),
    id_medico   INT NOT NULL REFERENCES medico(id_medico),
    fecha_hora  TIMESTAMP NOT NULL,
    motivo      VARCHAR(255) NOT NULL,
    estado      VARCHAR(20) NOT NULL DEFAULT 'Programada'
                CHECK (estado IN ('Programada', 'Confirmada', 'Cancelada', 'Atendida')),
    consultorio VARCHAR(50),
    creado_en   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cita_fecha_estado ON cita(fecha_hora, estado);
