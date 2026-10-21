using System.Security.Cryptography;
using System.Text;

namespace ConsultasMedicasApi.Helpers.Security;

public interface ISecretProtector
{
    string Encrypt(string plaintext);
    string Decrypt(string value);
    bool IsProtected(string? value);
}

/// <summary>Cifra valores de configuración con AES-256-GCM.</summary>
public sealed class SecretProtector : ISecretProtector
{
    public const string Prefix = "ENC:";
    private const int NonceLength = 12;
    private const int TagLength = 16;
    private readonly byte[]? _key;

    public SecretProtector(string? masterKey)
    {
        if (!string.IsNullOrWhiteSpace(masterKey))
            _key = SHA256.HashData(Encoding.UTF8.GetBytes(masterKey.Trim()));
    }

    public bool IsProtected(string? value) =>
        value is not null && value.StartsWith(Prefix, StringComparison.Ordinal);

    public string Encrypt(string plaintext)
    {
        ArgumentNullException.ThrowIfNull(plaintext);
        var key = GetKey();
        var nonce = RandomNumberGenerator.GetBytes(NonceLength);
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
        var ciphertext = new byte[plaintextBytes.Length];
        var tag = new byte[TagLength];

        using (var aes = new AesGcm(key, TagLength))
            aes.Encrypt(nonce, plaintextBytes, ciphertext, tag);

        var payload = new byte[NonceLength + TagLength + ciphertext.Length];
        nonce.CopyTo(payload, 0);
        tag.CopyTo(payload, NonceLength);
        ciphertext.CopyTo(payload, NonceLength + TagLength);
        return Prefix + Convert.ToBase64String(payload);
    }

    public string Decrypt(string value)
    {
        ArgumentNullException.ThrowIfNull(value);
        if (!IsProtected(value))
            return value;

        byte[] payload;
        try
        {
            payload = Convert.FromBase64String(value[Prefix.Length..]);
        }
        catch (FormatException ex)
        {
            throw new InvalidOperationException("El valor ENC: no contiene Base64 válido.", ex);
        }

        if (payload.Length < NonceLength + TagLength)
            throw new InvalidOperationException("El valor ENC: está incompleto o dañado.");

        var nonce = payload.AsSpan(0, NonceLength);
        var tag = payload.AsSpan(NonceLength, TagLength);
        var ciphertext = payload.AsSpan(NonceLength + TagLength);
        var plaintext = new byte[ciphertext.Length];

        try
        {
            using var aes = new AesGcm(GetKey(), TagLength);
            aes.Decrypt(nonce, ciphertext, tag, plaintext);
        }
        catch (CryptographicException ex)
        {
            throw new InvalidOperationException(
                "No se pudo descifrar un valor ENC:. Verifica la clave maestra y que el valor no haya sido modificado.", ex);
        }

        return Encoding.UTF8.GetString(plaintext);
    }

    public static string GenerateKey() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

    private byte[] GetKey() => _key ?? throw new InvalidOperationException(
        "No se configuró la clave maestra. Define Secrets:MasterKey con user-secrets o la variable Secrets__MasterKey.");
}
