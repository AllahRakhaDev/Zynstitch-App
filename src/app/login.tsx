import { Link, router } from 'expo-router';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { PasswordField } from '@/components/shared/PasswordField';
import { useSession } from '@/providers/AuthProvider';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { getLoginSchema } from '@/validators/auth.validations';

export default function LoginScreen() {
  const { t } = useTranslation('users');
  const { signIn } = useSession();
  const { showSuccess, showError } = useSnackbar();

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: getLoginSchema(t),
    onSubmit: async (values, helpers) => {
      const result = await signIn(values);
      if (!result.success) {
        showError(result.message);
        helpers.setSubmitting(false);
        return;
      }
      showSuccess(result.message);
      helpers.setSubmitting(false);
      router.replace('/');
    },
  });

  return (
    <AuthScreen title={t('login.title')}>
      <TextInput
        mode="outlined"
        label={t('login.fields.email')}
        autoCapitalize="none"
        keyboardType="email-address"
        value={formik.values.email}
        onChangeText={formik.handleChange('email')}
        onBlur={formik.handleBlur('email')}
        error={formik.touched.email && Boolean(formik.errors.email)}
      />
      {formik.touched.email && formik.errors.email ? (
        <Text style={styles.error}>{formik.errors.email}</Text>
      ) : null}

      <PasswordField
        label={t('login.fields.password')}
        value={formik.values.password}
        onChangeText={formik.handleChange('password')}
        onBlur={formik.handleBlur('password')}
        error={formik.touched.password && Boolean(formik.errors.password)}
      />
      {formik.touched.password && formik.errors.password ? (
        <Text style={styles.error}>{formik.errors.password}</Text>
      ) : null}

      <Link href="/forgot-password" style={styles.link}>
        {t('login.actions.forgotPassword')}
      </Link>

      <Button
        mode="contained"
        onPress={() => formik.handleSubmit()}
        loading={formik.isSubmitting}
        disabled={formik.isSubmitting}
        contentStyle={styles.submit}
      >
        {t('login.actions.submit')}
      </Button>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  error: {
    color: '#b3261e',
    marginTop: -8,
  },
  link: {
    alignSelf: 'flex-end',
    color: '#1565c0',
  },
  submit: {
    paddingVertical: 4,
  },
});
