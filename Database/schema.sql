-- ============================================================
-- Sistema Universitario de Salud — Módulo B: Consultas e historial
-- Motor: PostgreSQL (Supabase)
-- Ejecutar completo en el SQL Editor de Supabase (Project > SQL Editor > New query)
-- ============================================================

-- Limpieza (útil si necesitas volver a correr el script mientras pruebas)
DROP TABLE IF EXISTS consulta;
DROP TABLE IF EXISTS medico;
DROP TABLE IF EXISTS paciente;

-- ------------------------------------------------------------
-- Tabla: paciente
-- (catálogo administrado por el compañero del Módulo A;
--  aquí solo se crea porque Consulta depende de ella por FK)
-- ------------------------------------------------------------
CREATE TABLE paciente (
    id_paciente     SERIAL PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    edad            INT NOT NULL CHECK (edad >= 0 AND edad <= 120),
    peso            NUMERIC(5,2),
    gpo_sanguineo   VARCHAR(5),
    sexo            VARCHAR(20),
    celular         VARCHAR(20)
);

-- ------------------------------------------------------------
-- Tabla: medico
-- (catálogo administrado por el compañero del Módulo A;
--  aquí solo se crea porque Consulta depende de ella por FK)
-- ------------------------------------------------------------
CREATE TABLE medico (
    id_medico       SERIAL PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    cedula          VARCHAR(20) NOT NULL UNIQUE,
    consultorio     INT
);

-- ------------------------------------------------------------
-- Tabla: consulta  (entidad puente Paciente N:M Médico)
-- ------------------------------------------------------------
CREATE TABLE consulta (
    id_consulta         SERIAL PRIMARY KEY,
    id_paciente         INT NOT NULL REFERENCES paciente(id_paciente),
    id_medico           INT NOT NULL REFERENCES medico(id_medico),
    fecha_hora          TIMESTAMP NOT NULL,
    motivo              VARCHAR(255) NOT NULL,
    sintomas            TEXT,
    diagnostico         VARCHAR(255) NOT NULL,
    tratamiento         TEXT,
    observaciones       TEXT,
    consultorio         VARCHAR(50),
    fecha_actualizacion TIMESTAMP,
    actualizado_por     INT REFERENCES medico(id_medico)
);

-- Nota: "la fecha no puede ser futura" se valida en el Service (capa de negocio),
-- no aquí en la BD, porque Postgres no permite funciones no-inmutables (como NOW())
-- dentro de un CHECK constraint.

-- Índices para las consultas más frecuentes (historial por paciente / por médico)
CREATE INDEX idx_consulta_paciente ON consulta(id_paciente);
CREATE INDEX idx_consulta_medico ON consulta(id_medico);

-- ============================================================
-- Datos de prueba
-- ============================================================
INSERT INTO paciente (nombre, edad, peso, gpo_sanguineo, sexo, celular) VALUES
('Juan Pérez',      21, 68.50, 'O+', 'Masculino', '6671234567'),
('María López',     23, 55.20, 'A+', 'Femenino',  '6677654321'),
('Carlos Ramírez',  20, 72.00, 'B-', 'Masculino', '6679988776');

INSERT INTO medico (nombre, cedula, consultorio) VALUES
('Dra. Ramírez', '1234567', 101),
('Dr. Torres',   '7654321', 102),
('Dra. López',   '1122334', 103);

INSERT INTO consulta (id_paciente, id_medico, fecha_hora, motivo, sintomas, diagnostico, tratamiento, observaciones, consultorio) VALUES
(1, 1, '2026-08-18 10:00:00', 'Dolor de garganta', 'Fiebre, dolor al tragar', 'Faringitis aguda', 'Paracetamol 500mg c/8h, reposo', 'Cita de seguimiento en 5 días si no mejora', '101'),
(1, 2, '2026-07-03 09:00:00', 'Chequeo general', 'Ninguno reportado', 'Paciente sano', 'Continuar hábitos actuales', 'Próxima revisión en 6 meses', '102'),
(2, 3, '2026-08-10 12:30:00', 'Dolor abdominal', 'Náusea, dolor tipo cólico', 'Gastritis', 'Omeprazol 20mg c/24h, dieta blanda', NULL, '103');
