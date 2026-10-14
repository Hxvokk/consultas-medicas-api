# API de consultas médicas

Backend para registrar consultas y consultar el historial de pacientes. También
incluye registro de pacientes, inicio de sesión y autenticación con JWT.

## Tecnologías

- ASP.NET Core Web API (.NET 10)
- PostgreSQL en Supabase
- Dapper para las consultas SQL
- BCrypt para proteger contraseñas
- JWT para autenticar usuarios

## Antes de iniciar

Necesitas una base de datos de Supabase y una cadena de conexión válida.

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Copia la cadena de conexión desde **Connect**. El *Session Pooler* suele ser la
   opción más conveniente para desarrollo local.
3. Configurá la conexión y JWT en `appsettings.Development.json`. Este archivo está
   ignorado por Git para no publicar contraseñas ni secretos.

Ejemplo de configuración local:

```json
{
  "ConnectionStrings": {
    "Supabase": "Host=TU-HOST;Port=5432;Database=postgres;Username=TU-USUARIO;Password=TU-PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
  },
  "Jwt": {
    "Secret": "UnaClaveLargaYPrivadaDeAlMenos32Caracteres",
    "Issuer": "ConsultasMedicasApi",
    "Audience": "ConsultasMedicasApi"
  }
}
```

> No subas este archivo ni claves reales al repositorio.

### Preparar la base de datos

Para una base nueva, ejecuta todo el contenido de
[`Database/schema.sql`](./Database/schema.sql) desde el **SQL Editor** de Supabase.
El script crea las tablas y carga datos de ejemplo.

> Atención: `schema.sql` elimina y vuelve a crear las tablas. Si ya tienes datos,
> aplicá solamente una migración que agregue la tabla `usuario`; no ejecutes el
> script completo.

## Ejecutar la API

```bash
dotnet restore
dotnet build
ASPNETCORE_ENVIRONMENT=Development dotnet run
```

Abre la URL que aparece en la consola y agrega `/swagger`. Desde Swagger se pueden
probar todos los endpoints.

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/consultas` | Registra una consulta médica. |
| `GET` | `/api/consultas/{id}` | Obtiene una consulta con su paciente y médico. |
| `PUT` | `/api/consultas/{id}` | Actualiza una consulta. |
| `GET` | `/api/pacientes/{id}/consultas` | Muestra el historial de un paciente. |
| `GET` | `/api/medicos/{id}/consultas` | Muestra las consultas realizadas por un médico. |
| `POST` | `/api/auth/registro` | Crea un paciente y su cuenta de acceso. |
| `POST` | `/api/auth/login` | Valida credenciales y devuelve un JWT. |
| `GET` | `/api/auth/perfil` | Comprueba un JWT y devuelve los datos del usuario autenticado. |

### Ejemplo: registrar una consulta

```json
{
  "idPaciente": 1,
  "idMedico": 1,
  "fechaHora": "2026-08-30T10:30:00",
  "motivo": "Dolor de cabeza",
  "sintomas": "Dolor pulsátil, sensibilidad a la luz",
  "diagnostico": "Migraña",
  "tratamiento": "Ibuprofeno 400mg y reposo",
  "observaciones": null,
  "consultorio": "101"
}
```

## Autenticación

### Registro

`POST /api/auth/registro`

```json
{
  "nombre": "Ana Martínez",
  "edad": 29,
  "email": "ana@correo.com",
  "password": "UnaClaveSegura123!"
}
```

El sistema crea el perfil del paciente y su cuenta en una misma transacción. La
contraseña se almacena como hash de BCrypt, nunca como texto plano.

### Inicio de sesión

`POST /api/auth/login`

```json
{
  "email": "ana@correo.com",
  "password": "UnaClaveSegura123!"
}
```

Si las credenciales son correctas, la respuesta incluye `accessToken`. El token dura
60 minutos y contiene el identificador, correo, rol y perfil asociado al usuario.

### Usar el token

En Swagger, primero inicia sesión. Después haz clic en **Authorize** y pega solo el
valor de `accessToken`. Swagger agrega el encabezado automáticamente:

```http
Authorization: Bearer <accessToken>
```

Luego puedes probar `GET /api/auth/perfil`. Sin token, la API responde `401 Unauthorized`.

## Organización del proyecto

```text
Controllers/   Reciben las peticiones HTTP y devuelven las respuestas.
Services/      Contienen las reglas de negocio y la generación de JWT.
Repositories/  Ejecutan SQL con Dapper y se conectan a PostgreSQL.
DTOs/          Definen los datos que entran y salen por la API.
Models/        Representan las entidades usadas por la aplicación.
Database/      Contiene el script de creación de tablas y datos de prueba.
```

La idea es que el controlador no tenga reglas de negocio ni SQL. Por ejemplo,
`AuthController` recibe el login, `AuthService` revisa la contraseña y crea el JWT,
y `AuthRepository` busca al usuario en Supabase.

## ¿Por qué Dapper?

Para este proyecto se eligió Dapper porque el modelo es pequeño y las consultas son
claras. Permite escribir el SQL de forma directa, verlo fácilmente y explicar qué se
ejecuta en la base de datos. A cambio, el mapeo y los cambios de esquema se hacen de
forma manual.

## Alcance actual

El proyecto cubre consultas médicas, historial y autenticación de pacientes. El CRUD
completo de pacientes y médicos no forma parte de este módulo.
