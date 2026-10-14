using ConsultasMedicasApi.DTOs;
using ConsultasMedicasApi.Models;
using Dapper;
using Npgsql;

namespace ConsultasMedicasApi.Repositories;

public interface IAuthRepository
{
    Task<Usuario?> GetByEmailAsync(string email);
    Task<Usuario> CrearPacienteYUsuarioAsync(RegistroDto registro, string passwordHash);
}

public class AuthRepository : IAuthRepository
{
    private readonly string _connectionString;

    public AuthRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("Supabase")
            ?? throw new InvalidOperationException("No se encontró la cadena de conexión 'Supabase' en appsettings.json");
    }

    public async Task<Usuario?> GetByEmailAsync(string email)
    {
        const string sql = @"
            SELECT id_usuario AS IdUsuario,
                   email AS Email,
                   password_hash AS PasswordHash,
                   rol AS Rol,
                   id_paciente AS IdPaciente,
                   id_medico AS IdMedico,
                   activo AS Activo
            FROM usuario
            WHERE email = @Email;";

        await using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QuerySingleOrDefaultAsync<Usuario>(sql, new { Email = email });
    }

    public async Task<Usuario> CrearPacienteYUsuarioAsync(RegistroDto registro, string passwordHash)
    {
        const string insertarPaciente = @"
            INSERT INTO paciente (nombre, edad)
            VALUES (@Nombre, @Edad)
            RETURNING id_paciente;";

        const string insertarUsuario = @"
            INSERT INTO usuario (email, password_hash, rol, id_paciente)
            VALUES (@Email, @PasswordHash, 'Paciente', @IdPaciente)
            RETURNING id_usuario;";

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();

        try
        {
            var idPaciente = await connection.ExecuteScalarAsync<int>(
                insertarPaciente,
                new { Nombre = registro.Nombre.Trim(), registro.Edad },
                transaction);

            var idUsuario = await connection.ExecuteScalarAsync<int>(
                insertarUsuario,
                new { Email = registro.Email.Trim().ToLowerInvariant(), PasswordHash = passwordHash, IdPaciente = idPaciente },
                transaction);

            await transaction.CommitAsync();

            return new Usuario
            {
                IdUsuario = idUsuario,
                IdPaciente = idPaciente,
                Email = registro.Email.Trim().ToLowerInvariant(),
                Rol = "Paciente",
                Activo = true
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
