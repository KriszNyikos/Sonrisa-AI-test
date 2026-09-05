/**
 * Interfaces for the Alert System
 */

/**
 * Represents a single alert for monitoring news
 */
export interface Alert {
  id: string;
  name: string;
  description?: string;
  keywords: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a notification channel (email or Slack)
 */
export interface NotificationChannel {
  id: string;
  alertId: string;
  type: 'email' | 'slack';
  destination: string;
  isEnabled: boolean;
  createdAt: string;
}

/**
 * Represents a news item
 */
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: 'breaking_news' | 'market' | 'disaster' | 'other';
  source?: string;
  timestamp: string;
  createdAt: string;
}

/**
 * Represents a notification log entry
 */
export interface NotificationLog {
  id: string;
  alertId: string;
  newsItemId: string;
  channelType: 'email' | 'slack';
  destination: string;
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
  timestamp: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
