import { mockJobs } from '@/api/mock/data';
import { CollectionTableScreen } from '@/components/shared/CollectionTableScreen';
import { useTranslation } from 'react-i18next';

export default function JobsScreen() {
  const { t } = useTranslation('jobs');

  return (
    <CollectionTableScreen
      title={t('title')}
      singularTitle={t('singularTitle')}
      entity="jobs"
      initialData={mockJobs}
      fields={[]}
      columns={[
        { key: 'entity', label: t('table.entity') },
        { key: 'status', label: t('table.status') },
        { key: 'createdAt', label: t('table.createdAt'), width: 200 },
        { key: 'fileName', label: t('table.fileName'), width: 220 },
      ]}
      canAdd={false}
      canExport={false}
      canEdit={false}
    />
  );
}
