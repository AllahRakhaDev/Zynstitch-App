import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Divider, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import * as Yup from 'yup';

import { changePassword, updateUserProfile } from '@/api';
import { BackArrowButton } from '@/components/shared/BackArrowButton';
import { PasswordField } from '@/components/shared/PasswordField';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/providers/AuthProvider';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { useThemeMode } from '@/providers/ThemeProvider';
import { getChangePasswordSchema } from '@/validators/auth.validations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { t } = useTranslation(['users', 'common', 'sidebar']);
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useSession();
  const { showSuccess, showError } = useSnackbar();
  const { mode, setMode, language, setLanguage } = useThemeMode();
  const profilePhotoUri = user?.profilePhoto?.startsWith('http') ? user.profilePhoto : undefined;

  const profileForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name ?? '',
      companyName: user?.companyName ?? '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required(t('profile.name') + ' ' + t('common:isRequired')),
    }),
    onSubmit: async (values, helpers) => {
      try {
        if (!user) return;
        const response = await updateUserProfile(user.id, values);
        if (!response.success || !response.data) {
          showError(response.message);
          return;
        }
        updateUser(response.data);
        showSuccess(response.message);
      } catch {
        showError(t('profile.updateError'));
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const passwordForm = useFormik({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validationSchema: getChangePasswordSchema(t),
    onSubmit: async (values, helpers) => {
      try {
        const response = await changePassword(values.currentPassword, values.newPassword);
        if (!response.success) {
          showError(response.message);
          return;
        }
        showSuccess(response.message);
        helpers.resetForm();
      } catch {
        showError(t('profile.changePassword.messages.unexpectedError'));
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.two }]}
    >
      <View style={styles.pageTitle}>
        <BackArrowButton fallbackHref="/" />
        <Text variant="headlineSmall" style={styles.pageTitleText}>{t('sidebar:sidebarUserMenu.profile')}</Text>
      </View>
      <View style={[styles.accountCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
        {profilePhotoUri ? (
          <Avatar.Image size={64} source={{ uri: profilePhotoUri }} />
        ) : (
          <Avatar.Text
            size={64}
            label={(user?.name ?? 'U').charAt(0).toUpperCase()}
            style={{ backgroundColor: colors.primary }}
          />
        )}
        <View style={styles.accountCopy}>
          <Text variant="titleMedium">{user?.name || t('common:user')}</Text>
          <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
            {user?.email}
          </Text>
          <Text variant="labelMedium" style={{ color: colors.primary }}>
            {user?.role?.replace('_', ' ') ?? 'ADMIN'}
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
        <Text variant="titleLarge">{t('common:appearance')}</Text>
        <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
          {t('common:appearanceDescription')}
        </Text>
        <SegmentedButtons
          value={mode}
          onValueChange={(value) => setMode(value as 'light' | 'dark')}
          buttons={[
            { value: 'light', label: t('common:light'), icon: 'white-balance-sunny' },
            { value: 'dark', label: t('common:dark'), icon: 'moon-waning-crescent' },
          ]}
        />
        <Divider style={styles.divider} />
        <Text variant="titleMedium">{t('common:language')}</Text>
        <SegmentedButtons
          value={language}
          onValueChange={(value) => setLanguage(value as 'en' | 'ur')}
          buttons={[
            { value: 'en', label: 'English' },
            { value: 'ur', label: 'اردو' },
          ]}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
        <Text variant="titleLarge">{t('profile.profileDetails')}</Text>
        <TextInput mode="outlined" label={t('profile.email')} value={user?.email ?? ''} disabled />
        <TextInput
          mode="outlined"
          label={t('profile.name')}
          value={profileForm.values.name}
          onChangeText={profileForm.handleChange('name')}
        />
        <TextInput
          mode="outlined"
          label={t('profile.company')}
          value={profileForm.values.companyName}
          onChangeText={profileForm.handleChange('companyName')}
        />
        <Button
          mode="contained"
          onPress={() => profileForm.handleSubmit()}
          loading={profileForm.isSubmitting}
        >
          {t('profile.saveProfile')}
        </Button>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
        <Text variant="titleLarge">{t('profile.sections.security')}</Text>
        <PasswordField
          label={t('profile.changePassword.currentPassword')}
          value={passwordForm.values.currentPassword}
          onChangeText={passwordForm.handleChange('currentPassword')}
        />
        <PasswordField
          label={t('profile.changePassword.newPassword')}
          value={passwordForm.values.newPassword}
          onChangeText={passwordForm.handleChange('newPassword')}
        />
        <PasswordField
          label={t('profile.changePassword.confirmPassword')}
          value={passwordForm.values.confirmPassword}
          onChangeText={passwordForm.handleChange('confirmPassword')}
        />
        <Button
          mode="contained"
          onPress={() => passwordForm.handleSubmit()}
          loading={passwordForm.isSubmitting}
        >
          {t('profile.changePassword.submit')}
        </Button>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  pageTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.one,
  },
  pageTitleText: {
    fontWeight: '700',
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
  },
  accountCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  section: {
    padding: Spacing.three,
    gap: Spacing.two,
    borderRadius: 16,
    borderWidth: 1,
  },
  divider: {
    marginVertical: Spacing.two,
  },
});
