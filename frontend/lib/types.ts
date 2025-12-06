// API Error
export interface ApiError {
  error?: string;
  message?: string;
  detail?: string;
  [key: string]: unknown;
}
