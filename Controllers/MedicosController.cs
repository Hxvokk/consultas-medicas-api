using Microsoft.AspNetCore.Mvc;
using ConsultasMedicasApi.DTOs;
using ConsultasMedicasApi.Services;

namespace ConsultasMedicasApi.Controllers;

// Nota: el CRUD completo de médicos (registrar, listar) vive en el proyecto del
// compañero del Módulo A. Este endpoint es una operación adicional (bonus) del
// Módulo B: ver las consultas realizadas por un médico específico.
[ApiController]
[Route("api/medicos")]
public class MedicosController : ControllerBase
{
    private readonly IConsultaService _consultaService;

    public MedicosController(IConsultaService consultaService)
    {
        _consultaService = consultaService;
    }

    // GET /api/medicos/{id}/consultas
    [HttpGet("{id:int}/consultas")]
    public async Task<ActionResult<ConsultasPorMedicoDto>> ConsultasRealizadas(int id)
    {
        try
        {
            var resultado = await _consultaService.ObtenerConsultasPorMedicoAsync(id);
            return Ok(resultado);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}
