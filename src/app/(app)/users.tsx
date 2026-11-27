import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-native-paper';

import { deleteAdminUser, fetchAllAdminUsers, saveAdminUser, triggerJobsProcessing } from '@/api';
import { CollectionTableScreen } from '@/components/shared/CollectionTableScreen';
import { useSnackbar } from '@/providers/SnackbarProvider';
import type { UserRole, UserStatus } from '@/types/users.types';

export default function UsersScreen() {
  const { t } = useTranslation('adminUsers');
  const { showSuccess, showError } = useSnackbar();
  const [triggering, setTriggering] = useState(false);
  const translate = (message: string) => t(message, { defaultValue: message });

  const runJobsCron = async () => {
    setTriggering(true);
    try {
      const response = await triggerJobsProcessing();
      if (response.success) showSuccess(translate(response.message));
      else showError(translate(response.message));
    } finally {
      setTriggering(false);
    }
  };

  return (
    <CollectionTableScreen
      title={t('title')}
      singularTitle={t('singularTitle')}
      entity="users"
      initialData={[]}
      loadRows={async (search) => {
        const response = await fetchAllAdminUsers(0, 50, search ? { search } : undefined);
        return {
          success: response.success,
          message: translate(response.message),
          items: response.data?.users ?? [],
          total: response.data?.total ?? 0,
        };
      }}
      saveRowRemote={async (values, existing) => {
        const response = await saveAdminUser({
          _id: typeof existing?._id === 'string' ? existing._id : undefined,
          name: String(values.name ?? '').trim(),
          email: String(values.email ?? '').trim().toLowerCase(),
          password: existing ? undefined : String(values.password ?? ''),
          role: String(values.role || 'ADMIN') as UserRole,
          status: String(values.status || 'ACTIVE') as UserStatus,
          companyName: String(values.companyName ?? '').trim(),
        });
        return { success: response.success, message: translate(response.message), data: response.data };
      }}
      deleteRowRemote={async (id) => {
        const response = await deleteAdminUser(id);
        return { success: response.success, message: translate(response.message), data: response.data };
      }}
      headerActions={
        <Button mode="outlined" icon="play-circle-outline" onPress={() => void runJobsCron()} loading={triggering} disabled={triggering} compact>
          {triggering ? t('runJobsCronRunning') : t('runJobsCron')}
        </Button>
      }
      canRefresh
      fields={[
        { key: 'name', label: t('modal.fields.name'), type: 'text', required: true },
        { key: 'email', label: t('modal.fields.email'), type: 'text', required: true },
        { key: 'password', label: t('modal.fields.password'), type: 'password', required: true, hideOnEdit: true },
        {
          key: 'role',
          label: t('modal.fields.role'),
          type: 'select',
          required: true,
          defaultValue: 'ADMIN',
          options: [
            { label: t('role.ADMIN'), value: 'ADMIN' },
            { label: t('role.SUPER_ADMIN'), value: 'SUPER_ADMIN' },
          ],
        },
        { key: 'companyName', label: t('modal.fields.companyName'), type: 'text' },
        {
          key: 'status',
          label: t('modal.fields.status'),
          type: 'select',
          defaultValue: 'ACTIVE',
          options: [
            { label: t('status.ACTIVE'), value: 'ACTIVE' },
            { label: t('status.BLOCKED'), value: 'BLOCKED' },
          ],
        },
      ]}
      columns={[
        { key: 'name', label: t('table.name') },
        { key: 'email', label: t('table.email'), width: 200 },
        { key: 'role', label: t('table.role') },
        { key: 'companyName', label: t('table.companyName') },
        { key: 'status', label: t('table.status') },
      ]}
      canExport={false}
    />
  );
}
