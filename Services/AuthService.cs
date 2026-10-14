using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ConsultasMedicasApi.DTOs;
using ConsultasMedicasApi.Models;
using ConsultasMedicasApi.Repositories;
using Microsoft.IdentityModel.Tokens;

namespace ConsultasMedicasApi.Services;

public interface IAuthService
{
    Task<UsuarioResponseDto> RegistrarAsync(RegistroDto registro);
    Task<LoginResponseDto?> LoginAsync(LoginDto login);
}

public class AuthService : IAuthService
{
    private const int TokenDurationMinutes = 60;
    private readonly IAuthRepository _authRepository;
    private readonly IConfiguration _configuration;

    public AuthService(IAuthRepository authRepository, IConfiguration configuration)
    {
        _authRepository = authRepository;
        _configuration = configuration;
    }

    public async Task<UsuarioResponseDto> RegistrarAsync(RegistroDto registro)
    {
        var email = registro.Email.Trim().ToLowerInvariant();
        if (await _authRepository.GetByEmailAsync(email) is not null)
            throw new InvalidOperationException("El correo ya está registrado.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(registro.Password);
        var usuario = await _authRepository.CrearPacienteYUsuarioAsync(registro, passwordHash);
        return MapearUsuario(usuario);
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto login)
    {
        var usuario = await _authRepository.GetByEmailAsync(login.Email.Trim().ToLowerInvariant());
        if (usuario is null || !usuario.Activo || !BCrypt.Net.BCrypt.Verify(login.Password, usuario.PasswordHash))
            return null;

        var token = CrearToken(usuario);
        return new LoginResponseDto
        {
            AccessToken = token,
            ExpiresIn = TokenDurationMinutes * 60,
            Usuario = MapearUsuario(usuario)
        };
    }

    private string CrearToken(Usuario usuario)
    {
        var secret = _configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("No se configuró Jwt:Secret.");
        var issuer = _configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException("No se configuró Jwt:Issuer.");
        var audience = _configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException("No se configuró Jwt:Audience.");

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.IdUsuario.ToString()),
            new(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
            new(ClaimTypes.Email, usuario.Email),
            new(ClaimTypes.Role, usuario.Rol)
        };

        if (usuario.IdPaciente.HasValue)
            claims.Add(new Claim("idPaciente", usuario.IdPaciente.Value.ToString()));
        if (usuario.IdMedico.HasValue)
            claims.Add(new Claim("idMedico", usuario.IdMedico.Value.ToString()));

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(TokenDurationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UsuarioResponseDto MapearUsuario(Usuario usuario) => new()
    {
        IdUsuario = usuario.IdUsuario,
        IdPaciente = usuario.IdPaciente ?? 0,
        Email = usuario.Email,
        Rol = usuario.Rol
    };
}
