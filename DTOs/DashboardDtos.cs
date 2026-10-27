namespace ConsultasMedicasApi.DTOs;

public class DashboardSummaryDto
{
    public DashboardMetricsDto Metricas { get; set; } = new();
    public List<DashboardAppointmentDto> ProximasCitas { get; set; } = [];
    public List<DashboardAlertDto> Alertas { get; set; } = [];
}

public class DashboardMetricsDto
{
    public int TotalPacientes { get; set; }
    public int CitasHoy { get; set; }
    public int MedicosActivos { get; set; }
}

public class DashboardAppointmentDto
{
    public int IdCita { get; set; }
    public DateTime FechaHora { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public string Paciente { get; set; } = string.Empty;
    public string Medico { get; set; } = string.Empty;
    public string? Consultorio { get; set; }
}

public class DashboardAlertDto
{
    public string Tipo { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
}
