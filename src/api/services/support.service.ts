import { apiClient, getErrorMessage } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { ServiceResponse } from '@/types/serviceResponse.types';

export interface SupportEmailPayload {
  name: string;
  email: string;
  message: string;
}

export async function sendSupportEmail(
  payload: SupportEmailPayload,
): Promise<ServiceResponse<null>> {

  try {
    const { data } = await apiClient.post<ServiceResponse<null>>(
      endpoints.support.contact,
      payload,
    );
    return data;
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, 'Something went wrong. Please try again.'),
      data: null,
    };
  }
}
