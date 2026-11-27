import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { createJob } from '@/api';
import type { ExportEntity } from '@/types/jobs.types';

/** Returns an `onExport` handler that queues a server-side Excel export job. */
export function useExportJob(entity: ExportEntity, filters?: Record<string, string>) {
  const { t } = useTranslation('jobs');

  return useCallback(
    async (fileName?: string) => {
      const response = await createJob({ entity, fileName, filters });
      return {
        success: response.success,
        message: t(response.message, { defaultValue: response.message }),
      };
    },
    [entity, filters, t],
  );
}
