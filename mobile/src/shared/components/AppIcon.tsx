import { SymbolView } from 'expo-symbols';

const symbols = {
  arrowRight: { ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' },
  bell: { ios: 'bell', android: 'notifications', web: 'notifications' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  doctor: { ios: 'stethoscope', android: 'medical_services', web: 'medical_services' },
  eye: { ios: 'eye', android: 'visibility', web: 'visibility' },
  eyeSlash: { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' },
  home: { ios: 'house.fill', android: 'home_filled', web: 'home_filled' },
  lock: { ios: 'lock.fill', android: 'lock', web: 'lock' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' },
  mail: { ios: 'envelope', android: 'mail', web: 'mail' },
  patients: { ios: 'person.2.fill', android: 'group', web: 'group' },
  person: { ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' },
} as const;

export type AppIconName = keyof typeof symbols;

type AppIconProps = {
  name: AppIconName;
  color: string;
  size?: number;
};

export function AppIcon({ name, color, size = 20 }: AppIconProps) {
  return <SymbolView name={symbols[name]} tintColor={color} size={size} />;
}
