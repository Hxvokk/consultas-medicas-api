import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { theme } from '../constants/theme';

export default function IndexScreen() {
  const { status } = useAuth();
  if (status === 'checking') return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}><ActivityIndicator color={theme.colors.primary} /></View>;
  return <Redirect href={status === 'authenticated' ? '/dashboard' : '/login'} />;
}
