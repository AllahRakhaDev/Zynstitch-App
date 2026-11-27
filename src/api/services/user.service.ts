import { apiClient, getErrorMessage } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { ServiceResponse } from '@/types/serviceResponse.types';
import type {
  IUser,
  IUserFormValues,
  IUserProfile,
  UpdateProfilePayload,
  UserResponse,
} from '@/types/users.types';

export async function fetchAllAdminUsers(
  page = 0,
  limit = 20,
  filters?: Record<string, string>,
): Promise<UserResponse<{ users: IUser[]; total: number }>> {
  try {
    const { data } = await apiClient.get<UserResponse<{ users: IUser[]; total: number }>>(
      endpoints.users.list,
      { params: { page, limit, ...filters } },
    );
    return data;
  } catch (error) {
    return {
      success: false,
      data: { users: [], total: 0 },
      message: getErrorMessage(error, 'serviceMessages.fetchFail'),
    };
  }
}

/** Creates a user, or updates one when `_id` is set (blank password keeps the current one). */
export async function saveAdminUser(
  user: Partial<IUserFormValues> & Pick<IUserFormValues, 'name' | 'email' | 'role' | 'status'> & { _id?: string },
): Promise<UserResponse<IUser>> {
  try {
    const { data } = await apiClient.post<UserResponse<IUser>>(endpoints.users.list, user);
    return data;
  } catch (error) {
    return {
      success: false,
      data: null,
      message: getErrorMessage(error, 'serviceMessages.saveFail'),
    };
  }
}

export async function deleteAdminUser(id: string): Promise<UserResponse<null>> {
  try {
    const { data } = await apiClient.delete<UserResponse<null>>(endpoints.users.detail(id));
    return data;
  } catch (error) {
    return {
      success: false,
      data: null,
      message: getErrorMessage(error, 'serviceMessages.deleteFail'),
    };
  }
}

/** Updates the signed-in user's own profile; `_userId` is kept for call-site compatibility. */
export async function updateUserProfile(
  _userId: string,
  payload: UpdateProfilePayload,
): Promise<ServiceResponse<IUserProfile>> {
  try {
    const { data } = await apiClient.put<ServiceResponse<IUserProfile>>(
      endpoints.users.profile,
      payload,
    );
    return data;
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, 'profile.updateError'),
      data: null,
    };
  }
}
