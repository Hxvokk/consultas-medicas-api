# Cifrado de secretos de configuración

La API protege la cadena de conexión de Supabase y `Jwt:Secret` en `appsettings.json`
con AES-256-GCM. Los valores cifrados usan el prefijo `ENC:` y se descifran al iniciar.

## Clave maestra

La clave se genera una sola vez y se almacena fuera del repositorio:

```bash
dotnet run -- --genkey
dotnet user-secrets set "Secrets:MasterKey" "<clave-generada>"
```

En producción, configura la misma clave mediante la variable de entorno
`Secrets__MasterKey`. No guardes la clave maestra en archivos versionados. Si otra
computadora necesita ejecutar esta configuración, comparte la clave por un canal
seguro; generar una clave diferente no permitirá descifrar los valores ya guardados.

## Cifrar y descifrar valores

```bash
dotnet run -- --encrypt "<valor-sensible>"
dotnet run -- --decrypt "ENC:<valor-cifrado>"
```

Copia el resultado de `--encrypt` en la ruta indicada en
`Secrets:ProtectedPaths` de `appsettings.json`. La aplicación descifra los valores
antes de configurar JWT o crear conexiones a la base de datos. No registres valores
en claro ni la clave maestra en logs o en Git.

`appsettings.Development.json` no contiene secretos. Para regenerar la clave maestra
será necesario volver a cifrar todos los valores protegidos con la nueva clave.
