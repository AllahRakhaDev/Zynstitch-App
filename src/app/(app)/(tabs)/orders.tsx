import { deleteOrder, fetchAllCustomers, fetchAllMeasurements, fetchAllOrders, saveOrder } from '@/api';
import { CollectionTableScreen, TableActionButton } from '@/components/shared/CollectionTableScreen';
import { useExportJob } from '@/hooks/use-export-job';
import type { ICustomer } from '@/types/customer.types';
import type { IOrder } from '@/types/orders.types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import { getWhatsAppUrl } from '@/utils/whatsapp';

const defaultOrderDate = new Date().toISOString().slice(0, 10);
const defaultDueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

/** Compares calendar days only, so a due date on the order day is allowed (same rule as the website). */
const toDayValue = (value: unknown) => {
  const date = new Date(String(value ?? ''));
  return Number.isNaN(date.getTime()) ? null : Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

export default function OrdersScreen() {
  const { t } = useTranslation('orders');
  const exportJob = useExportJob('orders');
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [measurements, setMeasurements] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    (async () => {
      const [custResp, measResp] = await Promise.all([
        fetchAllCustomers(0, 100),
        fetchAllMeasurements(0, 100),
      ]);

      if (custResp.success && custResp.data) {
        setCustomers(custResp.data.customers);
      }
      if (measResp.success && measResp.data) {
        setMeasurements(measResp.data.measurements.map((m) => ({ label: m.measurementName, value: m._id ?? '' })));
      }
    })();
  }, []);

  const loadOrders = async (search: string) => {
    const response = await fetchAllOrders(0, 50, search ? { search } : undefined);
    return {
      success: response.success,
      message: t(response.message, { defaultValue: response.message }),
      items: response.data?.orders ?? [],
      total: response.data?.total ?? 0,
    };
  };

  return (
    <CollectionTableScreen
      title={t('title')}
      singularTitle={t('singularTitle')}
      entity="orders"
      initialData={[]}
      onExport={exportJob}
      canRefresh
      loadRows={loadOrders}
      renderExtraActions={(row) => {
        const url = getWhatsAppUrl(String(row.customerPhone ?? ''), String(row.customerName ?? ''));
        if (!url) return null;
        return (
          <TableActionButton
            icon="whatsapp"
            iconColor="#25D366"
            accessibilityLabel="WhatsApp"
            onPress={(e: any) => {
              e?.stopPropagation?.();
              void Linking.openURL(url);
            }}
          />
        );
      }}
      saveRowRemote={async (values, existing) => {
        const price = Number(values.price || 0);
        const advancePaid = Number(values.advancePaid || 0);
        if (advancePaid > price) {
          return { success: false, message: t('serviceMessages.advanceExceedsPrice'), data: null };
        }
        const orderDay = toDayValue(values.orderDate || defaultOrderDate);
        const dueDay = toDayValue(values.dueDate || defaultDueDate);
        if (orderDay === null || dueDay === null) {
          return { success: false, message: t('form.validation.orderDateRequired'), data: null };
        }
        if (dueDay < orderDay) {
          return { success: false, message: t('form.validation.dueDateAfterOrderDate'), data: null };
        }

        const order: IOrder = {
          _id: typeof existing?._id === 'string' ? existing._id : undefined,
          customerId: String(values.customerId ?? ''),
          measurementId: values.measurementId ? String(values.measurementId) : null,
          // Assigned by the server on create (ORD-YYYY-NNNN), unchanged on edit.
          price,
          advancePaid,
          status: String(values.status || 'pending') as any,
          orderDate: String(values.orderDate || defaultOrderDate),
          dueDate: String(values.dueDate || defaultDueDate),
          notes: String(values.notes ?? '').trim(),
        };
        const response = await saveOrder(order);
        return { success: response.success, message: t(response.message, { defaultValue: response.message }), data: response.data };
      }}
      deleteRowRemote={async (id) => {
        const response = await deleteOrder(id);
        return { success: response.success, message: t(response.message, { defaultValue: response.message }), data: response.data };
      }}
      fields={[
        {
          key: 'customerId',
          label: t('modal.fields.customer'),
          type: 'select',
          required: true,
          options: customers.map(c => ({ label: c.name, value: c._id ?? '' })),
        },
        {
          key: 'measurementId',
          label: t('modal.fields.measurementOptional'),
          type: 'select',
          options: measurements,
        },
        {
          key: 'status',
          label: t('modal.fields.status'),
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: [
            { label: t('status.pending'), value: 'pending' },
            { label: t('status.in_progress'), value: 'in_progress' },
            { label: t('status.completed'), value: 'completed' },
            { label: t('status.delivered'), value: 'delivered' },
          ],
        },
        { key: 'price', label: t('modal.fields.price'), type: 'number', required: true },
        { key: 'advancePaid', label: t('modal.fields.advancePaid'), type: 'number', required: true, defaultValue: '0' },
        { key: 'orderDate', label: t('modal.fields.orderDate'), type: 'date', required: true, defaultValue: defaultOrderDate },
        { key: 'dueDate', label: t('modal.fields.dueDate'), type: 'date', required: true, defaultValue: defaultDueDate },
        { key: 'notes', label: t('modal.fields.notes'), type: 'text' },
      ]}
      columns={[
        { key: 'orderNumber', label: t('table.orderNumber'), width: 140 },
        { key: 'customerName', label: t('table.customerName'), width: 150 },
        { key: 'customerPhone', label: t('table.customerPhone'), width: 140 },
        { key: 'price', label: t('table.price'), width: 100 },
        { key: 'advancePaid', label: t('table.advancePaid'), width: 110 },
        { key: 'status', label: t('table.status'), width: 125 },
        { key: 'orderDate', label: t('table.orderDate'), width: 130 },
        { key: 'dueDate', label: t('table.dueDate'), width: 130 },
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

