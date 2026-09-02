using Dapper;
using Npgsql;
using ConsultasMedicasApi.Models;
using ConsultasMedicasApi.DTOs;

namespace ConsultasMedicasApi.Repositories;

public interface IConsultaRepository
{
    Task<int> CreateAsync(Consulta consulta);
    Task<ConsultaDetalleRow?> GetDetalleByIdAsync(int idConsulta);
    Task<IEnumerable<HistorialRow>> GetHistorialByPacienteAsync(int idPaciente);
    Task<IEnumerable<MedicoHistorialRow>> GetByMedicoAsync(int idMedico);
    Task<bool> UpdateAsync(int idConsulta, ConsultaUpdateDto dto);
}

// Responsable únicamente de acceder a la base de datos (SQL vía Dapper).
// No contiene reglas de negocio: eso vive en ConsultaService.
public class ConsultaRepository : IConsultaRepository
{
    private readonly string _connectionString;

    public ConsultaRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("Supabase")
            ?? throw new InvalidOperationException("No se encontró la cadena de conexión 'Supabase' en appsettings.json");
    }

    private NpgsqlConnection CreateConnection() => new(_connectionString);

    public async Task<int> CreateAsync(Consulta consulta)
    {
        const string sql = @"
            INSERT INTO consulta
                (id_paciente, id_medico, fecha_hora, motivo, sintomas, diagnostico, tratamiento, observaciones, consultorio)
            VALUES
                (@IdPaciente, @IdMedico, @FechaHora, @Motivo, @Sintomas, @Diagnostico, @Tratamiento, @Observaciones, @Consultorio)
            RETURNING id_consulta;";

        using var connection = CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, consulta);
    }

    public async Task<ConsultaDetalleRow?> GetDetalleByIdAsync(int idConsulta)
    {
        const string sql = @"
            SELECT c.id_consulta   AS IdConsulta,
                   c.fecha_hora    AS FechaHora,
                   c.motivo        AS Motivo,
                   c.sintomas      AS Sintomas,
                   c.diagnostico   AS Diagnostico,
                   c.tratamiento   AS Tratamiento,
                   c.observaciones AS Observaciones,
                   c.consultorio   AS Consultorio,
                   p.id_paciente   AS IdPaciente,
                   p.nombre        AS NombrePaciente,
                   m.id_medico     AS IdMedico,
                   m.nombre        AS NombreMedico,
                   m.cedula        AS CedulaMedico
            FROM consulta c
            JOIN paciente p ON p.id_paciente = c.id_paciente
            JOIN medico   m ON m.id_medico   = c.id_medico
            WHERE c.id_consulta = @IdConsulta;";

        using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<ConsultaDetalleRow>(sql, new { IdConsulta = idConsulta });
    }

    public async Task<IEnumerable<HistorialRow>> GetHistorialByPacienteAsync(int idPaciente)
    {
        const string sql = @"
            SELECT c.id_consulta AS IdConsulta,
                   c.fecha_hora  AS FechaHora,
                   m.nombre      AS Medico,
                   c.diagnostico AS Diagnostico
            FROM consulta c
            JOIN medico m ON m.id_medico = c.id_medico
            WHERE c.id_paciente = @IdPaciente
            ORDER BY c.fecha_hora DESC;";

        using var connection = CreateConnection();
        return await connection.QueryAsync<HistorialRow>(sql, new { IdPaciente = idPaciente });
    }

    public async Task<IEnumerable<MedicoHistorialRow>> GetByMedicoAsync(int idMedico)
    {
        const string sql = @"
            SELECT c.id_consulta AS IdConsulta,
                   c.fecha_hora  AS FechaHora,
                   p.nombre      AS Paciente,
                   c.diagnostico AS Diagnostico
            FROM consulta c
            JOIN paciente p ON p.id_paciente = c.id_paciente
            WHERE c.id_medico = @IdMedico
            ORDER BY c.fecha_hora DESC;";

        using var connection = CreateConnection();
        return await connection.QueryAsync<MedicoHistorialRow>(sql, new { IdMedico = idMedico });
    }

    public async Task<bool> UpdateAsync(int idConsulta, ConsultaUpdateDto dto)
    {
        const string sql = @"
            UPDATE consulta
            SET motivo = @Motivo,
                sintomas = @Sintomas,
                diagnostico = @Diagnostico,
                tratamiento = @Tratamiento,
                observaciones = @Observaciones,
                fecha_actualizacion = NOW(),
                actualizado_por = @ActualizadoPor
            WHERE id_consulta = @IdConsulta;";

        using var connection = CreateConnection();
        var affected = await connection.ExecuteAsync(sql, new
        {
            dto.Motivo,
            dto.Sintomas,
            dto.Diagnostico,
            dto.Tratamiento,
            dto.Observaciones,
            dto.ActualizadoPor,
            IdConsulta = idConsulta
        });
        return affected > 0;
    }
}
