import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../../../shared/constants/theme';
import { AppIcon } from '../../../shared/components/AppIcon';
import type { AppIconName } from '../../../shared/components/AppIcon';

type AuthFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon: AppIconName;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences';
  secureTextEntry?: boolean;
  autoComplete?: 'email' | 'password' | 'name' | 'off';
  onSubmitEditing?: () => void;
  rightElement?: ReactNode;
};

export function AuthField(props: AuthFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <View style={styles.inputContainer}>
        <AppIcon name={props.icon} color={theme.colors.textSecondary} size={20} />
        <TextInput
          style={styles.input}
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          placeholderTextColor={theme.colors.placeholder}
          keyboardType={props.keyboardType}
          autoCapitalize={props.autoCapitalize}
          secureTextEntry={props.secureTextEntry}
          autoComplete={props.autoComplete}
          onSubmitEditing={props.onSubmitEditing}
        />
        {props.rightElement}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginTop: 12 },
  label: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 7 },
  inputContainer: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 13, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 15, backgroundColor: theme.colors.input },
  input: { flex: 1, minWidth: 0, height: '100%', padding: 0, fontSize: 14, color: theme.colors.text },
});
