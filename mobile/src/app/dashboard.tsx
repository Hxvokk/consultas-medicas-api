import { Redirect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { DashboardSummary, getDashboard } from '../lib/api';
import { getApiError } from '../api/http';
import { theme } from '../constants/theme';

const numberFormat = new Intl.NumberFormat('es-MX');
const timeFormat = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' });

export default function DashboardScreen() {
  const { status, signOut } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    setError('');
    try { setSummary(await getDashboard()); }
    catch (cause) { setError(getApiError(cause, 'No se pudo cargar el dashboard.').message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let mounted = true;
    getDashboard()
      .then((data) => { if (mounted) { setSummary(data); setError(''); } })
      .catch((cause: unknown) => { if (mounted) setError(getApiError(cause, 'No se pudo cargar el dashboard.').message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  if (status === 'checking') return <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>;
  if (status !== 'authenticated') return <Redirect href="/login" />;

  return (
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSummary} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}>
      <View style={styles.header}>
        <View><Text style={styles.greeting}>Hola</Text><Text style={styles.heading}>Resumen de hoy</Text></View>
        <Pressable onPress={() => void signOut()} style={styles.signOut}><Text style={styles.signOutText}>Salir</Text></Pressable>
      </View>
      {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => void loadSummary()}><Text style={styles.retry}>Reintentar</Text></Pressable></View>}
      <View style={styles.metrics}>
        <Metric label="Pacientes" value={summary?.metricas.totalPacientes} icon="👥" />
        <Metric label="Citas hoy" value={summary?.metricas.citasHoy} icon="📅" />
      </View>
      <View style={styles.doctorsCard}><View style={styles.metricIcon}><Text>🩺</Text></View><View><Text style={styles.metricValue}>{summary ? numberFormat.format(summary.metricas.medicosActivos) : '—'}</Text><Text style={styles.metricLabel}>Médicos activos</Text></View></View>

      <SectionTitle title="Próximas citas" />
      {loading && !summary ? <ActivityIndicator style={{ marginTop: 16 }} color={theme.colors.primary} /> : summary?.proximasCitas.length ? summary.proximasCitas.map((appointment) => (
        <View style={styles.appointment} key={appointment.idCita}>
          <View style={styles.appointmentTime}><Text style={styles.time}>{timeFormat.format(new Date(appointment.fechaHora))}</Text></View>
          <View style={styles.appointmentDetails}><Text style={styles.patient}>{appointment.paciente}</Text><Text style={styles.doctor}>{appointment.medico}</Text><Text style={styles.reason}>{appointment.motivo}</Text></View>
        </View>
      )) : <View style={styles.empty}><Text style={styles.emptyTitle}>No hay próximas citas</Text><Text style={styles.emptyText}>Las citas programadas para hoy aparecerán aquí.</Text></View>}

      <SectionTitle title="Alertas" />
      {summary?.alertas.length ? summary.alertas.map((alert, index) => <View key={`${alert.tipo}-${index}`} style={styles.alert}><Text style={styles.alertText}>{alert.mensaje}</Text></View>) : <View style={styles.emptyAlert}><Text style={styles.check}>✓</Text><Text style={styles.emptyAlertText}>No hay alertas pendientes</Text></View>}
    </ScrollView>
  );
}

function Metric({ label, value, icon }: { label: string; value?: number; icon: string }) {
  return <View style={styles.metricCard}><View style={styles.metricIcon}><Text>{icon}</Text></View><Text style={styles.metricValue}>{value === undefined ? '—' : numberFormat.format(value)}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}
function SectionTitle({ title }: { title: string }) { return <Text style={styles.sectionTitle}>{title}</Text>; }

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  content: { padding: 22, paddingTop: 58, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { color: theme.colors.textSecondary, fontSize: 14 }, heading: { color: theme.colors.text, fontSize: 24, fontWeight: '700', marginTop: 3 },
  signOut: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: theme.colors.surfaceRaised }, signOutText: { color: theme.colors.primary, fontWeight: '700' },
  metrics: { flexDirection: 'row', gap: 12 }, metricCard: { flex: 1, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 18, padding: 16, minHeight: 132, elevation: 2, shadowColor: '#000000', shadowOpacity: 0.2, shadowRadius: 10 },
  metricIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: theme.colors.iconBackground, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  metricValue: { color: theme.colors.text, fontSize: 25, fontWeight: '700' }, metricLabel: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 3 },
  doctorsCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 18, padding: 16, marginTop: 12, elevation: 2, shadowColor: '#000000', shadowOpacity: 0.2, shadowRadius: 10 },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginTop: 27, marginBottom: 13 },
  appointment: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, padding: 15, borderRadius: 16, marginBottom: 10, gap: 14 }, appointmentTime: { width: 57, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: theme.colors.divider, paddingRight: 8 }, time: { color: theme.colors.primary, fontSize: 15, fontWeight: '700' },
  appointmentDetails: { flex: 1 }, patient: { color: theme.colors.text, fontSize: 15, fontWeight: '700' }, doctor: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 4 }, reason: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  empty: { alignItems: 'center', padding: 22, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16 }, emptyTitle: { color: theme.colors.textSecondary, fontWeight: '600' }, emptyText: { color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 6 },
  emptyAlert: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, backgroundColor: theme.colors.successSurface, borderRadius: 14 }, check: { color: theme.colors.success, fontSize: 18, fontWeight: '700' }, emptyAlertText: { color: theme.colors.success, fontSize: 13 },
  alert: { padding: 14, borderRadius: 12, backgroundColor: theme.colors.warningSurface, marginBottom: 8 }, alertText: { color: theme.colors.warning },
  errorBox: { padding: 14, borderRadius: 12, backgroundColor: theme.colors.errorSurface, marginBottom: 16 }, errorText: { color: theme.colors.error, fontSize: 13 }, retry: { color: theme.colors.primary, fontWeight: '700', marginTop: 8 },
});
