import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { canAccessUsers } from '@/constants/menu';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/providers/AuthProvider';
import { ROLES } from '@/types/users.types';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function AppLayout() {
  const { t } = useTranslation('sidebar');
  const colors = useTheme();
  const { user } = useSession();
  const canManageUsers = canAccessUsers(user?.role ?? ROLES.ADMIN);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="measurements" />
      <Stack.Screen name="jobs" options={{ title: t('sidebar.Jobs') }} />
      <Stack.Screen name="profile" options={{ title: t('sidebarUserMenu.profile') }} />
      <Stack.Protected guard={canManageUsers}>
        <Stack.Screen name="users" options={{ title: t('sidebar.Users') }} />
      </Stack.Protected>
    </Stack>
  );
}
