import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { usePathname, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';


import { getMenuItemLabelKey, getMoreMenuSections, type AppMenuActionItem } from '@/constants/menu';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/providers/AuthProvider';
import { useThemeMode } from '@/providers/ThemeProvider';
import { ROLES } from '@/types/users.types';

export default function MoreScreen() {
  const { t } = useTranslation(['sidebar', 'common']);
  const colors = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useSession();
  const { language, setLanguage } = useThemeMode();
  const sections = getMoreMenuSections(user?.role ?? ROLES.ADMIN);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  const confirmSignOut = () => {
    Alert.alert(t('common:signOut'), t('common:signOutConfirm'), [
      { text: t('common:cancel'), style: 'cancel' },
      { text: t('common:signOut'), style: 'destructive', onPress: () => void signOut() },
    ]);
  };

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineSmall" style={styles.title}>{t('sidebar.More')}</Text>
      <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
        {t('common:moreDescription')}
      </Text>

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t(`common:${section.title}`, section.title)}
          </Text>
          <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
            {section.items.map((item, index) => {
              const active = 'href' in item && pathname === item.href;
              const onPress = 'action' in item 
                ? ((item as AppMenuActionItem).action === 'toggleLanguage' ? toggleLanguage : confirmSignOut) 
                : () => router.push(item.href);
              
              const labelKey = getMenuItemLabelKey(item.label);

              return (
                <View key={'href' in item ? item.href : item.action}>
                  {index ? <Divider /> : null}
                  <Pressable
                    onPress={onPress}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [
                      styles.menuRow,
                      active && { backgroundColor: colors.backgroundSelected },
                      pressed && styles.pressed,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={22}
                      color={active ? colors.primary : ('action' in item && (item as AppMenuActionItem).action !== 'toggleLanguage' ? '#b3261e' : colors.text)}
                    />
                    <Text
                      variant="titleSmall"
                      style={[
                        styles.menuLabel,
                        { color: active ? colors.primary : ('action' in item && (item as AppMenuActionItem).action !== 'toggleLanguage' ? '#b3261e' : colors.text) },
                      ]}
                    >
                      {t(labelKey)}
                    </Text>
                    {'action' in item ? null : (
                      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      ))}

      <View style={[styles.accountSummary, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
        <View style={[styles.avatar, { backgroundColor: colors.backgroundSelected }]}>
          <Text variant="titleMedium" style={{ color: colors.primary, fontWeight: '700' }}>
            {(user?.name ?? 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.accountCopy}>
          <Text variant="titleSmall">{user?.name ?? t('common:user')}</Text>
          <Text variant="bodySmall" style={{ color: colors.textSecondary }}>{user?.email}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: Spacing.four, paddingTop: Spacing.five, paddingBottom: Spacing.six, gap: Spacing.two },
  title: { fontWeight: '700' },
  section: { gap: Spacing.two, marginTop: Spacing.three },
  sectionTitle: { textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '700', paddingHorizontal: Spacing.one },
  menuCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  menuRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  menuLabel: { flex: 1, fontWeight: '600' },
  pressed: { opacity: 0.7 },
  accountSummary: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderRadius: 16, borderWidth: 1, marginTop: Spacing.three, padding: Spacing.three },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  accountCopy: { flex: 1, gap: 2 },
});
