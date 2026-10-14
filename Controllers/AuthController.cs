using System.Security.Claims;
using ConsultasMedicasApi.DTOs;
using ConsultasMedicasApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConsultasMedicasApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [AllowAnonymous]
    [HttpPost("registro")]
    public async Task<ActionResult<UsuarioResponseDto>> Registro([FromBody] RegistroDto registro)
    {
        try
        {
            var usuario = await _authService.RegistrarAsync(registro);
            return StatusCode(StatusCodes.Status201Created, usuario);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto login)
    {
        var respuesta = await _authService.LoginAsync(login);
        return respuesta is null
            ? Unauthorized(new { error = "Correo o contraseña no válidos." })
            : Ok(respuesta);
    }

    // Endpoint de prueba para comprobar que el JWT enviado es válido.
    [Authorize]
    [HttpGet("perfil")]
    public IActionResult Perfil()
    {
        return Ok(new
        {
            idUsuario = User.FindFirstValue(ClaimTypes.NameIdentifier),
            email = User.FindFirstValue(ClaimTypes.Email),
            rol = User.FindFirstValue(ClaimTypes.Role),
            idPaciente = User.FindFirstValue("idPaciente"),
            idMedico = User.FindFirstValue("idMedico")
        });
    }
}
