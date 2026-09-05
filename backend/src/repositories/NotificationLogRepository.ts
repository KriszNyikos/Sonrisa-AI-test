/**
 * Notification Log Repository - CRUD operations for notification logs
 */

import { Database } from 'sqlite';
import { NotificationLog, PaginationParams, PaginatedResponse } from '../types';
import { generateId, createLogger } from '../utils';

const logger = createLogger('NotificationLogRepository');

export class NotificationLogRepository {
  constructor(private db: Database) {}

  /**
   * Creates a new notification log entry
   */
  async create(
    log: Omit<NotificationLog, 'id' | 'createdAt'>,
  ): Promise<NotificationLog> {
    const id = generateId();
    const now = new Date().toISOString();

    try {
      await this.db.run(
        `INSERT INTO notification_logs (id, alert_id, news_item_id, channel_type, destination, status, error_message, sent_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          log.alertId,
          log.newsItemId,
          log.channelType,
          log.destination,
          log.status,
          log.errorMessage || null,
          log.sentAt || null,
          now,
        ],
      );

      logger.info('Notification log created', { logId: id, alertId: log.alertId });
      return {
        id,
        ...log,
        createdAt: now,
      };
    } catch (error) {
      logger.error('Failed to create notification log', error);
      throw error;
    }
  }

  /**
   * Gets a notification log by ID
   */
  async getById(id: string): Promise<NotificationLog | null> {
    try {
      const row = await this.db.get<any>(
        `SELECT id, alert_id as alertId, news_item_id as newsItemId, channel_type as channelType,
                destination, status, error_message as errorMessage, sent_at as sentAt, created_at as createdAt
         FROM notification_logs WHERE id = ?`,
        [id],
      );

      if (!row) {
        return null;
      }

      return row;
    } catch (error) {
      logger.error('Failed to get notification log', error);
      throw error;
    }
  }

  /**
   * Gets all notification logs with pagination
   */
  async getAll(pagination: PaginationParams): Promise<PaginatedResponse<NotificationLog>> {
    try {
      const limit = pagination.limit || 20;
      const offset = (pagination.page - 1) * limit || 0;

      const rows = await this.db.all<any[]>(
        `SELECT id, alert_id as alertId, news_item_id as newsItemId, channel_type as channelType,
                destination, status, error_message as errorMessage, sent_at as sentAt, created_at as createdAt
         FROM notification_logs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset],
      );

      const totalResult = await this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM notification_logs`,
      );

      const total = totalResult?.count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        items: rows,
        total,
        page: pagination.page,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error('Failed to get all notification logs', error);
      throw error;
    }
  }

  /**
   * Gets notification logs for a specific alert
   */
  async getByAlertId(
    alertId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<NotificationLog>> {
    try {
      const limit = pagination.limit || 20;
      const offset = (pagination.page - 1) * limit || 0;

      const rows = await this.db.all<any[]>(
        `SELECT id, alert_id as alertId, news_item_id as newsItemId, channel_type as channelType,
                destination, status, error_message as errorMessage, sent_at as sentAt, created_at as createdAt
         FROM notification_logs WHERE alert_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [alertId, limit, offset],
      );

      const totalResult = await this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM notification_logs WHERE alert_id = ?`,
        [alertId],
      );

      const total = totalResult?.count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        items: rows,
        total,
        page: pagination.page,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error('Failed to get logs for alert', error);
      throw error;
    }
  }

  /**
   * Gets notification logs for a specific news item
   */
  async getByNewsItemId(
    newsItemId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<NotificationLog>> {
    try {
      const limit = pagination.limit || 20;
      const offset = (pagination.page - 1) * limit || 0;

      const rows = await this.db.all<any[]>(
        `SELECT id, alert_id as alertId, news_item_id as newsItemId, channel_type as channelType,
                destination, status, error_message as errorMessage, sent_at as sentAt, created_at as createdAt
         FROM notification_logs WHERE news_item_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [newsItemId, limit, offset],
      );

      const totalResult = await this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM notification_logs WHERE news_item_id = ?`,
        [newsItemId],
      );

      const total = totalResult?.count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        items: rows,
        total,
        page: pagination.page,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error('Failed to get logs for news item', error);
      throw error;
    }
  }

  /**
   * Gets notification logs by status
   */
  async getByStatus(
    status: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<NotificationLog>> {
    try {
      const limit = pagination.limit || 20;
      const offset = (pagination.page - 1) * limit || 0;

      const rows = await this.db.all<any[]>(
        `SELECT id, alert_id as alertId, news_item_id as newsItemId, channel_type as channelType,
                destination, status, error_message as errorMessage, sent_at as sentAt, created_at as createdAt
         FROM notification_logs WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [status, limit, offset],
      );

      const totalResult = await this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM notification_logs WHERE status = ?`,
        [status],
      );

      const total = totalResult?.count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        items: rows,
        total,
        page: pagination.page,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error('Failed to get logs by status', error);
      throw error;
    }
  }

  /**
   * Updates a notification log
   */
  async update(
    id: string,
    updates: Partial<Omit<NotificationLog, 'id' | 'createdAt' | 'alertId' | 'newsItemId'>>,
  ): Promise<NotificationLog | null> {
    try {
      const log = await this.getById(id);
      if (!log) {
        return null;
      }

      const merged = { ...log, ...updates };

      await this.db.run(
        `UPDATE notification_logs
         SET status = ?, error_message = ?, sent_at = ?
         WHERE id = ?`,
        [merged.status, merged.errorMessage || null, merged.sentAt || null, id],
      );

      logger.info('Notification log updated', { logId: id });
      return merged;
    } catch (error) {
      logger.error('Failed to update notification log', error);
      throw error;
    }
  }

  /**
   * Marks a notification as sent
   */
  async markAsSent(id: string, sentAt?: string): Promise<NotificationLog | null> {
    const now = sentAt || new Date().toISOString();
    return this.update(id, { status: 'sent', sentAt: now });
  }

  /**
   * Marks a notification as failed
   */
  async markAsFailed(id: string, errorMessage: string): Promise<NotificationLog | null> {
    return this.update(id, { status: 'failed', errorMessage });
  }

  /**
   * Counts total notification logs
   */
  async count(): Promise<number> {
    try {
      const result = await this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM notification_logs`,
      );
      return result?.count || 0;
    } catch (error) {
      logger.error('Failed to count notification logs', error);
      throw error;
    }
  }

  /**
   * Counts notification logs by status
   */
  async countByStatus(status: string): Promise<number> {
    try {
      const result = await this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM notification_logs WHERE status = ?`,
        [status],
      );
      return result?.count || 0;
    } catch (error) {
      logger.error('Failed to count logs by status', error);
      throw error;
    }
  }

  /**
   * Gets statistics about notifications
   */
  async getStatistics(): Promise<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
  }> {
    try {
      const result = await this.db.get<{
        total: number;
        sent: number;
        failed: number;
        pending: number;
      }>(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
         FROM notification_logs`,
      );

      return {
        total: result?.total || 0,
        sent: result?.sent || 0,
        failed: result?.failed || 0,
        pending: result?.pending || 0,
      };
    } catch (error) {
      logger.error('Failed to get notification statistics', error);
      throw error;
    }
  }
}
