using System.Text.Json;
using System.Text.Json.Nodes;

namespace ConsultasMedicasApi.Helpers.Security;

public static class SecureConfiguration
{
    /// <summary>Descifra los valores ENC: y los agrega como fuente de configuración de mayor prioridad.</summary>
    public static int DecryptProtectedValues(this IConfigurationManager configuration, ISecretProtector protector)
    {
        var plaintextOverrides = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        foreach (var (key, value) in configuration.AsEnumerable())
        {
            if (protector.IsProtected(value))
                plaintextOverrides[key] = protector.Decrypt(value!);
        }

        if (plaintextOverrides.Count > 0)
            configuration.AddInMemoryCollection(plaintextOverrides);

        return plaintextOverrides.Count;
    }

    /// <summary>Imprime una copia de appsettings.json con las rutas protegidas cifradas.</summary>
    public static void PrintEncryptedSnapshot(
        IHostEnvironment environment,
        ISecretProtector protector,
        IReadOnlyCollection<string> protectedPaths)
    {
        var path = Path.Combine(environment.ContentRootPath, "appsettings.json");
        if (!File.Exists(path))
            return;

        var root = JsonNode.Parse(File.ReadAllText(path));
        if (root is not null)
            ProtectNode(root, string.Empty, protector, protectedPaths);

        Console.WriteLine("Copia este JSON en appsettings.json para guardar los valores cifrados:");
        Console.WriteLine(root?.ToJsonString(new JsonSerializerOptions { WriteIndented = true }));
    }

    private static void ProtectNode(
        JsonNode node,
        string parentPath,
        ISecretProtector protector,
        IReadOnlyCollection<string> protectedPaths)
    {
        if (node is JsonObject obj)
        {
            foreach (var property in obj.ToList())
            {
                var path = string.IsNullOrEmpty(parentPath) ? property.Key : $"{parentPath}:{property.Key}";
                if (property.Value is null)
                    continue;

                if (property.Value is JsonValue valueNode && valueNode.TryGetValue<string>(out var value))
                {
                    if (!string.IsNullOrEmpty(value) && IsProtectedPath(path, protectedPaths) && !protector.IsProtected(value))
                        obj[property.Key] = protector.Encrypt(value);
                }
                else
                {
                    ProtectNode(property.Value, path, protector, protectedPaths);
                }
            }
        }
        else if (node is JsonArray array)
        {
            for (var index = 0; index < array.Count; index++)
            {
                if (array[index] is not null)
                    ProtectNode(array[index]!, $"{parentPath}:{index}", protector, protectedPaths);
            }
        }
    }

    private static bool IsProtectedPath(string path, IReadOnlyCollection<string> protectedPaths) =>
        protectedPaths.Any(protectedPath =>
            path.Equals(protectedPath, StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith(protectedPath + ":", StringComparison.OrdinalIgnoreCase));
}
