import type { TFunction } from 'i18next';
import * as Yup from 'yup';

export const getLoginSchema = (t: TFunction) =>
  Yup.object({
    email: Yup.string()
      .email(t('login.errors.invalidEmail', { ns: 'users' }))
      .required(t('login.errors.emailRequired', { ns: 'users' })),
    password: Yup.string()
      .min(6, t('login.errors.passwordMin', { ns: 'users' }))
      .required(t('login.errors.passwordRequired', { ns: 'users' })),
  });

export const getForgotPasswordSchema = (t: TFunction) =>
  Yup.object({
    email: Yup.string()
      .email(t('forgotPassword.errors.invalidEmail', { ns: 'users' }))
      .required(t('forgotPassword.errors.emailRequired', { ns: 'users' })),
  });

export const getResetPasswordSchema = (t: TFunction) =>
  Yup.object({
    password: Yup.string()
      .min(6, t('resetPassword.errors.passwordMin', { ns: 'users' }))
      .required(t('resetPassword.errors.passwordRequired', { ns: 'users' })),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t('resetPassword.errors.passwordMismatch', { ns: 'users' }))
      .required(t('resetPassword.errors.confirmPasswordRequired', { ns: 'users' })),
  });

export const getChangePasswordSchema = (t: TFunction) =>
  Yup.object({
    currentPassword: Yup.string().required(
      t('profile.changePassword.errors.currentPasswordRequired', { ns: 'users' }),
    ),
    newPassword: Yup.string()
      .min(6, t('profile.changePassword.errors.passwordMin', { ns: 'users' }))
      .required(t('profile.changePassword.errors.newPasswordRequired', { ns: 'users' })),
    confirmPassword: Yup.string()
      .oneOf(
        [Yup.ref('newPassword')],
        t('profile.changePassword.errors.passwordMismatch', { ns: 'users' }),
      )
      .required(t('profile.changePassword.errors.confirmPasswordRequired', { ns: 'users' })),
  });

