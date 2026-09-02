using System.ComponentModel.DataAnnotations;

namespace ConsultasMedicasApi.DTOs;

// Lo que el frontend envía para registrar una consulta.
public class ConsultaCreateDto
{
    [Required]
    public int IdPaciente { get; set; }

    [Required]
    public int IdMedico { get; set; }

    [Required]
    public DateTime FechaHora { get; set; }

    [Required, MaxLength(255)]
    public string Motivo { get; set; } = string.Empty;

    public string? Sintomas { get; set; }

    [Required, MaxLength(255)]
    public string Diagnostico { get; set; } = string.Empty;

    public string? Tratamiento { get; set; }

    public string? Observaciones { get; set; }

    public string? Consultorio { get; set; }
}

// Lo que el frontend envía para actualizar una consulta ya registrada.
public class ConsultaUpdateDto
{
    [Required, MaxLength(255)]
    public string Motivo { get; set; } = string.Empty;

    public string? Sintomas { get; set; }

    [Required, MaxLength(255)]
    public string Diagnostico { get; set; } = string.Empty;

    public string? Tratamiento { get; set; }

    public string? Observaciones { get; set; }

    // id_medico de quien realiza la actualización (queda registrado para auditoría).
    [Required]
    public int ActualizadoPor { get; set; }
}

// Resumen de paciente embebido en la respuesta de una consulta
// (satisface el requisito "identificar el paciente asociado a una consulta").
public class PacienteResumenDto
{
    public int IdPaciente { get; set; }
    public string Nombre { get; set; } = string.Empty;
}

// Resumen de médico embebido en la respuesta de una consulta
// (satisface el requisito "identificar el médico que realizó una consulta").
public class MedicoResumenDto
{
    public int IdMedico { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Cedula { get; set; } = string.Empty;
}

// Respuesta completa de una consulta individual.
public class ConsultaResponseDto
{
    public int IdConsulta { get; set; }
    public DateTime FechaHora { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string? Sintomas { get; set; }
    public string Diagnostico { get; set; } = string.Empty;
    public string? Tratamiento { get; set; }
    public string? Observaciones { get; set; }
    public string? Consultorio { get; set; }
    public PacienteResumenDto Paciente { get; set; } = null!;
    public MedicoResumenDto Medico { get; set; } = null!;
}

// Un renglón dentro del historial de un paciente (columna Medico = quién lo atendió).
public class HistorialItemDto
{
    public int IdConsulta { get; set; }
    public DateTime FechaHora { get; set; }
    public string Medico { get; set; } = string.Empty;
    public string Diagnostico { get; set; } = string.Empty;
}

// Un renglón dentro de las consultas de un médico (columna Paciente = a quién atendió).
public class ConsultaMedicoItemDto
{
    public int IdConsulta { get; set; }
    public DateTime FechaHora { get; set; }
    public string Paciente { get; set; } = string.Empty;
    public string Diagnostico { get; set; } = string.Empty;
}

// Historial completo de consultas de un paciente.
public class HistorialPacienteDto
{
    public int IdPaciente { get; set; }
    public string NombrePaciente { get; set; } = string.Empty;
    public int TotalConsultas { get; set; }
    public List<HistorialItemDto> Consultas { get; set; } = new();
}

// Consultas realizadas por un médico específico (operación adicional).
public class ConsultasPorMedicoDto
{
    public int IdMedico { get; set; }
    public string NombreMedico { get; set; } = string.Empty;
    public int TotalConsultas { get; set; }
    public List<ConsultaMedicoItemDto> Consultas { get; set; } = new();
}
