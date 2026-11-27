import { useTranslation } from 'react-i18next';
import { deleteCustomer, fetchAllCustomers, saveCustomer } from '@/api';
import { CollectionTableScreen, TableActionButton } from '@/components/shared/CollectionTableScreen';
import { useExportJob } from '@/hooks/use-export-job';
import type { ICustomer } from '@/types/customer.types';
import { Linking } from 'react-native';
import { getWhatsAppUrl } from '@/utils/whatsapp';

const formatPhoneNumber = (phone: string): { formatted: string; isValid: boolean } => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return { formatted: '92' + cleaned.substring(1), isValid: true };
  }
  if (cleaned.startsWith('92') && cleaned.length === 12) {
    return { formatted: cleaned, isValid: true };
  }
  return { formatted: '', isValid: false };
};

export default function CustomersScreen() {
  const { t } = useTranslation('customers');
  const exportJob = useExportJob('customers');
  const loadCustomers = async (search: string) => {
    const response = await fetchAllCustomers(0, 50, search ? { search } : undefined);
    return {
      success: response.success,
      message: t(response.message, { defaultValue: response.message }),
      items: response.data?.customers ?? [],
      total: response.data?.total ?? 0,
    };
  };

  return (
    <CollectionTableScreen
      title={t('title')}
      singularTitle={t('singularTitle')}
      entity="customers"
      initialData={[]}
      onExport={exportJob}
      canRefresh
      loadRows={loadCustomers}
      renderExtraActions={(row) => {
        const phone = String(row.phone ?? '');
        const name = String(row.name ?? '');
        const url = getWhatsAppUrl(phone, name);
        if (!url) return null;
        return (
          <TableActionButton
            icon="whatsapp"
            iconColor="#25D366"
            onPress={(e: any) => {
              e.stopPropagation();
              Linking.openURL(url);
            }}
          />
        );
      }}
      saveRowRemote={async (values, existing) => {
        const { formatted, isValid } = formatPhoneNumber(String(values.phone ?? ""));
        if (!isValid) {
          return {
            success: false,
            message: t("serviceMessages.invalidPhone"),
            data: null,
          };
        }

        const customer: ICustomer = {
          _id: typeof existing?._id === 'string' ? existing._id : undefined,
          name: String(values.name ?? '').trim(),
          phone: formatted,
          email: String(values.email ?? '').trim(),
          address: String(values.address ?? '').trim(),
        };
        const response = await saveCustomer(customer);
        return { success: response.success, message: t(response.message, { defaultValue: response.message }), data: response.data };
      }}
      deleteRowRemote={async (id) => {
        const response = await deleteCustomer(id);
        return { success: response.success, message: t(response.message, { defaultValue: response.message }), data: response.data };
      }}
      fields={[
        { key: 'name', label: t('modal.fields.name'), type: 'text', required: true },
        { key: 'phone', label: t('modal.fields.phone'), type: 'text', required: true },
        { key: 'email', label: t('modal.fields.email'), type: 'text', required: true },
        { key: 'address', label: t('modal.fields.address'), type: 'text', required: true },
      ]}
      columns={[
        { key: 'name', label: t('table.name') },
        { key: 'phone', label: t('table.phone') },
        { key: 'email', label: t('table.email') },
        { key: 'address', label: t('table.address') },
      ]}
    />
  );
}
