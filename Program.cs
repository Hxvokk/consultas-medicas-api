using ConsultasMedicasApi.Middleware;
using ConsultasMedicasApi.Repositories;
using ConsultasMedicasApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Controllers + Swagger (documentación interactiva de la API)
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Inyección de dependencias: una implementación por interfaz, con ciclo de vida
// "Scoped" (una instancia por solicitud HTTP), que es lo recomendado para
// repositorios que abren su propia conexión a base de datos.
builder.Services.AddScoped<IPacienteRepository, PacienteRepository>();
builder.Services.AddScoped<IMedicoRepository, MedicoRepository>();
builder.Services.AddScoped<IConsultaRepository, ConsultaRepository>();
builder.Services.AddScoped<IConsultaService, ConsultaService>();

var app = builder.Build();

// Swagger disponible siempre (útil para que el profesor lo pruebe en clase
// sin depender de configurar el entorno como "Development").
app.UseSwagger();
app.UseSwaggerUI();

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseAuthorization();
app.MapControllers();

app.Run();
