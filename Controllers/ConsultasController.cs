using Microsoft.AspNetCore.Mvc;
using ConsultasMedicasApi.DTOs;
using ConsultasMedicasApi.Services;

namespace ConsultasMedicasApi.Controllers;

// Responsable solo de: recibir la solicitud HTTP, validar lo básico (ModelState,
// gracias a [ApiController] + Data Annotations en los DTOs), invocar al Service,
// y devolver la respuesta HTTP correspondiente. Nada de lógica de negocio ni SQL aquí:
// el try/catch solo traduce lo que el Service ya decidió a un código HTTP.
[ApiController]
[Route("api/consultas")]
public class ConsultasController : ControllerBase
{
    private readonly IConsultaService _consultaService;

    public ConsultasController(IConsultaService consultaService)
    {
        _consultaService = consultaService;
    }

    // POST /api/consultas
    [HttpPost]
    public async Task<ActionResult<ConsultaResponseDto>> Registrar([FromBody] ConsultaCreateDto dto)
    {
        try
        {
            var creada = await _consultaService.RegistrarConsultaAsync(dto);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = creada.IdConsulta }, creada);
        }
        catch (KeyNotFoundException ex)
        {
            // El paciente o el médico indicados no existen.
            return NotFound(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            // Fecha futura, campos obligatorios faltantes, etc.
            return BadRequest(new { error = ex.Message });
        }
    }

    // GET /api/consultas/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ConsultaResponseDto>> ObtenerPorId(int id)
    {
        try
        {
            var consulta = await _consultaService.ObtenerConsultaAsync(id);
            return Ok(consulta);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    // PUT /api/consultas/{id}  (operación adicional)
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] ConsultaUpdateDto dto)
    {
        try
        {
            await _consultaService.ActualizarConsultaAsync(id, dto);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
