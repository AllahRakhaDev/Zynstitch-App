import { apiClient, getErrorMessage } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { IMeasurement, MeasurementResponse } from '@/types/measurements.types';

export async function fetchAllMeasurements(
  page = 0,
  limit = 20,
  filters?: Record<string, string>,
): Promise<MeasurementResponse<{ measurements: IMeasurement[]; total: number }>> {
  try {
    const { data } = await apiClient.get<
      MeasurementResponse<{ measurements: IMeasurement[]; total: number }>
    >(endpoints.measurements.list, { params: { page, limit, ...filters } });
    return data;
  } catch (error) {
    return {
      success: false,
      data: { measurements: [], total: 0 },
      message: getErrorMessage(error, 'serviceMessages.fetchFail'),
    };
  }
}

export async function fetchMeasurementById(
  id: string,
): Promise<MeasurementResponse<IMeasurement>> {
  try {
    const { data } = await apiClient.get<MeasurementResponse<IMeasurement>>(
      endpoints.measurements.detail(id),
    );
    return data;
  } catch (error) {
    return {
      success: false,
      data: null,
      message: getErrorMessage(error, 'serviceMessages.fetchFail'),
    };
  }
}

export async function saveMeasurement(
  measurement: IMeasurement,
): Promise<MeasurementResponse<IMeasurement>> {
  try {
    const {
      _id,
      ownerId: _ownerId,
      customerName: _customerName,
      customerPhone: _customerPhone,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...payload
    } = measurement;
    const { data } = _id
      ? await apiClient.patch<MeasurementResponse<IMeasurement>>(endpoints.measurements.detail(_id), payload)
      : await apiClient.post<MeasurementResponse<IMeasurement>>(endpoints.measurements.list, payload);
    return data;
  } catch (error) {
    return {
      success: false,
      data: null,
      message: getErrorMessage(error, 'serviceMessages.saveFail'),
    };
  }
}

export async function deleteMeasurement(
  id: string,
): Promise<MeasurementResponse<null>> {
  try {
    const { data } = await apiClient.delete<MeasurementResponse<null>>(
      endpoints.measurements.detail(id),
    );
    return data;
  } catch (error) {
    return {
      success: false,
      data: null,
      message: getErrorMessage(error, 'serviceMessages.deleteFail'),
    };
  }
}
