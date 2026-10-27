import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { AuthField } from '../components/AuthField';
import { useAuth } from '../hooks/useAuth';
import { AppIcon } from '../../../shared/components/AppIcon';
import { MedicalBrand } from '../../../shared/components/MedicalBrand';
import { PrimaryActionButton } from '../../../shared/components/PrimaryActionButton';
import { theme } from '../../../shared/constants/theme';

export default function LoginScreen() {
  const { signIn, status } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View pointerEvents="none" style={styles.cardArc} />
          <MedicalBrand subtitle="Gestiona tus citas y pacientes de forma simple y segura" />
          <View style={styles.form}>
            <AuthField
              label="Correo electrónico"
              icon="mail"
              value={email}
              onChangeText={setEmail}
              placeholder="nombre@correo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <AuthField
              label="Contraseña"
              icon="lock"
              value={password}
              onChangeText={setPassword}
              placeholder="Tu contraseña"
              secureTextEntry={!showPassword}
              autoComplete="password"
              onSubmitEditing={submit}
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
            <PrimaryActionButton label="Iniciar sesión" loading={loading} onPress={() => void submit()} />
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Aún no estás registrado?</Text>
            <Link href="/register" style={styles.registerLink}>Crear cuenta <Text style={styles.arrow}>→</Text></Link>
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
  card: { width: '100%', maxWidth: 520, alignSelf: 'center', overflow: 'hidden', backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 28, paddingHorizontal: 28, paddingTop: 42, paddingBottom: 30, shadowColor: '#000000', shadowOpacity: 0.38, shadowRadius: 30, elevation: 8 },
  cardArc: { position: 'absolute', width: 300, height: 300, top: -175, right: -120, borderRadius: 150, borderWidth: 1, borderColor: 'rgba(0, 211, 239, 0.24)' },
  glowTop: { position: 'absolute', width: 260, height: 260, top: -160, right: -120, borderRadius: 130, backgroundColor: 'rgba(0, 172, 224, 0.07)' },
  glowBottom: { position: 'absolute', width: 240, height: 240, bottom: -150, left: -145, borderRadius: 120, backgroundColor: 'rgba(27, 105, 229, 0.07)' },
  form: { marginTop: 42 },
  error: { color: theme.colors.error, marginTop: 14, fontSize: 13, lineHeight: 18 },
  footer: { borderTopWidth: 1, borderTopColor: theme.colors.divider, marginTop: 34, paddingTop: 26, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 8 },
  footerText: { color: theme.colors.textSecondary, fontSize: 14 },
  registerLink: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },
  arrow: { color: theme.colors.primary, fontWeight: '700' },
});
