namespace ConsultasMedicasApi.Models;

public class DashboardData
{
    public int TotalPacientes { get; set; }
    public int CitasHoy { get; set; }
    public int MedicosActivos { get; set; }
    public List<DashboardAppointmentRow> ProximasCitas { get; set; } = [];
}

public class DashboardAppointmentRow
{
    public int IdCita { get; set; }
    public DateTime FechaHora { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public string NombrePaciente { get; set; } = string.Empty;
    public string NombreMedico { get; set; } = string.Empty;
    public string? Consultorio { get; set; }
}
