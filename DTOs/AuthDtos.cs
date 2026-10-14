using System.ComponentModel.DataAnnotations;

namespace ConsultasMedicasApi.DTOs;

public class RegistroDto
{
    [Required, MaxLength(150)]
    public string Nombre { get; set; } = string.Empty;

    [Range(0, 120)]
    public int Edad { get; set; }

    [Required, EmailAddress, MaxLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(12)]
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    [Required, EmailAddress, MaxLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class UsuarioResponseDto
{
    public int IdUsuario { get; set; }
    public int IdPaciente { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string TokenType { get; set; } = "Bearer";
    public int ExpiresIn { get; set; }
    public UsuarioResponseDto Usuario { get; set; } = null!;
}
