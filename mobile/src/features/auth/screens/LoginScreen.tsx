import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../../../shared/constants/theme';

export default function LoginScreen() {
  const { signIn, status } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError('');
    if (!email.trim() || !password) { setError('Ingresa tu correo y contraseña.'); return; }
    setLoading(true);
    try { await signIn(email.trim(), password); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión.'); }
    finally { setLoading(false); }
  }

  if (status === 'checking') return <View style={styles.loading}><ActivityIndicator color={theme.colors.primary} /></View>;
  if (status === 'authenticated') return <Redirect href="/dashboard" />;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <View style={styles.logo}><Text style={styles.logoText}>+</Text></View>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="nombre@correo.com" placeholderTextColor={theme.colors.placeholder} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <Text style={styles.label}>Contraseña</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Tu contraseña" placeholderTextColor={theme.colors.placeholder} secureTextEntry autoComplete="password" onSubmitEditing={submit} />
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.button, pressed && styles.pressed, loading && styles.disabled]} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color={theme.colors.onPrimary} /> : <Text style={styles.buttonText}>Iniciar sesión</Text>}
        </Pressable>
        <Text style={styles.footer}>¿No tienes una cuenta? <Link href="/register" style={styles.link}>Crear cuenta</Link></Text>
        <Text style={styles.brand}>Consultas Médicas</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  card: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 24, padding: 26, shadowColor: '#000000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 4 },
  logo: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.iconBackground, alignSelf: 'center', marginBottom: 20 },
  logoText: { color: theme.colors.primary, fontSize: 42, fontWeight: '300', lineHeight: 48 },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: theme.colors.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 8, marginBottom: 30 },
  label: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: { height: 52, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 14, fontSize: 15, color: theme.colors.text, backgroundColor: theme.colors.input },
  button: { height: 54, borderRadius: 13, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 26 },
  buttonText: { color: theme.colors.onPrimary, fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.86 }, disabled: { opacity: 0.65 },
  error: { color: theme.colors.error, marginTop: 12, fontSize: 13 },
  footer: { color: theme.colors.textSecondary, textAlign: 'center', fontSize: 13, marginTop: 22 },
  link: { color: theme.colors.primary, fontWeight: '700' },
  brand: { color: theme.colors.textMuted, textAlign: 'center', fontSize: 12, marginTop: 18 },
});
