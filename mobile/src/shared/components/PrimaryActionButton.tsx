import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { theme } from '../constants/theme';

type PrimaryActionButtonProps = {
  label: string;
  loading?: boolean;
  onPress: () => void;
};

export function PrimaryActionButton({ label, loading = false, onPress }: PrimaryActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: loading, busy: loading }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, loading && styles.disabled]}
      onPress={onPress}
      disabled={loading}
    >
      <LinearGradient colors={['#08B7F4', '#00C9D9']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.gradient}>
        {loading ? (
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <View style={styles.content}>
            <Text style={styles.label}>{label}</Text>
            <AppIcon name="arrowRight" color={theme.colors.onPrimary} size={21} />
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { height: 60, borderRadius: 15, marginTop: 26, shadowColor: '#00BDEB', shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  gradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 15, paddingHorizontal: 22 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18 },
  label: { color: '#F5FCFF', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.7 },
});
