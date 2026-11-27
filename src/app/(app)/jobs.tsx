import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { deleteJob, fetchJobs, getJobDownloadUrl } from '@/api';
import { CollectionTableScreen, TableActionButton } from '@/components/shared/CollectionTableScreen';
import { useSnackbar } from '@/providers/SnackbarProvider';

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function JobsScreen() {
  const { t } = useTranslation('jobs');
  const { showSuccess, showError } = useSnackbar();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadJobs = async (search: string) => {
    const response = await fetchJobs(0, 50, search ? { search } : undefined);
    return {
      success: response.success,
      message: t(response.message, { defaultValue: response.message }),
      items: (response.data?.jobs ?? []).map((job) => ({
        ...job,
        createdAtLabel: formatDate(job.createdAt),
      })),
      total: response.data?.total ?? 0,
    };
  };

  const download = async (id: string) => {
    setDownloadingId(id);
    try {
      const response = await getJobDownloadUrl(id);
      if (!response.success || !response.data?.url) {
        showError(t(response.message, { defaultValue: t('serviceMessages.downloadFail') }));
        return;
      }
      await Linking.openURL(response.data.url);
      showSuccess(t('serviceMessages.downloadStarted'));
    } catch {
      showError(t('serviceMessages.downloadFail'));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <CollectionTableScreen
      title={t('title')}
      singularTitle={t('singularTitle')}
      entity="jobs"
      initialData={[]}
      loadRows={loadJobs}
      deleteRowRemote={async (id) => {
        const response = await deleteJob(id);
        return {
          success: response.success,
          message: t(response.message, { defaultValue: response.message }),
          data: response.data,
        };
      }}
      renderExtraActions={(row) => {
        const id = typeof row._id === 'string' ? row._id : '';
        if (!id || row.status !== 'COMPLETED') return null;
        return (
          <TableActionButton
            icon="download-outline"
            disabled={downloadingId === id}
            accessibilityLabel={t('serviceMessages.downloadStarted')}
            onPress={() => void download(id)}
          />
        );
      }}
      fields={[]}
      columns={[
        { key: 'fileName', label: t('table.fileName'), width: 220 },
        { key: 'entity', label: t('table.entity') },
        { key: 'status', label: t('table.status') },
        { key: 'createdAtLabel', label: t('table.createdAt'), width: 200 },
        { key: 'error', label: t('table.error'), width: 200 },
      ]}
      canAdd={false}
      canExport={false}
      canEdit={false}
      canRefresh
    />
  );
}
