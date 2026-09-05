/**
 * Notification Channel Repository - CRUD operations for notification channels
 */

import { Database } from 'sqlite';
import { NotificationChannel } from '../types';
import { generateId, createLogger } from '../utils';

const logger = createLogger('NotificationChannelRepository');

export class NotificationChannelRepository {
  constructor(private db: Database) {}

  /**
   * Creates a new notification channel
   */
  async create(
    channel: Omit<NotificationChannel, 'id' | 'createdAt'>,
  ): Promise<NotificationChannel> {
    const id = generateId();
    const now = new Date().toISOString();

    try {
      await this.db.run(
        `INSERT INTO notification_channels (id, alert_id, type, destination, is_enabled, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, channel.alertId, channel.type, channel.destination, channel.isEnabled ? 1 : 0, now],
      );

      logger.info('Notification channel created', { channelId: id, alertId: channel.alertId });
      return {
        id,
        ...channel,
        createdAt: now,
      };
    } catch (error) {
      logger.error('Failed to create notification channel', error);
      throw error;
    }
  }

  /**
   * Gets a notification channel by ID
   */
  async getById(id: string): Promise<NotificationChannel | null> {
    try {
      const row = await this.db.get<any>(
        `SELECT id, alert_id as alertId, type, destination, is_enabled as isEnabled, created_at as createdAt
         FROM notification_channels WHERE id = ?`,
        [id],
      );

      if (!row) {
        return null;
      }

      return {
        ...row,
        isEnabled: Boolean(row.isEnabled),
      };
    } catch (error) {
      logger.error('Failed to get notification channel', error);
      throw error;
    }
  }

  /**
   * Gets all channels for a specific alert
   */
  async getByAlertId(alertId: string): Promise<NotificationChannel[]> {
    try {
      const rows = await this.db.all<any[]>(
        `SELECT id, alert_id as alertId, type, destination, is_enabled as isEnabled, created_at as createdAt
         FROM notification_channels WHERE alert_id = ? ORDER BY created_at DESC`,
        [alertId],
      );

      return rows.map((row) => ({
        ...row,
        isEnabled: Boolean(row.isEnabled),
      }));
    } catch (error) {
      logger.error('Failed to get channels for alert', error);
      throw error;
    }
  }

  /**
   * Gets enabled channels for a specific alert
   */
  async getEnabledByAlertId(alertId: string): Promise<NotificationChannel[]> {
    try {
      const rows = await this.db.all<any[]>(
        `SELECT id, alert_id as alertId, type, destination, is_enabled as isEnabled, created_at as createdAt
         FROM notification_channels WHERE alert_id = ? AND is_enabled = 1 ORDER BY created_at DESC`,
        [alertId],
      );

      return rows.map((row) => ({
        ...row,
        isEnabled: Boolean(row.isEnabled),
      }));
    } catch (error) {
      logger.error('Failed to get enabled channels for alert', error);
      throw error;
    }
  }

  /**
   * Updates a notification channel
   */
  async update(
    id: string,
    updates: Partial<Omit<NotificationChannel, 'id' | 'createdAt' | 'alertId'>>,
  ): Promise<NotificationChannel | null> {
    try {
      const channel = await this.getById(id);
      if (!channel) {
        return null;
      }

      const merged = { ...channel, ...updates };

      await this.db.run(
        `UPDATE notification_channels
         SET type = ?, destination = ?, is_enabled = ?
         WHERE id = ?`,
        [merged.type, merged.destination, merged.isEnabled ? 1 : 0, id],
      );

      logger.info('Notification channel updated', { channelId: id });
      return merged;
    } catch (error) {
      logger.error('Failed to update notification channel', error);
      throw error;
    }
  }

  /**
   * Toggles channel enabled status
   */
  async toggle(id: string): Promise<NotificationChannel | null> {
    try {
      const channel = await this.getById(id);
      if (!channel) {
        return null;
      }

      return this.update(id, { isEnabled: !channel.isEnabled });
    } catch (error) {
      logger.error('Failed to toggle notification channel', error);
      throw error;
    }
  }

  /**
   * Deletes a notification channel
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db.run(`DELETE FROM notification_channels WHERE id = ?`, [id]);

      if ((result as any).changes > 0) {
        logger.info('Notification channel deleted', { channelId: id });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to delete notification channel', error);
      throw error;
    }
  }

  /**
   * Counts total notification channels for an alert
   */
  async countByAlertId(alertId: string): Promise<number> {
    try {
      const result = await this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM notification_channels WHERE alert_id = ?`,
        [alertId],
      );
      return result?.count || 0;
    } catch (error) {
      logger.error('Failed to count channels for alert', error);
      throw error;
    }
  }

  /**
   * Checks if a channel already exists for an alert (to prevent duplicates)
   */
  async exists(alertId: string, type: string, destination: string): Promise<boolean> {
    try {
      const result = await this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM notification_channels
         WHERE alert_id = ? AND type = ? AND destination = ?`,
        [alertId, type, destination],
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      logger.error('Failed to check if channel exists', error);
      throw error;
    }
  }

  /**
   * Deletes all notification channels for an alert
   */
  async deleteByAlertId(alertId: string): Promise<number> {
    try {
      const result = await this.db.run(`DELETE FROM notification_channels WHERE alert_id = ?`, [alertId]);

      const count = (result as any).changes || 0;
      if (count > 0) {
        logger.info('Notification channels deleted for alert', { alertId, count });
      }
      return count;
    } catch (error) {
      logger.error('Failed to delete channels for alert', error);
      throw error;
    }
  }
}
