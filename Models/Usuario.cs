namespace ConsultasMedicasApi.Models;

public class Usuario
{
    public int IdUsuario { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public int? IdPaciente { get; set; }
    public int? IdMedico { get; set; }
    public bool Activo { get; set; }
}
