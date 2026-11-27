/**
 * REST paths served by zynstitch-app-backend (NestJS).
 * Set the base URL with EXPO_PUBLIC_API_URL — keep these paths aligned with the backend.
 */
export const endpoints = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
    changePassword: '/api/auth/change-password',
  },
  customers: {
    list: '/api/customers',
    detail: (id: string) => `/api/customers/${id}`,
  },
  measurements: {
    list: '/api/measurements',
    detail: (id: string) => `/api/measurements/${id}`,
  },
  orders: {
    list: '/api/orders',
    detail: (id: string) => `/api/orders/${id}`,
  },
  jobs: {
    list: '/api/jobs',
    create: '/api/jobs',
    detail: (id: string) => `/api/jobs/${id}`,
    download: (id: string) => `/api/jobs/${id}/download`,
    process: '/api/jobs/process',
  },
  users: {
    list: '/api/users',
    detail: (id: string) => `/api/users/${id}`,
    profile: '/api/users/profile',
    photoUploadUrl: '/api/users/profile/photo-upload-url',
  },
  support: {
    contact: '/api/support',
  },
} as const;
