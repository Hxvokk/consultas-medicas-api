namespace ConsultasMedicasApi.Exceptions;

// Se lanza cuando un recurso (consulta, paciente, médico) no existe.
// El middleware la traduce a un HTTP 404.
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

// Se lanza cuando la solicitud no cumple una regla de negocio
// (ej. campos faltantes, fecha futura). El middleware la traduce a un HTTP 400.
public class ValidationException : Exception
{
    public ValidationException(string message) : base(message) { }
}

// Se lanza ante un conflicto (ej. intento de duplicar un registro).
// El middleware la traduce a un HTTP 409.
public class ConflictException : Exception
{
    public ConflictException(string message) : base(message) { }
}
