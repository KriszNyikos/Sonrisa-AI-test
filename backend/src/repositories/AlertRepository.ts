/**
 * Alert Repository - CRUD operations for alerts
 */

import { Database } from 'sqlite';
import { Alert } from '../types';
import { generateId, createLogger } from '../utils';

const logger = createLogger('AlertRepository');

export class AlertRepository {
  constructor(private db: Database) {}

  /**
   * Creates a new alert
   */
  async create(alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alert> {
    const id = generateId();
    const now = new Date().toISOString();
    const keywordsJson = JSON.stringify(alert.keywords);

    try {
      await this.db.run(
        `INSERT INTO alerts (id, name, description, keywords, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, alert.name, alert.description || null, keywordsJson, alert.isActive ? 1 : 0, now, now],
      );

      logger.info('Alert created', { alertId: id });
      return {
        id,
        ...alert,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      logger.error('Failed to create alert', error);
      throw error;
    }
  }

  /**
   * Gets an alert by ID
   */
  async getById(id: string): Promise<Alert | null> {
    try {
      const row = await this.db.get<any>(
        `SELECT id, name, description, keywords, is_active as isActive, created_at as createdAt, updated_at as updatedAt
         FROM alerts WHERE id = ?`,
        [id],
      );

      if (!row) {
        return null;
      }

      return {
        ...row,
        keywords: JSON.parse(row.keywords),
        isActive: Boolean(row.isActive),
      };
    } catch (error) {
      logger.error('Failed to get alert', error);
      throw error;
    }
  }

  /**
   * Gets all alerts
   */
  async getAll(): Promise<Alert[]> {
    try {
      const rows = await this.db.all<any[]>(
        `SELECT id, name, description, keywords, is_active as isActive, created_at as createdAt, updated_at as updatedAt
         FROM alerts ORDER BY created_at DESC`,
      );

      return rows.map((row) => ({
        ...row,
        keywords: JSON.parse(row.keywords),
        isActive: Boolean(row.isActive),
      }));
    } catch (error) {
      logger.error('Failed to get all alerts', error);
      throw error;
    }
  }

  /**
   * Gets active alerts only
   */
  async getActiveAlerts(): Promise<Alert[]> {
    try {
      const rows = await this.db.all<any[]>(
        `SELECT id, name, description, keywords, is_active as isActive, created_at as createdAt, updated_at as updatedAt
         FROM alerts WHERE is_active = 1 ORDER BY created_at DESC`,
      );

      return rows.map((row) => ({
        ...row,
        keywords: JSON.parse(row.keywords),
        isActive: Boolean(row.isActive),
      }));
    } catch (error) {
      logger.error('Failed to get active alerts', error);
      throw error;
    }
  }

  /**
   * Updates an alert
   */
  async update(id: string, updates: Partial<Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Alert | null> {
    try {
      const alert = await this.getById(id);
      if (!alert) {
        return null;
      }

      const now = new Date().toISOString();
      const merged = { ...alert, ...updates };
      const keywordsJson = JSON.stringify(merged.keywords);

      await this.db.run(
        `UPDATE alerts
         SET name = ?, description = ?, keywords = ?, is_active = ?, updated_at = ?
         WHERE id = ?`,
        [merged.name, merged.description || null, keywordsJson, merged.isActive ? 1 : 0, now, id],
      );

      logger.info('Alert updated', { alertId: id });
      return { ...merged, updatedAt: now };
    } catch (error) {
      logger.error('Failed to update alert', error);
      throw error;
    }
  }

  /**
   * Toggles alert active status
   */
  async toggle(id: string): Promise<Alert | null> {
    try {
      const alert = await this.getById(id);
      if (!alert) {
        return null;
      }

      return this.update(id, { isActive: !alert.isActive });
    } catch (error) {
      logger.error('Failed to toggle alert', error);
      throw error;
    }
  }

  /**
   * Deletes an alert and cascades delete to channels and logs
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db.run(`DELETE FROM alerts WHERE id = ?`, [id]);

      if ((result as any).changes > 0) {
        logger.info('Alert deleted', { alertId: id });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to delete alert', error);
      throw error;
    }
  }

  /**
   * Counts total alerts
   */
  async count(): Promise<number> {
    try {
      const result = await this.db.get<{ count: number }>(`SELECT COUNT(*) as count FROM alerts`);
      return result?.count || 0;
    } catch (error) {
      logger.error('Failed to count alerts', error);
      throw error;
    }
  }
}
