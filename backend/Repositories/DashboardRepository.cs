using ConsultasMedicasApi.Models;
using Dapper;
using Npgsql;

namespace ConsultasMedicasApi.Repositories;

public interface IDashboardRepository
{
    Task<DashboardData> GetSummaryAsync();
}

public class DashboardRepository : IDashboardRepository
{
    private readonly string _connectionString;

    public DashboardRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("Supabase")
            ?? throw new InvalidOperationException("No se encontró la cadena de conexión 'Supabase'.");
    }

    public async Task<DashboardData> GetSummaryAsync()
    {
        const string sql = @"
            SELECT COUNT(*)::int
            FROM paciente;

            SELECT COUNT(*)::int
            FROM cita
            WHERE fecha_hora >= CURRENT_DATE
              AND fecha_hora < CURRENT_DATE + INTERVAL '1 day'
              AND estado IN ('Programada', 'Confirmada');

            SELECT COUNT(*)::int
            FROM medico
            WHERE activo = TRUE;

            SELECT c.id_cita AS IdCita,
                   c.fecha_hora AS FechaHora,
                   c.motivo AS Motivo,
                   c.estado AS Estado,
                   p.nombre AS NombrePaciente,
                   m.nombre AS NombreMedico,
                   c.consultorio AS Consultorio
            FROM cita c
            INNER JOIN paciente p ON p.id_paciente = c.id_paciente
            INNER JOIN medico m ON m.id_medico = c.id_medico
            WHERE c.fecha_hora >= CURRENT_TIMESTAMP
              AND c.fecha_hora < CURRENT_DATE + INTERVAL '1 day'
              AND c.estado IN ('Programada', 'Confirmada')
            ORDER BY c.fecha_hora
            LIMIT 8;";

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();
        using var resultSets = await connection.QueryMultipleAsync(sql);

        return new DashboardData
        {
            TotalPacientes = await resultSets.ReadSingleAsync<int>(),
            CitasHoy = await resultSets.ReadSingleAsync<int>(),
            MedicosActivos = await resultSets.ReadSingleAsync<int>(),
            ProximasCitas = (await resultSets.ReadAsync<DashboardAppointmentRow>()).AsList()
        };
    }
}
