using ConsultasMedicasApi.DTOs;
using ConsultasMedicasApi.Models;
using ConsultasMedicasApi.Repositories;

namespace ConsultasMedicasApi.Services;

public interface IConsultaService
{
    Task<ConsultaResponseDto> RegistrarConsultaAsync(ConsultaCreateDto dto);
    Task<ConsultaResponseDto> ObtenerConsultaAsync(int idConsulta);
    Task<HistorialPacienteDto> ObtenerHistorialPacienteAsync(int idPaciente);
    Task<ConsultasPorMedicoDto> ObtenerConsultasPorMedicoAsync(int idMedico);
    Task ActualizarConsultaAsync(int idConsulta, ConsultaUpdateDto dto);
}

// Aquí viven las reglas de negocio (equivalentes a las que definió el Equipo 4
// en el ejercicio anterior): existencia de paciente/médico, fecha no futura,
// campos mínimos obligatorios, y quién puede actualizar una consulta.
public class ConsultaService : IConsultaService
{
    private readonly IConsultaRepository _consultaRepository;
    private readonly IPacienteRepository _pacienteRepository;
    private readonly IMedicoRepository _medicoRepository;

    public ConsultaService(
        IConsultaRepository consultaRepository,
        IPacienteRepository pacienteRepository,
        IMedicoRepository medicoRepository)
    {
        _consultaRepository = consultaRepository;
        _pacienteRepository = pacienteRepository;
        _medicoRepository = medicoRepository;
    }

    public async Task<ConsultaResponseDto> RegistrarConsultaAsync(ConsultaCreateDto dto)
    {
        // Regla: el paciente y el médico deben existir antes de insertar.
        if (!await _pacienteRepository.ExistsAsync(dto.IdPaciente))
            throw new KeyNotFoundException($"No existe un paciente con id {dto.IdPaciente}.");

        if (!await _medicoRepository.ExistsAsync(dto.IdMedico))
            throw new KeyNotFoundException($"No existe un médico con id {dto.IdMedico}.");

        // Regla: la fecha no puede ser futura.
        if (dto.FechaHora > DateTime.Now)
            throw new ArgumentException("La fecha de la consulta no puede ser futura.");

        // Regla: campos mínimos obligatorios (motivo y diagnóstico ya se validan
        // también a nivel de DTO con [Required], esto es una segunda capa de seguridad).
        if (string.IsNullOrWhiteSpace(dto.Motivo))
            throw new ArgumentException("El motivo de la consulta es obligatorio.");

        if (string.IsNullOrWhiteSpace(dto.Diagnostico))
            throw new ArgumentException("El diagnóstico es obligatorio.");

        var consulta = new Consulta
        {
            IdPaciente = dto.IdPaciente,
            IdMedico = dto.IdMedico,
            FechaHora = dto.FechaHora,
            Motivo = dto.Motivo,
            Sintomas = dto.Sintomas,
            Diagnostico = dto.Diagnostico,
            Tratamiento = dto.Tratamiento,
            Observaciones = dto.Observaciones,
            Consultorio = dto.Consultorio
        };

        var idGenerado = await _consultaRepository.CreateAsync(consulta);

        // Se relee de la BD para regresar la consulta ya con paciente y médico
        // identificados (con JOIN), en vez de reconstruirla a mano en memoria.
        return await ObtenerConsultaAsync(idGenerado);
    }

    public async Task<ConsultaResponseDto> ObtenerConsultaAsync(int idConsulta)
    {
        var fila = await _consultaRepository.GetDetalleByIdAsync(idConsulta);
        if (fila is null)
            throw new KeyNotFoundException($"No existe una consulta con id {idConsulta}.");

        return MapearDetalle(fila);
    }

    public async Task<HistorialPacienteDto> ObtenerHistorialPacienteAsync(int idPaciente)
    {
        var paciente = await _pacienteRepository.GetByIdAsync(idPaciente);
        if (paciente is null)
            throw new KeyNotFoundException($"No existe un paciente con id {idPaciente}.");

        var filas = await _consultaRepository.GetHistorialByPacienteAsync(idPaciente);

        return new HistorialPacienteDto
        {
            IdPaciente = paciente.IdPaciente,
            NombrePaciente = paciente.Nombre,
            TotalConsultas = filas.Count(),
            Consultas = filas.Select(MapearHistorial).ToList()
        };
    }

    // Operación adicional (no mínima, pero útil y consistente con el diseño
    // del ejercicio anterior): consultas realizadas por un médico específico.
    public async Task<ConsultasPorMedicoDto> ObtenerConsultasPorMedicoAsync(int idMedico)
    {
        var medico = await _medicoRepository.GetByIdAsync(idMedico);
        if (medico is null)
            throw new KeyNotFoundException($"No existe un médico con id {idMedico}.");

        var filas = await _consultaRepository.GetByMedicoAsync(idMedico);

        return new ConsultasPorMedicoDto
        {
            IdMedico = medico.IdMedico,
            NombreMedico = medico.Nombre,
            TotalConsultas = filas.Count(),
            Consultas = filas.Select(f => new ConsultaMedicoItemDto
            {
                IdConsulta = f.IdConsulta,
                FechaHora = f.FechaHora,
                Paciente = f.Paciente,
                Diagnostico = f.Diagnostico
            }).ToList()
        };
    }

    public async Task ActualizarConsultaAsync(int idConsulta, ConsultaUpdateDto dto)
    {
        var existente = await _consultaRepository.GetDetalleByIdAsync(idConsulta);
        if (existente is null)
            throw new KeyNotFoundException($"No existe una consulta con id {idConsulta}.");

        // Regla: quien actualiza debe ser un médico real (auditoría de "quién y cuándo").
        if (!await _medicoRepository.ExistsAsync(dto.ActualizadoPor))
            throw new KeyNotFoundException($"No existe un médico con id {dto.ActualizadoPor} para registrar la actualización.");

        if (string.IsNullOrWhiteSpace(dto.Motivo) || string.IsNullOrWhiteSpace(dto.Diagnostico))
            throw new ArgumentException("Motivo y diagnóstico son obligatorios.");

        await _consultaRepository.UpdateAsync(idConsulta, dto);
    }

    private static ConsultaResponseDto MapearDetalle(ConsultaDetalleRow fila) => new()
    {
        IdConsulta = fila.IdConsulta,
        FechaHora = fila.FechaHora,
        Motivo = fila.Motivo,
        Sintomas = fila.Sintomas,
        Diagnostico = fila.Diagnostico,
        Tratamiento = fila.Tratamiento,
        Observaciones = fila.Observaciones,
        Consultorio = fila.Consultorio,
        Paciente = new PacienteResumenDto
        {
            IdPaciente = fila.IdPaciente,
            Nombre = fila.NombrePaciente
        },
        Medico = new MedicoResumenDto
        {
            IdMedico = fila.IdMedico,
            Nombre = fila.NombreMedico,
            Cedula = fila.CedulaMedico
        }
    };

    private static HistorialItemDto MapearHistorial(HistorialRow fila) => new()
    {
        IdConsulta = fila.IdConsulta,
        FechaHora = fila.FechaHora,
        Medico = fila.Medico,
        Diagnostico = fila.Diagnostico
    };
}
