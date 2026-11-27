import { File } from 'expo-file-system';
import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

import { apiClient, getErrorMessage } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { ServiceResponse } from '@/types/serviceResponse.types';

export const PROFILE_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const PROFILE_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

type PhotoContentType = (typeof PROFILE_PHOTO_TYPES)[number];

function contentTypeOf(asset: ImagePickerAsset): PhotoContentType | null {
  const fromAsset = asset.mimeType ?? asset.file?.type;
  const guessed =
    fromAsset ??
    (/\.png$/i.test(asset.fileName ?? asset.uri)
      ? 'image/png'
      : /\.webp$/i.test(asset.fileName ?? asset.uri)
        ? 'image/webp'
        : 'image/jpeg');
  const normalized = guessed === 'image/jpg' ? 'image/jpeg' : guessed;
  return (PROFILE_PHOTO_TYPES as readonly string[]).includes(normalized)
    ? (normalized as PhotoContentType)
    : null;
}

/**
 * Uploads a picked image straight to storage through a presigned URL and
 * returns the storage key to save on the profile.
 */
export async function uploadProfilePhoto(
  asset: ImagePickerAsset,
): Promise<ServiceResponse<{ key: string }>> {
  const contentType = contentTypeOf(asset);
  if (!contentType) {
    return { success: false, data: null, message: 'profile.invalidImageType' };
  }
  const fileSize = asset.fileSize ?? asset.file?.size;
  if (fileSize && fileSize > PROFILE_PHOTO_MAX_BYTES) {
    return { success: false, data: null, message: 'profile.imageTooLarge' };
  }

  try {
    const { data } = await apiClient.post<
      ServiceResponse<{ uploadUrl: string; key: string; contentType: string }>
    >(endpoints.users.photoUploadUrl, { contentType, fileSize });
    if (!data.success || !data.data) {
      return { success: false, data: null, message: data.message };
    }
    const { uploadUrl, key } = data.data;

    let status: number;
    if (Platform.OS === 'web') {
      const body = asset.file ?? (await (await fetch(asset.uri)).blob());
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body,
      });
      status = response.status;
    } else {
      const result = await new File(asset.uri).upload(uploadUrl, {
        httpMethod: 'PUT',
        mimeType: contentType,
        headers: { 'Content-Type': contentType },
      });
      status = result.status;
    }

    if (status < 200 || status >= 300) {
      return { success: false, data: null, message: 'profile.imageUploadFailed' };
    }
    return { success: true, data: { key }, message: 'profile.photoUploaded' };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: getErrorMessage(error, 'profile.imageUploadFailed'),
    };
  }
}
