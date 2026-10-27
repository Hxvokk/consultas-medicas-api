using ConsultasMedicasApi.DTOs;
using ConsultasMedicasApi.Repositories;

namespace ConsultasMedicasApi.Services;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync();
}

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _dashboardRepository;

    public DashboardService(IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        var data = await _dashboardRepository.GetSummaryAsync();

        return new DashboardSummaryDto
        {
            Metricas = new DashboardMetricsDto
            {
                TotalPacientes = data.TotalPacientes,
                CitasHoy = data.CitasHoy,
                MedicosActivos = data.MedicosActivos
            },
            ProximasCitas = data.ProximasCitas.Select(cita => new DashboardAppointmentDto
            {
                IdCita = cita.IdCita,
                FechaHora = cita.FechaHora,
                Motivo = cita.Motivo,
                Estado = cita.Estado,
                Paciente = cita.NombrePaciente,
                Medico = cita.NombreMedico,
                Consultorio = cita.Consultorio
            }).ToList(),
            Alertas = []
        };
    }
}
