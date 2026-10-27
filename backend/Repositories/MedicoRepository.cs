using Dapper;
using Npgsql;
using ConsultasMedicasApi.Models;

namespace ConsultasMedicasApi.Repositories;

public interface IMedicoRepository
{
    Task<Medico?> GetByIdAsync(int idMedico);
    Task<bool> ExistsAsync(int idMedico);
}

// Solo lectura: el CRUD completo de médicos es responsabilidad del Módulo A.
// Este repositorio existe porque el Módulo B necesita verificar que un médico
// exista antes de registrar una consulta, y mostrar sus datos en las respuestas.
public class MedicoRepository : IMedicoRepository
{
    private readonly string _connectionString;

    public MedicoRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("Supabase")
            ?? throw new InvalidOperationException("No se encontró la cadena de conexión 'Supabase' en appsettings.json");
    }

    private NpgsqlConnection CreateConnection() => new(_connectionString);

    public async Task<Medico?> GetByIdAsync(int idMedico)
    {
        const string sql = @"
            SELECT id_medico    AS IdMedico,
                   nombre       AS Nombre,
                   cedula       AS Cedula,
                   consultorio  AS Consultorio
            FROM medico
            WHERE id_medico = @IdMedico;";

        using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Medico>(sql, new { IdMedico = idMedico });
    }

    public async Task<bool> ExistsAsync(int idMedico)
    {
        const string sql = "SELECT COUNT(1) FROM medico WHERE id_medico = @IdMedico;";
        using var connection = CreateConnection();
        var count = await connection.ExecuteScalarAsync<int>(sql, new { IdMedico = idMedico });
        return count > 0;
    }
}
