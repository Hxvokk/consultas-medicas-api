namespace ConsultasMedicasApi.Models;

// Representa la fila de la tabla "medico".
// El CRUD completo de esta entidad es responsabilidad del compañero del Módulo A;
// aquí solo se usa para verificar existencia y mostrar datos básicos dentro de una consulta.
public class Medico
{
    public int IdMedico { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Cedula { get; set; } = string.Empty;
    public int? Consultorio { get; set; }
}
