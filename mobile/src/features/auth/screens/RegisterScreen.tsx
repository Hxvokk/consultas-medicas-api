import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuthField } from '../components/AuthField';
import { useAuth } from '../hooks/useAuth';
import { AppIcon } from '../../../shared/components/AppIcon';
import { MedicalBrand } from '../../../shared/components/MedicalBrand';
import { PrimaryActionButton } from '../../../shared/components/PrimaryActionButton';
import { theme } from '../../../shared/constants/theme';

export default function RegisterScreen() {
  const { signUp, status } = useAuth();
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
          <View pointerEvents="none" style={styles.cardArc} />
          <MedicalBrand title="Crear cuenta" subtitle="Regístrate para gestionar tus consultas médicas" />
          <View style={styles.form}>
            <AuthField label="Nombre completo" icon="person" value={nombre} onChangeText={setNombre} placeholder="Tu nombre" autoComplete="name" />
            <AuthField label="Edad" icon="calendar" value={edad} onChangeText={setEdad} placeholder="Edad" keyboardType="number-pad" />
            <AuthField label="Correo electrónico" icon="mail" value={email} onChangeText={setEmail} placeholder="nombre@correo.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            <AuthField
              label="Contraseña"
              icon="lock"
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 12 caracteres"
              secureTextEntry={!showPassword}
              autoComplete="password"
              rightElement={(
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onPress={() => setShowPassword((visible) => !visible)}
                  hitSlop={10}
                >
                  <AppIcon name={showPassword ? 'eyeSlash' : 'eye'} color={theme.colors.textSecondary} size={20} />
                </Pressable>
              )}
            />
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
            <PrimaryActionButton label="Crear cuenta" loading={loading} onPress={() => void submit()} />
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
            <Link href="/login" style={styles.link}>Inicia sesión</Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 28 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  card: { width: '100%', maxWidth: 520, alignSelf: 'center', overflow: 'hidden', backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 28, paddingHorizontal: 28, paddingTop: 34, paddingBottom: 28, shadowColor: '#000000', shadowOpacity: 0.38, shadowRadius: 30, elevation: 8 },
  cardArc: { position: 'absolute', width: 260, height: 260, top: -155, right: -105, borderRadius: 130, borderWidth: 1, borderColor: 'rgba(0, 211, 239, 0.24)' },
  form: { marginTop: 28 },
  error: { color: theme.colors.error, marginTop: 14, fontSize: 13, lineHeight: 18 },
  footer: { borderTopWidth: 1, borderTopColor: theme.colors.divider, marginTop: 28, paddingTop: 23, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 8 },
  footerText: { color: theme.colors.textSecondary, fontSize: 14 },
  link: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },
});
