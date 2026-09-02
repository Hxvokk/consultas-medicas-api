using Dapper;
using Npgsql;
using ConsultasMedicasApi.Models;

namespace ConsultasMedicasApi.Repositories;

public interface IPacienteRepository
{
    Task<Paciente?> GetByIdAsync(int idPaciente);
    Task<bool> ExistsAsync(int idPaciente);
}

// Solo lectura: el CRUD completo de pacientes es responsabilidad del Módulo A.
// Este repositorio existe porque el Módulo B necesita verificar que un paciente
// exista antes de registrar una consulta, y mostrar su nombre en las respuestas.
public class PacienteRepository : IPacienteRepository
{
    private readonly string _connectionString;

    public PacienteRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("Supabase")
            ?? throw new InvalidOperationException("No se encontró la cadena de conexión 'Supabase' en appsettings.json");
    }

    private NpgsqlConnection CreateConnection() => new(_connectionString);

    public async Task<Paciente?> GetByIdAsync(int idPaciente)
    {
        const string sql = @"
            SELECT id_paciente     AS IdPaciente,
                   nombre          AS Nombre,
                   edad            AS Edad,
                   peso            AS Peso,
                   gpo_sanguineo   AS GpoSanguineo,
                   sexo            AS Sexo,
                   celular         AS Celular
            FROM paciente
            WHERE id_paciente = @IdPaciente;";

        using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Paciente>(sql, new { IdPaciente = idPaciente });
    }

    public async Task<bool> ExistsAsync(int idPaciente)
    {
        const string sql = "SELECT COUNT(1) FROM paciente WHERE id_paciente = @IdPaciente;";
        using var connection = CreateConnection();
        var count = await connection.ExecuteScalarAsync<int>(sql, new { IdPaciente = idPaciente });
        return count > 0;
    }
}
