# Módulo B — Consultas e historial médico

Implementación individual (Tarea 4) del backend + base de datos para el módulo de
**consultas médicas**, sobre el modelo entidad-relación definido en el ejercicio de
equipo anterior (Paciente — Consulta — Médico).

## Stack

- **ASP.NET Core Web API — .NET 8**
- **PostgreSQL en Supabase**
- **Dapper** como micro-ORM (ver justificación abajo)

## 1. Preparar la base de datos en Supabase

1. Entra a [supabase.com](https://supabase.com), crea una cuenta si no tienes, y da clic en **New project**.
2. Ponle un nombre (ej. `consultas-medicas`), elige una contraseña para la base de datos **y guárdala**, y selecciona la región más cercana.
3. Cuando el proyecto termine de crearse, ve a **Project Settings → Database**. Ahí vas a encontrar el **Connection string** (elige la variante "URI" o arma la de tipo `Host=...;Port=...`).
4. Ve a **SQL Editor → New query**, pega el contenido completo de [`Database/schema.sql`](./Database/schema.sql) y dale **Run**. Esto crea las tablas `paciente`, `medico`, `consulta` con sus llaves primarias/foráneas, y las llena con datos de prueba.
5. Copia tu connection string y pégala en `appsettings.json`, reemplazando `TU-PROYECTO` y `TU-PASSWORD`:

   ```json
   "Supabase": "Host=db.TU-PROYECTO.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=TU-PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
   ```

   > No subas `appsettings.json` con tu password real a un repositorio público. Para la entrega de clase está bien tenerlo así, pero si subes esto a GitHub, considera usar `dotnet user-secrets` o variables de entorno.

## 2. Correr el proyecto

```bash
dotnet restore
dotnet build
dotnet run
```

Al iniciar, abre en el navegador la URL que te muestre la consola (algo como
`http://localhost:5xxx/swagger`) para ver **Swagger UI**, donde puedes probar cada
endpoint sin necesidad de Postman.

## 3. Endpoints implementados

| Requisito de la tarea | Método | Endpoint |
|---|---|---|
| Registrar una consulta | POST | `/api/consultas` |
| Consultar una consulta | GET | `/api/consultas/{id}` |
| Historial de un paciente | GET | `/api/pacientes/{id}/consultas` |
| Identificar médico de una consulta | *(incluido dentro de la respuesta de `/api/consultas/{id}`, objeto `medico`)* | |
| Identificar paciente de una consulta | *(incluido dentro de la respuesta de `/api/consultas/{id}`, objeto `paciente`)* | |
| Extra: actualizar una consulta | PUT | `/api/consultas/{id}` |
| Extra: consultas de un médico | GET | `/api/medicos/{id}/consultas` |

Los dos requisitos de "identificar" no se implementaron como endpoints aparte porque
no tendría sentido — la forma natural de resolverlos es que la respuesta de una
consulta siempre venga con los datos de su paciente y su médico ya incluidos (vía
`JOIN`), en vez de que el frontend tenga que hacer una segunda llamada.

### Ejemplo — Registrar consulta

```bash
curl -X POST http://localhost:5xxx/api/consultas \
  -H "Content-Type: application/json" \
  -d '{
    "idPaciente": 1,
    "idMedico": 1,
    "fechaHora": "2026-08-30T10:30:00",
    "motivo": "Dolor de cabeza",
    "sintomas": "Dolor pulsátil, sensibilidad a la luz",
    "diagnostico": "Migraña",
    "tratamiento": "Ibuprofeno 400mg, reposo en lugar oscuro",
    "observaciones": null,
    "consultorio": "101"
  }'
```

### Ejemplo — Historial de un paciente

```bash
curl http://localhost:5xxx/api/pacientes/1/consultas
```

## 4. Arquitectura (Controller → Service → Repository)

```
Controllers/   → reciben el HTTP, validan lo básico (Data Annotations), llaman al Service, regresan la respuesta.
Services/      → reglas de negocio: ¿existe el paciente? ¿existe el médico? ¿la fecha no es futura? etc.
Repositories/  → el único lugar donde hay SQL. Abren su conexión a Postgres y usan Dapper para mapear filas a objetos.
Models/        → clases que representan filas de la base de datos.
DTOs/          → clases que representan lo que entra y sale por la API (no siempre son iguales a los Models).
Exceptions/    → excepciones de negocio (NotFound, Validation, Conflict).
Middleware/    → traduce esas excepciones a códigos HTTP (404, 400, 409) en un solo lugar.
```

Un Controller nunca habla directo con la base de datos, y un Repository nunca decide
si algo "está permitido" — esa separación es justo lo que pide la tarea.

## 5. ¿Por qué Dapper y no Entity Framework Core?

Se eligió **Dapper** en vez de EF Core por tres razones:

1. **El alcance del ejercicio es acotado** (5 operaciones mínimas sobre una sola
   entidad principal). EF Core brilla cuando el modelo es grande y cambia seguido
   (gracias a las migrations); aquí el modelo ya está cerrado desde el ejercicio de
   equipo anterior, así que esa ventaja no se aprovecha tanto.
2. **Control explícito del SQL.** Con Dapper, cada query en `Repositories/` es SQL
   plano que se puede leer, copiar a un cliente de Postgres y depurar directamente —
   no hay una capa de traducción LINQ → SQL de por medio que dificulte explicar
   "qué se ejecuta realmente" (que es justo lo que pide la tarea).
3. **Menos "magia" para justificar.** EF Core trae change tracking, lazy loading,
   convenciones automáticas de mapeo, etc. — todo eso es útil, pero también es más
   difícil de explicar a fondo en una sesión de clase si no se ha usado antes. Dapper
   es, en esencia, "ejecuta este SQL y mapea el resultado a esta clase", que es
   mucho más directo de defender.

El costo de esta elección es que el mapeo objeto-relacional es manual (hay que
escribir el SQL de cada operación a mano), y no hay migrations automáticas — los
cambios al esquema se hacen a mano en `Database/schema.sql`.

## 6. Datos de prueba incluidos

El script de la base de datos ya inserta:
- 3 pacientes (`id_paciente` 1, 2, 3)
- 3 médicos (`id_medico` 1, 2, 3)
- 3 consultas de ejemplo, para poder probar de inmediato `GET /api/consultas/1` y
  `GET /api/pacientes/1/consultas` sin tener que registrar nada primero.

## Pendiente / fuera de alcance de este módulo

- El CRUD completo de `paciente` y `medico` (registrar, listar, actualizar) es el
  **Módulo A**, que le corresponde a otro compañero — aquí solo se leen para validar
  existencia y mostrar su nombre dentro de una consulta.
