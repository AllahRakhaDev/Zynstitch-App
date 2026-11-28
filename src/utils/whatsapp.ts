/**
 * Pakistani mobile numbers are accepted as `03xxxxxxxxx` (11 digits) or
 * `923xxxxxxxxx` (12 digits) and stored in the international `92…` form,
 * which is also what wa.me expects. Kept in sync with the backend and website.
 */
export const normalizePhone = (phone: string): string | null => {
  const cleaned = String(phone ?? '').replace(/\D/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 11) return '92' + cleaned.substring(1);
  if (cleaned.startsWith('92') && cleaned.length === 12) return cleaned;
  return null;
};

export const getWhatsAppUrl = (phone: string, name?: string): string | null => {
  const formattedPhone = normalizePhone(phone);
  if (!formattedPhone) return null;

  const greeting = name ? `Hello ${name}, ` : 'Hello, ';
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(greeting)}`;
};
