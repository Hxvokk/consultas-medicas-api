using Microsoft.AspNetCore.Mvc;
using ConsultasMedicasApi.DTOs;
using ConsultasMedicasApi.Services;

namespace ConsultasMedicasApi.Controllers;

// Nota: el CRUD completo de pacientes (registrar, listar, actualizar) vive en el
// proyecto del compañero del Módulo A. Aquí solo se expone el historial de
// consultas, que es responsabilidad del Módulo B.
[ApiController]
[Route("api/pacientes")]
public class PacientesController : ControllerBase
{
    private readonly IConsultaService _consultaService;

    public PacientesController(IConsultaService consultaService)
    {
        _consultaService = consultaService;
    }

    // GET /api/pacientes/{id}/consultas
    [HttpGet("{id:int}/consultas")]
    public async Task<ActionResult<HistorialPacienteDto>> Historial(int id)
    {
        var historial = await _consultaService.ObtenerHistorialPacienteAsync(id);
        return Ok(historial);
    }
}
