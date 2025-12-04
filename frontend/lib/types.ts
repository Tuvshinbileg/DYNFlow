// Content Type Interfaces
export interface ContentType {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  fields: Array<{
    field_name: string;
    display_name: string;
    field_type: string;
    is_required: boolean;
    help_text?: string;
    default_value?: unknown;
    choices?: Array<{ value: string; label: string , option: string}>;
  }>;
  field_count: number;
  created_at: string;
  updated_at: string;
}

export interface ContentTypeListItem {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  field_count: number;
}

// Content Type Response structure (from backend) - alias for ContentType
export type ContentTypeResponse = ContentType;

// Content Interfaces
export interface Content extends Record<string, unknown> {
  id: string;
  content_type: string;
  created_at: string;
  updated_at: string;
}

export interface ContentListResponse {
  count: number;
  results: Content[];
}

// Form Data
export type FormData = Record<string, unknown>;

// API Error
export interface ApiError {
  error?: string;
  message?: string;
  detail?: string;
  [key: string]: unknown;
}
