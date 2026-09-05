import { NewsItem, PaginationParams, PaginatedResponse } from '../types';
import { NewsRepository } from '../repositories/NewsRepository';
import { isValidNewsTitle, isValidNewsContent, isValidNewsCategory } from '../utils';

/**
 * Service for managing news items
 * Handles business logic for news operations
 */
class NewsService {
  constructor(private newsRepository: NewsRepository) {}

  /**
   * Create a new news item
   * @param title - News title
   * @param content - News content
   * @param category - News category
   * @param source - Optional news source
   * @returns Created news item
   * @throws Error if validation fails
   */
  async createNews(
    title: string,
    content: string,
    category: 'breaking_news' | 'market' | 'disaster' | 'other',
    source?: string,
  ): Promise<NewsItem> {
    // Validate inputs
    if (!isValidNewsTitle(title)) {
      throw new Error('Invalid news title');
    }

    if (!isValidNewsContent(content)) {
      throw new Error('Invalid news content');
    }

    if (!isValidNewsCategory(category)) {
      throw new Error('Invalid news category');
    }

    const now = new Date().toISOString();

    const newsItem = await this.newsRepository.create({
      title: title.trim(),
      content: content.trim(),
      category,
      source: source?.trim() || undefined,
      timestamp: now,
    });

    return newsItem;
  }

  /**
   * Retrieve a single news item by ID
   * @param id - News ID
   * @returns News item or null if not found
   */
  async getNews(id: string): Promise<NewsItem | null> {
    return this.newsRepository.getById(id);
  }

  /**
   * List news items with pagination
   * @param params - Pagination parameters
   * @returns Paginated news items
   */
  async listNews(params: PaginationParams): Promise<PaginatedResponse<NewsItem>> {
    const { page, limit } = params;

    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    return this.newsRepository.getAll({ page, limit });
  }

  /**
   * Filter news by category
   * @param category - News category
   * @param params - Pagination parameters
   * @returns Paginated news items
   */
  async filterNews(
    category: string,
    params: PaginationParams,
  ): Promise<PaginatedResponse<NewsItem>> {
    if (!isValidNewsCategory(category)) {
      throw new Error('Invalid category');
    }

    const { page, limit } = params;

    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    return this.newsRepository.getByCategory(
      category as 'breaking_news' | 'market' | 'disaster' | 'other',
      { page, limit },
    );
  }
}

export default NewsService;
