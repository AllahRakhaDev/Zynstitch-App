import { apiClient, getErrorMessage } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { ServiceResponse } from '@/types/serviceResponse.types';
import type {
  CreateExportJobPayload,
  ExportJob,
  ExportJobResponse,
} from '@/types/jobs.types';

export async function createJob(
  payload: CreateExportJobPayload,
): Promise<ExportJobResponse<{ jobId: string }>> {
  try {
    const { data } = await apiClient.post<ExportJobResponse<{ jobId: string }>>(
      endpoints.jobs.create,
      payload,
    );
    return data;
  } catch (error) {
    return {
      success: false,
      data: null,
      message: getErrorMessage(error, 'serviceMessages.exportJobCreateFail'),
    };
  }
}

export async function fetchJobs(
  page = 0,
  limit = 20,
  filters?: Record<string, string>,
): Promise<ExportJobResponse<{ jobs: ExportJob[]; total: number }>> {
  try {
    const { data } = await apiClient.get<
      ExportJobResponse<{ jobs: ExportJob[]; total: number }>
    >(endpoints.jobs.list, { params: { page, limit, ...filters } });
    return data;
  } catch (error) {
    return {
      success: false,
      data: { jobs: [], total: 0 },
      message: getErrorMessage(error, 'serviceMessages.fetchFail'),
    };
  }
}

export async function deleteJob(id: string): Promise<ExportJobResponse<null>> {
  try {
    const { data } = await apiClient.delete<ExportJobResponse<null>>(
      endpoints.jobs.detail(id),
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

/** Short-lived signed URL for a completed export file. */
export async function getJobDownloadUrl(
  id: string,
): Promise<ExportJobResponse<{ url: string; fileName: string }>> {
  try {
    const { data } = await apiClient.get<
      ExportJobResponse<{ url: string; fileName: string }>
    >(endpoints.jobs.download(id));
    return data;
  } catch (error) {
    return {
      success: false,
      data: null,
      message: getErrorMessage(error, 'serviceMessages.downloadFail'),
    };
  }
}

/** SUPER_ADMIN only: ask the export worker to process pending jobs now. */
export async function triggerJobsProcessing(): Promise<ServiceResponse<null>> {
  try {
    const { data } = await apiClient.post<ServiceResponse<null>>(endpoints.jobs.process);
    return data;
  } catch (error) {
    return {
      success: false,
      data: null,
      message: getErrorMessage(error, 'serviceMessages.cronTriggerFail'),
    };
  }
}
