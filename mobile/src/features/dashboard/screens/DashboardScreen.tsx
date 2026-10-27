import { Redirect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/hooks/useAuth';
import { getDashboard } from '../api/dashboardApi';
import type { DashboardSummary } from '../types/dashboard';
import { AppIcon } from '../../../shared/components/AppIcon';
import type { AppIconName } from '../../../shared/components/AppIcon';
import { getApiError } from '../../../shared/api/http';
import { theme } from '../../../shared/constants/theme';

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
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSummary} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.greeting}>Hola</Text>
            <Text style={styles.heading}>Resumen de hoy</Text>
            <Text style={styles.subtitle}>Aquí tienes la información de tus consultas.</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.iconButton}>
              <AppIcon name="bell" color={theme.colors.textSecondary} size={21} />
              {!!summary?.alertas.length && <View style={styles.notificationDot} />}
            </View>
            <View style={styles.avatar}>
              <AppIcon name="person" color={theme.colors.text} size={24} />
            </View>
          </View>
        </View>

        <View style={styles.signOutRow}>
          <Pressable onPress={() => void signOut()} style={styles.signOut} accessibilityRole="button">
            <AppIcon name="logout" color={theme.colors.textSecondary} size={17} />
            <Text style={styles.signOutText}>Salir</Text>
          </Pressable>
        </View>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => void loadSummary()} accessibilityRole="button"><Text style={styles.retry}>Reintentar</Text></Pressable>
          </View>
        )}

        <View style={styles.metrics}>
          <Metric label="Pacientes" value={summary?.metricas.totalPacientes} icon="patients" accent={theme.colors.primary} accentSurface={theme.colors.iconBackground} />
          <Metric label="Citas hoy" value={summary?.metricas.citasHoy} icon="calendar" accent={theme.colors.purple} accentSurface={theme.colors.purpleSurface} />
          <Metric label="Médicos activos" value={summary?.metricas.medicosActivos} icon="doctor" accent={theme.colors.success} accentSurface={theme.colors.successSurface} />
        </View>

        <View style={styles.sectionHeader}>
          <SectionTitle title="Próximas citas" />
        </View>
        {loading && !summary ? (
          <ActivityIndicator style={styles.activity} color={theme.colors.primary} />
        ) : summary?.proximasCitas.length ? (
          summary.proximasCitas.map((appointment) => (
            <View style={styles.appointment} key={appointment.idCita}>
              <View style={styles.appointmentTime}>
                <Text style={styles.time}>{timeFormat.format(new Date(appointment.fechaHora))}</Text>
                <View style={styles.timelineDot} />
              </View>
              <View style={styles.appointmentDetails}>
                <Text style={styles.patient} numberOfLines={1}>{appointment.paciente}</Text>
                <Text style={styles.doctor} numberOfLines={1}>{appointment.medico}</Text>
              </View>
              <AppointmentStatus status={appointment.estado} />
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No hay próximas citas</Text>
            <Text style={styles.emptyText}>Las citas programadas para hoy aparecerán aquí.</Text>
          </View>
        )}

        <SectionTitle title="Alertas" />
        {summary?.alertas.length ? (
          summary.alertas.map((alert, index) => (
            <View key={`${alert.tipo}-${index}`} style={styles.alert}>
              <Text style={styles.alertText}>{alert.mensaje}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyAlert}>
            <View style={styles.checkCircle}><AppIcon name="check" color={theme.colors.success} size={20} /></View>
            <View style={styles.alertCopy}>
              <Text style={styles.emptyAlertText}>No hay alertas pendientes</Text>
              <Text style={styles.emptyAlertSubtext}>Todo al día</Text>
            </View>
            <AppIcon name="chevronRight" color={theme.colors.textSecondary} size={19} />
          </View>
        )}
      </ScrollView>
      <View style={styles.bottomBar}>
        <View style={styles.activeTab}>
          <AppIcon name="home" color={theme.colors.primary} size={23} />
          <Text style={styles.activeTabText}>Inicio</Text>
          <View style={styles.activeDot} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Metric({ label, value, icon, accent, accentSurface }: { label: string; value?: number; icon: AppIconName; accent: string; accentSurface: string }) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: accentSurface }]}><AppIcon name={icon} color={accent} size={21} /></View>
      <Text style={styles.metricValue}>{value === undefined ? '—' : numberFormat.format(value)}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}
function SectionTitle({ title }: { title: string }) { return <Text style={styles.sectionTitle}>{title}</Text>; }

function AppointmentStatus({ status }: { status: string }) {
  const appearance = {
    Confirmada: { backgroundColor: theme.colors.successSurface, color: theme.colors.success },
    Programada: { backgroundColor: theme.colors.warningSurface, color: theme.colors.warning },
    Atendida: { backgroundColor: theme.colors.purpleSurface, color: theme.colors.purple },
    Cancelada: { backgroundColor: theme.colors.errorSurface, color: theme.colors.error },
  }[status] ?? { backgroundColor: theme.colors.surfaceRaised, color: theme.colors.textSecondary };

  return <View style={[styles.statusBadge, { backgroundColor: appearance.backgroundColor }]}><Text style={[styles.statusText, { color: appearance.color }]}>{status}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 },
  headerCopy: { flex: 1, minWidth: 0 },
  greeting: { color: theme.colors.textSecondary, fontSize: 15 },
  heading: { color: theme.colors.text, fontSize: 27, fontWeight: '700', marginTop: 5 },
  subtitle: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 7 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { width: 38, height: 42, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', width: 6, height: 6, top: 7, right: 7, borderRadius: 3, backgroundColor: theme.colors.primary },
  avatar: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 23, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceRaised },
  signOutRow: { alignItems: 'flex-end', marginTop: 12, marginBottom: 22 },
  signOut: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  signOutText: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: { flexGrow: 1, flexBasis: '28%', minWidth: 88, minHeight: 136, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 18, padding: 13, backgroundColor: theme.colors.surface, shadowColor: '#000000', shadowOpacity: 0.22, shadowRadius: 12, elevation: 3 },
  metricIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  metricValue: { color: theme.colors.text, fontSize: 25, fontWeight: '700' },
  metricLabel: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 16, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginTop: 28, marginBottom: 13 },
  activity: { marginTop: 18 },
  appointment: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, backgroundColor: theme.colors.surface, paddingHorizontal: 13, paddingVertical: 12, marginBottom: 9 },
  appointmentTime: { width: 61, minHeight: 45, justifyContent: 'center', borderRightWidth: 1, borderRightColor: theme.colors.divider, paddingRight: 8 },
  time: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },
  timelineDot: { position: 'absolute', right: -5, width: 9, height: 9, borderRadius: 5, backgroundColor: '#3AAEF1', borderWidth: 1, borderColor: theme.colors.surface },
  appointmentDetails: { flex: 1, minWidth: 0 },
  patient: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  doctor: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 5 },
  statusBadge: { maxWidth: 96, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7 },
  statusText: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  empty: { alignItems: 'center', padding: 22, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, borderRadius: 16 },
  emptyTitle: { color: theme.colors.textSecondary, fontWeight: '600' },
  emptyText: { color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 6 },
  emptyAlert: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderWidth: 1, borderColor: 'rgba(19, 222, 192, 0.18)', backgroundColor: theme.colors.successSurface, borderRadius: 16 },
  checkCircle: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: 'rgba(19, 222, 192, 0.12)' },
  alertCopy: { flex: 1 },
  emptyAlertText: { color: theme.colors.success, fontSize: 13, fontWeight: '600' },
  emptyAlertSubtext: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 4 },
  alert: { padding: 14, borderRadius: 12, backgroundColor: theme.colors.warningSurface, marginBottom: 8 },
  alertText: { color: theme.colors.warning, fontSize: 13 },
  errorBox: { padding: 14, borderRadius: 12, backgroundColor: theme.colors.errorSurface, marginBottom: 16 },
  errorText: { color: theme.colors.error, fontSize: 13 },
  retry: { color: theme.colors.primary, fontWeight: '700', marginTop: 8 },
  bottomBar: { alignItems: 'center', justifyContent: 'center', minHeight: 68, marginHorizontal: 20, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 22, backgroundColor: theme.colors.surfaceRaised },
  activeTab: { minWidth: 80, alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 8 },
  activeTabText: { color: theme.colors.primary, fontSize: 11, fontWeight: '600' },
  activeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: theme.colors.primary },
});
