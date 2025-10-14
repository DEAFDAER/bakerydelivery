export interface ApiError extends Error {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const apiError = error as ApiError;
    return apiError.response?.data?.detail || apiError.message || 'An error occurred';
  }
  return 'An error occurred';
};