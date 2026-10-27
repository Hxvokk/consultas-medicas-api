import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { theme } from '../constants/theme';

export default function RegisterScreen() {
  const { signUp, status } = useAuth();
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError('');
    if (!nombre.trim() || !edad || !email.trim() || !password) { setError('Completa todos los campos.'); return; }
    const parsedAge = Number(edad);
    if (!Number.isInteger(parsedAge) || parsedAge < 0 || parsedAge > 120) { setError('Ingresa una edad válida.'); return; }
    if (password.length < 12) { setError('La contraseña debe tener al menos 12 caracteres.'); return; }
    setLoading(true);
    try { await signUp({ nombre: nombre.trim(), edad: parsedAge, email: email.trim(), password }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo crear la cuenta.'); }
    finally { setLoading(false); }
  }

  if (status === 'checking') return <View style={styles.loading}><ActivityIndicator color={theme.colors.primary} /></View>;
  if (status === 'authenticated') return <Redirect href="/dashboard" />;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.logo}><Text style={styles.logoText}>+</Text></View>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Regístrate para continuar</Text>
          <Field label="Nombre completo" value={nombre} onChangeText={setNombre} placeholder="Tu nombre" />
          <Field label="Edad" value={edad} onChangeText={setEdad} placeholder="Edad" keyboardType="number-pad" />
          <Field label="Correo electrónico" value={email} onChangeText={setEmail} placeholder="nombre@correo.com" keyboardType="email-address" autoCapitalize="none" />
          <Field label="Contraseña" value={password} onChangeText={setPassword} placeholder="Mínimo 12 caracteres" secureTextEntry />
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.button, pressed && styles.pressed, loading && styles.disabled]} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color={theme.colors.onPrimary} /> : <Text style={styles.buttonText}>Crear cuenta</Text>}
          </Pressable>
          <Text style={styles.footer}>¿Ya tienes una cuenta? <Link href="/login" style={styles.link}>Inicia sesión</Link></Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'default' | 'email-address' | 'number-pad'; autoCapitalize?: 'none' | 'sentences'; secureTextEntry?: boolean }) {
  return <View style={styles.field}><Text style={styles.label}>{props.label}</Text><TextInput style={styles.input} value={props.value} onChangeText={props.onChangeText} placeholder={props.placeholder} placeholderTextColor={theme.colors.placeholder} keyboardType={props.keyboardType} autoCapitalize={props.autoCapitalize} secureTextEntry={props.secureTextEntry} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background }, scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  card: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 24, padding: 26, shadowColor: '#000000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 4 },
  logo: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.iconBackground, alignSelf: 'center', marginBottom: 14 }, logoText: { color: theme.colors.primary, fontSize: 38, fontWeight: '300', lineHeight: 44 },
  title: { color: theme.colors.text, fontSize: 27, fontWeight: '700', textAlign: 'center' }, subtitle: { color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 7, marginBottom: 15 },
  field: { marginTop: 12 }, label: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 7 }, input: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 14, fontSize: 14, color: theme.colors.text, backgroundColor: theme.colors.input },
  button: { height: 52, borderRadius: 13, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 22 }, buttonText: { color: theme.colors.onPrimary, fontSize: 15, fontWeight: '700' }, pressed: { opacity: 0.86 }, disabled: { opacity: 0.65 },
  error: { color: theme.colors.error, marginTop: 12, fontSize: 13 }, footer: { color: theme.colors.textSecondary, textAlign: 'center', fontSize: 13, marginTop: 20 }, link: { color: theme.colors.primary, fontWeight: '700' },
});
