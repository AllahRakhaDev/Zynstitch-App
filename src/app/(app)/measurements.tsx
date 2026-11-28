import { deleteMeasurement, fetchAllCustomers, fetchAllMeasurements, saveMeasurement } from '@/api';
import { CollectionTableScreen, TableActionButton } from '@/components/shared/CollectionTableScreen';
import { useExportJob } from '@/hooks/use-export-job';
import type { ICustomer } from '@/types/customer.types';
import type { IMeasurement } from '@/types/measurements.types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/providers/AuthProvider';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { downloadMeasurementPdf } from '@/utils/measurementPdf';

export default function MeasurementsScreen() {
  const { t } = useTranslation('measurements');
  const exportJob = useExportJob('measurements');
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [pdfBusyId, setPdfBusyId] = useState<string | null>(null);
  const { user } = useSession();
  const { showError } = useSnackbar();

  const downloadPdf = async (row: Record<string, unknown>) => {
    const id = String(row._id ?? '');
    setPdfBusyId(id);
    try {
      await downloadMeasurementPdf(
        row as unknown as IMeasurement,
        user?.companyName || user?.name || '',
        t('downloadPdf.action'),
      );
    } catch {
      showError(t('downloadPdf.failed'));
    } finally {
      setPdfBusyId(null);
    }
  };
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    (async () => {
      const response = await fetchAllCustomers(0, 100);
      if (response.success && response.data) {
        setCustomers(response.data.customers);
      }
    })();
  }, []);

  const loadMeasurements = async (search: string) => {
    const response = await fetchAllMeasurements(0, 50, search ? { search } : undefined);
    return {
      success: response.success,
      message: t(response.message, { defaultValue: response.message }),
      items: response.data?.measurements ?? [],
      total: response.data?.total ?? 0,
    };
  };

  return (
    <CollectionTableScreen
      title={t('title')}
      singularTitle={t('singularTitle')}
      entity="measurements"
      initialData={[]}
      onExport={exportJob}
      renderExtraActions={(row) => (
        <TableActionButton
          icon="file-pdf-box"
          accessibilityLabel={t('downloadPdf.action')}
          disabled={pdfBusyId === String(row._id ?? '')}
          onPress={() => void downloadPdf(row)}
        />
      )}
      canRefresh
      loadRows={loadMeasurements}
      saveRowRemote={async (values, existing) => {
        // Same rule as the website: new measurements are dated today or later;
        // on edit an unchanged (older) date is kept, a changed one must be today or later.
        const selectedDate = String(values.measurementDate ?? '').slice(0, 10);
        const originalDate = String(existing?.measurementDate ?? '').slice(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
          return { success: false, message: t('validation.required'), data: null };
        }
        if (selectedDate !== originalDate && selectedDate < today) {
          return { success: false, message: t('validation.dateFutureOnly'), data: null };
        }

        const measurement: IMeasurement = {
          ...values,
          _id: typeof existing?._id === 'string' ? existing._id : undefined,
          customerId: String(values.customerId ?? ''),
          measurementName: String(values.measurementName ?? '').trim(),
          measurementDate: selectedDate,
        };
        const response = await saveMeasurement(measurement);
        return { success: response.success, message: t(response.message, { defaultValue: response.message }), data: response.data };
      }}
      deleteRowRemote={async (id) => {
        const response = await deleteMeasurement(id);
        return { success: response.success, message: t(response.message, { defaultValue: response.message }), data: response.data };
      }}
      fields={[
        { key: 'measurementName', label: t('form.measurementName'), type: 'text', required: true },
        {
          key: 'customerId',
          label: t('form.customer'),
          type: 'select',
          required: true,
          options: customers.map((c) => ({ label: c.name, value: c._id ?? '' })),
        },
        { key: 'measurementDate', label: t('form.measurementDate'), type: 'date', required: true, defaultValue: today },
        ...[
          'kameezLength',
          'sleeveLength',
          'shoulderWidth',
          'neck',
          'chest',
          'waist',
          'bottomWidth',
          'shalwarLength',
          'bottomOpening',
          'cuff',
        ].map((key) => ({ key, label: t(`form.fields.${key}`), type: 'decimal' as const })),
        {
          key: 'collarStyle',
          label: t('form.fields.collarStyle'),
          type: 'select',
          options: [
            { label: t('form.collarStyles.noCollar'), value: 'noCollar' },
            { label: t('form.collarStyles.collar'), value: 'collar' },
            { label: t('form.collarStyles.ban'), value: 'ban' },
            { label: t('form.collarStyles.other'), value: 'other' },
          ],
        },
        { key: 'hasChakPattiKaaj', label: t('form.fields.hasChakPattiKaaj'), type: 'toggle' },
        { key: 'hasChestPocket', label: t('form.fields.hasChestPocket'), type: 'toggle' },
        { key: 'hasSidePockets', label: t('form.fields.hasSidePockets'), type: 'toggle' },
        { key: 'hasShalwarPocket', label: t('form.fields.hasShalwarPocket'), type: 'toggle' },
        { key: 'notes', label: t('form.notes'), type: 'text' },
      ]}
      columns={[
        { key: 'measurementName', label: t('table.measurementName'), width: 180 },
        { key: 'customerName', label: t('table.customerName'), width: 150 },
        { key: 'customerPhone', label: t('table.phone'), width: 140 },
        { key: 'measurementDate', label: t('table.measurementDate'), width: 130 },
        { key: 'chest', label: t('form.fields.chest'), width: 100 },
        { key: 'waist', label: t('form.fields.waist'), width: 100 },
        { key: 'notes', label: t('table.notes'), width: 180 },
      ]}
      prepareRow={(values) => {
        const customer = customers.find((item) => item._id === values.customerId);
        return {
          ...values,
          customerName: customer?.name ?? '',
          customerPhone: customer?.phone ?? '',
        };
      }}
    />
  );
}
