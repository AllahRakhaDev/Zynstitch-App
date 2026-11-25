import { mockUsers } from '@/api/mock/data';
import { CollectionTableScreen } from '@/components/shared/CollectionTableScreen';
import { useTranslation } from 'react-i18next';

export default function UsersScreen() {
  const { t } = useTranslation('adminUsers');

  return (
    <CollectionTableScreen
      title={t('title')}
      singularTitle={t('singularTitle')}
      entity="users"
      initialData={mockUsers}
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
