import { Link } from 'expo-router';
import { type ReactNode } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useThemeMode } from '@/providers/ThemeProvider';

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

const authBackground = require('@/assets/images/auth-bg2.jpg');

export function AuthScreen({ title, description, children, footer }: Props) {
  const colors = useTheme();
  const { language, setLanguage } = useThemeMode();

  return (
    <ImageBackground source={authBackground} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Link href="/" style={[styles.brand, { color: colors.primary }]}>
              Zynstitch
            </Link>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <SegmentedButtons
                value={language}
                onValueChange={(value) => setLanguage(value as 'en' | 'ur')}
                buttons={[
                  { value: 'en', label: 'English' },
                  { value: 'ur', label: 'اردو' },
                ]}
                style={styles.languageToggle}
              />
              <Text variant="headlineSmall" style={styles.title}>
                {title}
              </Text>
              {description ? (
                <Text variant="bodyMedium" style={{ color: colors.textSecondary, textAlign: 'center' }}>
                  {description}
                </Text>
              ) : null}
              {children}
              {footer}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  brand: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  languageToggle: {
    marginBottom: Spacing.one,
  },
});
