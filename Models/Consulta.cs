namespace ConsultasMedicasApi.Models;

// Representa la fila de la tabla "consulta": la entidad puente entre Paciente y Médico.
public class Consulta
{
    public int IdConsulta { get; set; }
    public int IdPaciente { get; set; }
    public int IdMedico { get; set; }
    public DateTime FechaHora { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string? Sintomas { get; set; }
    public string Diagnostico { get; set; } = string.Empty;
    public string? Tratamiento { get; set; }
    public string? Observaciones { get; set; }
    public string? Consultorio { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public int? ActualizadoPor { get; set; }
}

// Fila "plana" que resulta de un JOIN consulta + paciente + medico.
// Se usa solo como destino de mapeo de Dapper; el Service la convierte
// a ConsultaResponseDto para exponerla en la API.
public class ConsultaDetalleRow
{
    public int IdConsulta { get; set; }
    public DateTime FechaHora { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string? Sintomas { get; set; }
    public string Diagnostico { get; set; } = string.Empty;
    public string? Tratamiento { get; set; }
    public string? Observaciones { get; set; }
    public string? Consultorio { get; set; }

    public int IdPaciente { get; set; }
    public string NombrePaciente { get; set; } = string.Empty;

    public int IdMedico { get; set; }
    public string NombreMedico { get; set; } = string.Empty;
    public string CedulaMedico { get; set; } = string.Empty;
}

// Fila resumida para el historial de un paciente (columna "Medico" = quién lo atendió).
public class HistorialRow
{
    public int IdConsulta { get; set; }
    public DateTime FechaHora { get; set; }
    public string Medico { get; set; } = string.Empty;
    public string Diagnostico { get; set; } = string.Empty;
}

// Fila resumida para las consultas de un médico (columna "Paciente" = a quién atendió).
public class MedicoHistorialRow
{
    public int IdConsulta { get; set; }
    public DateTime FechaHora { get; set; }
    public string Paciente { get; set; } = string.Empty;
    public string Diagnostico { get; set; } = string.Empty;
}
