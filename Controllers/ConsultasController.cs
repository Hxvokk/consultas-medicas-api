using Microsoft.AspNetCore.Mvc;
using ConsultasMedicasApi.DTOs;
using ConsultasMedicasApi.Services;

namespace ConsultasMedicasApi.Controllers;

// Responsable solo de: recibir la solicitud HTTP, validar lo básico (ModelState,
// gracias a [ApiController] + Data Annotations en los DTOs), invocar al Service,
// y devolver la respuesta HTTP. Nada de lógica de negocio ni SQL aquí.
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
        var creada = await _consultaService.RegistrarConsultaAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creada.IdConsulta }, creada);
    }

    // GET /api/consultas/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ConsultaResponseDto>> ObtenerPorId(int id)
    {
        var consulta = await _consultaService.ObtenerConsultaAsync(id);
        return Ok(consulta);
    }

    // PUT /api/consultas/{id}  (operación adicional)
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] ConsultaUpdateDto dto)
    {
        await _consultaService.ActualizarConsultaAsync(id, dto);
        return NoContent();
    }
}
