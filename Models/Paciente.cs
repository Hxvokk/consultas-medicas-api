namespace ConsultasMedicasApi.Models;

// Representa la fila de la tabla "paciente".
// El CRUD completo de esta entidad es responsabilidad del compañero del Módulo A;
// aquí solo se usa para verificar existencia y mostrar datos básicos dentro de una consulta.
public class Paciente
{
    public int IdPaciente { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int Edad { get; set; }
    public decimal? Peso { get; set; }
    public string? GpoSanguineo { get; set; }
    public string? Sexo { get; set; }
    public string? Celular { get; set; }
}
