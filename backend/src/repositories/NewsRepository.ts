/**
 * News Repository - CRUD operations for news items
 */

import { Database } from 'sqlite';
import { NewsItem, PaginationParams, PaginatedResponse } from '../types';
import { generateId, createLogger } from '../utils';

const logger = createLogger('NewsRepository');

export class NewsRepository {
  constructor(private db: Database) {}

  /**
   * Creates a new news item
   */
  async create(news: Omit<NewsItem, 'id' | 'createdAt'>): Promise<NewsItem> {
    const id = generateId();
    const now = new Date().toISOString();

    try {
      await this.db.run(
        `INSERT INTO news_items (id, title, content, category, source, timestamp, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, news.title, news.content, news.category, news.source || null, news.timestamp, now],
      );

      logger.info('News item created', { newsId: id });
      return {
        id,
        ...news,
        createdAt: now,
      };
    } catch (error) {
      logger.error('Failed to create news item', error);
      throw error;
    }
  }

  /**
   * Gets a news item by ID
   */
  async getById(id: string): Promise<NewsItem | null> {
    try {
      const row = await this.db.get<any>(
        `SELECT id, title, content, category, source, timestamp, created_at as createdAt
         FROM news_items WHERE id = ?`,
        [id],
      );

      if (!row) {
        return null;
      }

      return row;
    } catch (error) {
      logger.error('Failed to get news item', error);
      throw error;
    }
  }

  /**
   * Gets all news items with pagination
   */
  async getAll(pagination: PaginationParams): Promise<PaginatedResponse<NewsItem>> {
    try {
      const limit = pagination.limit || 20;
      const offset = (pagination.page - 1) * limit || 0;

      const rows = await this.db.all<any[]>(
        `SELECT id, title, content, category, source, timestamp, created_at as createdAt
         FROM news_items ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
        [limit, offset],
      );

      const totalResult = await this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM news_items`,
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
      logger.error('Failed to get all news items', error);
      throw error;
    }
  }

  /**
   * Gets news items by category with pagination
   */
  async getByCategory(
    category: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<NewsItem>> {
    try {
      const limit = pagination.limit || 20;
      const offset = (pagination.page - 1) * limit || 0;

      const rows = await this.db.all<any[]>(
        `SELECT id, title, content, category, source, timestamp, created_at as createdAt
         FROM news_items WHERE category = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
        [category, limit, offset],
      );

      const totalResult = await this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM news_items WHERE category = ?`,
        [category],
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
      logger.error('Failed to get news items by category', error);
      throw error;
    }
  }

  /**
   * Gets news items within a date range
   */
  async getByDateRange(
    startDate: string,
    endDate: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<NewsItem>> {
    try {
      const limit = pagination.limit || 20;
      const offset = (pagination.page - 1) * limit || 0;

      const rows = await this.db.all<any[]>(
        `SELECT id, title, content, category, source, timestamp, created_at as createdAt
         FROM news_items WHERE timestamp >= ? AND timestamp <= ?
         ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
        [startDate, endDate, limit, offset],
      );

      const totalResult = await this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM news_items
         WHERE timestamp >= ? AND timestamp <= ?`,
        [startDate, endDate],
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
      logger.error('Failed to get news items by date range', error);
      throw error;
    }
  }

  /**
   * Updates a news item
   */
  async update(
    id: string,
    updates: Partial<Omit<NewsItem, 'id' | 'createdAt'>>,
  ): Promise<NewsItem | null> {
    try {
      const news = await this.getById(id);
      if (!news) {
        return null;
      }

      const merged = { ...news, ...updates };

      await this.db.run(
        `UPDATE news_items
         SET title = ?, content = ?, category = ?, source = ?, timestamp = ?
         WHERE id = ?`,
        [merged.title, merged.content, merged.category, merged.source || null, merged.timestamp, id],
      );

      logger.info('News item updated', { newsId: id });
      return merged;
    } catch (error) {
      logger.error('Failed to update news item', error);
      throw error;
    }
  }

  /**
   * Deletes a news item
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db.run(`DELETE FROM news_items WHERE id = ?`, [id]);

      if ((result as any).changes > 0) {
        logger.info('News item deleted', { newsId: id });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to delete news item', error);
      throw error;
    }
  }

  /**
   * Counts total news items
   */
  async count(): Promise<number> {
    try {
      const result = await this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM news_items`,
      );
      return result?.count || 0;
    } catch (error) {
      logger.error('Failed to count news items', error);
      throw error;
    }
  }

  /**
   * Gets the latest news item
   */
  async getLatest(): Promise<NewsItem | null> {
    try {
      const row = await this.db.get<any>(
        `SELECT id, title, content, category, source, timestamp, created_at as createdAt
         FROM news_items ORDER BY timestamp DESC LIMIT 1`,
      );

      return row || null;
    } catch (error) {
      logger.error('Failed to get latest news item', error);
      throw error;
    }
  }
}
