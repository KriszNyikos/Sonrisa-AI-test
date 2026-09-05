import NewsService from '../../src/services/NewsService';
import { NewsItem, PaginationParams } from '../../src/types';

jest.mock('../../src/repositories/NewsRepository');

describe('NewsService', () => {
  let service: NewsService;
  let mockNewsRepo: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockNewsRepo = {
      create: jest.fn(),
      getById: jest.fn(),
      getAll: jest.fn(),
      count: jest.fn(),
      getByCategory: jest.fn(),
      countByCategory: jest.fn(),
    };
    
    service = new NewsService(mockNewsRepo);
  });

  describe('createNews', () => {
    it('should create news item with valid inputs', async () => {
      const mockNews: NewsItem = {
        id: 'news_123',
        title: 'Market Update',
        content: 'Stock market surges today',
        category: 'market',
        timestamp: expect.any(String),
        createdAt: expect.any(String),
      };

      mockNewsRepo.create.mockResolvedValue(mockNews);

      const result = await service.createNews('Market Update', 'Stock market surges today', 'market');

      expect(mockNewsRepo.create).toHaveBeenCalled();
      expect(result.title).toBe('Market Update');
      expect(result.category).toBe('market');
    });

    it('should create news with optional source', async () => {
      const mockNews: NewsItem = {
        id: 'news_123',
        title: 'Breaking News',
        content: 'Earthquake detected',
        category: 'disaster',
        source: 'Reuters',
        timestamp: expect.any(String),
        createdAt: expect.any(String),
      };

      mockNewsRepo.create.mockResolvedValue(mockNews);

      const result = await service.createNews('Breaking News', 'Earthquake detected', 'disaster', 'Reuters');

      expect(result.source).toBe('Reuters');
    });

    it('should throw error for invalid title', async () => {
      await expect(service.createNews('', 'content', 'market')).rejects.toThrow('Invalid news title');
    });

    it('should throw error for invalid content', async () => {
      await expect(service.createNews('Title', '', 'market')).rejects.toThrow('Invalid news content');
    });

    it('should throw error for invalid category', async () => {
      await expect(service.createNews('Title', 'Content', 'invalid' as any)).rejects.toThrow('Invalid news category');
    });

    it('should handle all valid categories', async () => {
      const mockNews: NewsItem = {
        id: 'news_123',
        title: 'Test',
        content: 'Test content',
        category: 'breaking_news',
        timestamp: expect.any(String),
        createdAt: expect.any(String),
      };

      mockNewsRepo.create.mockResolvedValue(mockNews);

      const categories = ['breaking_news', 'market', 'disaster', 'other'] as const;

      for (const category of categories) {
        await service.createNews('Test', 'Test content', category);
        expect(mockNewsRepo.create).toHaveBeenCalled();
      }

      expect(mockNewsRepo.create).toHaveBeenCalledTimes(4);
    });
  });

  describe('getNews', () => {
    it('should return news item by ID', async () => {
      const mockNews: NewsItem = {
        id: 'news_123',
        title: 'Test News',
        content: 'Test content',
        category: 'market',
        timestamp: '2026-01-01T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
      };

      mockNewsRepo.getById.mockResolvedValue(mockNews);

      const result = await service.getNews('news_123');

      expect(result).toEqual(mockNews);
    });

    it('should return null if news not found', async () => {
      mockNewsRepo.getById.mockResolvedValue(null);

      const result = await service.getNews('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('listNews', () => {
    it('should return paginated news items', async () => {
      const mockNews: NewsItem[] = [
        {
          id: 'news_1',
          title: 'News 1',
          content: 'Content 1',
          category: 'market',
          timestamp: '2026-01-01T00:00:00Z',
          createdAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'news_2',
          title: 'News 2',
          content: 'Content 2',
          category: 'breaking_news',
          timestamp: '2026-01-02T00:00:00Z',
          createdAt: '2026-01-02T00:00:00Z',
        },
      ];

      mockNewsRepo.getAll.mockResolvedValue({
        items: mockNews,
        total: 10,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      const params: PaginationParams = { page: 1, limit: 10 };
      const result = await service.listNews(params);

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(mockNewsRepo.getAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should throw error for invalid page number', async () => {
      const params: PaginationParams = { page: 0, limit: 10 };

      await expect(service.listNews(params)).rejects.toThrow('Page must be greater than 0');
    });

    it('should throw error for invalid limit', async () => {
      const params: PaginationParams = { page: 1, limit: 101 };

      await expect(service.listNews(params)).rejects.toThrow('Limit must be between 1 and 100');
    });

    it('should calculate total pages correctly', async () => {
      mockNewsRepo.getAll.mockResolvedValue({
        items: [],
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
      });

      const params: PaginationParams = { page: 1, limit: 10 };
      const result = await service.listNews(params);

      expect(result.totalPages).toBe(3);
    });

    it('should handle multiple pages', async () => {
      mockNewsRepo.getAll.mockResolvedValue({
        items: [],
        total: 20,
        page: 2,
        limit: 10,
        totalPages: 2,
      });

      const params: PaginationParams = { page: 2, limit: 10 };
      const result = await service.listNews(params);

      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(2);
    });
  });

  describe('filterNews', () => {
    it('should filter news by category', async () => {
      const mockNews: NewsItem[] = [
        {
          id: 'news_1',
          title: 'Market Update',
          content: 'Stocks rise',
          category: 'market',
          timestamp: '2026-01-01T00:00:00Z',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockNewsRepo.getByCategory.mockResolvedValue({
        items: mockNews,
        total: 5,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      const params: PaginationParams = { page: 1, limit: 10 };
      const result = await service.filterNews('market', params);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(5);
      expect(mockNewsRepo.getByCategory).toHaveBeenCalledWith('market', { page: 1, limit: 10 });
    });

    it('should throw error for invalid category in filter', async () => {
      const params: PaginationParams = { page: 1, limit: 10 };

      await expect(service.filterNews('invalid', params)).rejects.toThrow('Invalid category');
    });

    it('should throw error for invalid page in filter', async () => {
      const params: PaginationParams = { page: -1, limit: 10 };

      await expect(service.filterNews('market', params)).rejects.toThrow('Page must be greater than 0');
    });

    it('should calculate offset correctly for pagination', async () => {
      mockNewsRepo.getByCategory.mockResolvedValue({
        items: [],
        total: 0,
        page: 3,
        limit: 10,
        totalPages: 0,
      });

      const params: PaginationParams = { page: 3, limit: 10 };
      await service.filterNews('breaking_news', params);

      expect(mockNewsRepo.getByCategory).toHaveBeenCalledWith('breaking_news', { page: 3, limit: 10 });
    });
  });
});
