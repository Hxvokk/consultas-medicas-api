namespace ConsultasMedicasApi.Models;

public class Cita
{
    public int IdCita { get; set; }
    public int IdPaciente { get; set; }
    public int IdMedico { get; set; }
    public DateTime FechaHora { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string Estado { get; set; } = "Programada";
    public string? Consultorio { get; set; }
}
