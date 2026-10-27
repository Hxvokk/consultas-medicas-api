import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

type MedicalBrandProps = {
  title?: string;
  subtitle: string;
};

export function MedicalBrand({ title = 'Consultas Médicas', subtitle }: MedicalBrandProps) {
  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <LinearGradient colors={['#48F2F0', '#00A6E8']} style={styles.verticalBar} />
        <LinearGradient colors={['#48F2F0', '#00A6E8']} style={styles.horizontalBar} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  mark: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  verticalBar: { position: 'absolute', width: 24, height: 72, borderRadius: 12, shadowColor: theme.colors.primary, shadowOpacity: 0.7, shadowRadius: 16, elevation: 8 },
  horizontalBar: { position: 'absolute', width: 72, height: 24, borderRadius: 12, shadowColor: theme.colors.primary, shadowOpacity: 0.7, shadowRadius: 16, elevation: 8 },
  title: { color: theme.colors.text, fontSize: 27, lineHeight: 34, fontWeight: '700', textAlign: 'center' },
  subtitle: { maxWidth: 290, color: theme.colors.textSecondary, fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 10 },
});
