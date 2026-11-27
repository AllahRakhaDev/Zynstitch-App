import { Link } from 'expo-router';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import { requestPasswordReset } from '@/api';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { getForgotPasswordSchema } from '@/validators/auth.validations';

export default function ForgotPasswordScreen() {
  const { t, i18n } = useTranslation('users');
  const { showSuccess, showError } = useSnackbar();

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: getForgotPasswordSchema(t),
    onSubmit: async (values, helpers) => {
      const response = await requestPasswordReset(values.email, i18n.language);
      if (!response.success) {
        showError(t(response.message, { defaultValue: response.message }));
        helpers.setSubmitting(false);
        return;
      }
      showSuccess(t(response.message, { defaultValue: response.message }));
      helpers.resetForm();
      helpers.setSubmitting(false);
    },
  });

  return (
    <AuthScreen
      title={t('forgotPassword.title')}
      description={t('forgotPassword.description')}
      footer={
        <Link href="/login" style={styles.link}>
          {t('forgotPassword.actions.backToLogin')}
        </Link>
      }
    >
      <TextInput
        mode="outlined"
        label={t('forgotPassword.fields.email')}
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

      <Button
        mode="contained"
        onPress={() => formik.handleSubmit()}
        loading={formik.isSubmitting}
        disabled={formik.isSubmitting}
      >
        {t('forgotPassword.actions.submit')}
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
    textAlign: 'center',
    color: '#1565c0',
  },
});
