import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

export const COLORS = {
  bg: '#F6F7FB',
  card: '#FFFFFF',
  primary: '#2196F3',
  text: '#111827',
  subText: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
};

export const Screen: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({children, style}) => <View style={[styles.screen, style]}>{children}</View>;

export const Header: React.FC<{
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}> = ({title, subtitle, right}) => (
  <View style={styles.header}>
    <View style={{flex: 1}}>
      <Text style={styles.hTitle}>{title}</Text>
      {subtitle ? <Text style={styles.hSubtitle}>{subtitle}</Text> : null}
    </View>
    {right}
  </View>
);

export const Card: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({children, style}) => <View style={[styles.card, style]}>{children}</View>;

export const Button: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}> = ({title, onPress, variant = 'primary', disabled, style, textStyle}) => {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        isPrimary && styles.btnPrimary,
        variant === 'secondary' && styles.btnSecondary,
        isDanger && styles.btnDanger,
        disabled && {opacity: 0.6},
        style,
      ]}>
      <Text
        style={[
          styles.btnText,
          isPrimary && {color: '#fff'},
          isDanger && {color: '#fff'},
          variant === 'secondary' && {color: COLORS.text},
          textStyle,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export const LoadingBlock: React.FC<{title?: string}> = ({title = 'Đang tải...'}) => (
  <View style={styles.loading}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.bg, padding: 16},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  hTitle: {fontSize: 22, fontWeight: '800', color: COLORS.text},
  hSubtitle: {marginTop: 4, color: COLORS.subText},
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btn: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  btnPrimary: {backgroundColor: COLORS.primary},
  btnSecondary: {backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border},
  btnDanger: {backgroundColor: COLORS.danger},
  btnText: {fontSize: 15, fontWeight: '700'},
  loading: {alignItems: 'center', justifyContent: 'center', padding: 24},
  loadingText: {marginTop: 10, color: COLORS.subText, fontWeight: '600'},
});

