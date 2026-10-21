using System.Text;
using ConsultasMedicasApi.Helpers.Security;
using ConsultasMedicasApi.Repositories;
using ConsultasMedicasApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

if (args.Length == 1 && args[0] == "--genkey")
{
    Console.WriteLine(SecretProtector.GenerateKey());
    return;
}

var builder = WebApplication.CreateBuilder(args);

if (args.Length > 0 && args[0] is "--encrypt" or "--decrypt")
{
    if (args.Length != 2)
        throw new ArgumentException("Uso: dotnet run -- --encrypt|--decrypt <valor>");

    var commandProtector = new SecretProtector(builder.Configuration["Secrets:MasterKey"]);
    Console.WriteLine(args[0] == "--encrypt"
        ? commandProtector.Encrypt(args[1])
        : commandProtector.Decrypt(args[1]));
    return;
}

var secretProtector = new SecretProtector(builder.Configuration["Secrets:MasterKey"]);
var decryptedSecrets = builder.Configuration.DecryptProtectedValues(secretProtector);
Console.WriteLine($"Configuración: {decryptedSecrets} secreto(s) ENC: descifrado(s) en memoria.");
builder.Services.AddSingleton<ISecretProtector>(secretProtector);

#if DEBUG
if (builder.Configuration.GetValue("Secrets:PrintEncryptedSnapshot", false))
{
    var protectedPaths = builder.Configuration.GetSection("Secrets:ProtectedPaths").Get<string[]>() ?? [];
    SecureConfiguration.PrintEncryptedSnapshot(builder.Environment, secretProtector, protectedPaths);
}
#endif

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Pega únicamente el token JWT generado por /api/auth/login."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings.GetValue<string>("Secret")
    ?? throw new InvalidOperationException("No se configuró Jwt:Secret.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.GetValue<string>("Issuer"),
        ValidAudience = jwtSettings.GetValue<string>("Audience"),
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();
builder.Services.AddScoped<IPacienteRepository, PacienteRepository>();
builder.Services.AddScoped<IMedicoRepository, MedicoRepository>();
builder.Services.AddScoped<IConsultaRepository, ConsultaRepository>();
builder.Services.AddScoped<IConsultaService, ConsultaService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
