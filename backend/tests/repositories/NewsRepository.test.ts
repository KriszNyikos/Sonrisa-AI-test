import { Database } from 'sqlite';
import { NewsRepository } from '../../src/repositories';

describe('NewsRepository', () => {
  let db: Database;
  let repository: NewsRepository;

  beforeEach(() => {
    db = {
      run: jest.fn(),
      get: jest.fn(),
      all: jest.fn(),
    } as any;

    repository = new NewsRepository(db);
  });

  describe('create', () => {
    it('should create a new news item', async () => {
      const newsData = {
        title: 'Test News',
        content: 'Test content',
        category: 'breaking_news' as const,
        source: 'Test Source',
        timestamp: '2026-01-01T00:00:00Z',
      };

      (db.run as jest.Mock).mockResolvedValue({ changes: 1 });

      const result = await repository.create(newsData);

      expect(result).toHaveProperty('id');
      expect(result.title).toBe(newsData.title);
      expect(result.category).toBe('breaking_news');
      expect(result).toHaveProperty('createdAt');
    });

    it('should handle optional source', async () => {
      const newsData = {
        title: 'Test News',
        content: 'Test content',
        category: 'market' as const,
        timestamp: '2026-01-01T00:00:00Z',
      };

      (db.run as jest.Mock).mockResolvedValue({ changes: 1 });

      const result = await repository.create(newsData);

      expect(result.source).toBeUndefined();
    });
  });

  describe('getById', () => {
    it('should retrieve a news item by ID', async () => {
      const mockNews = {
        id: 'news-1',
        title: 'Test News',
        content: 'Test content',
        category: 'breaking_news',
        source: 'Test Source',
        timestamp: '2026-01-01T00:00:00Z',
        created_at: '2026-01-01T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
      };

      (db.get as jest.Mock).mockResolvedValue(mockNews);

      const result = await repository.getById('news-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('news-1');
      expect(result?.category).toBe('breaking_news');
    });

    it('should return null for non-existent news', async () => {
      (db.get as jest.Mock).mockResolvedValue(null);

      const result = await repository.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should retrieve all news items with pagination', async () => {
      const mockNews = [
        {
          id: 'news-1',
          title: 'News 1',
          content: 'Content 1',
          category: 'breaking_news',
          source: null,
          timestamp: '2026-01-02T00:00:00Z',
          created_at: '2026-01-02T00:00:00Z',
          createdAt: '2026-01-02T00:00:00Z',
        },
        {
          id: 'news-2',
          title: 'News 2',
          content: 'Content 2',
          category: 'market',
          source: null,
          timestamp: '2026-01-01T00:00:00Z',
          created_at: '2026-01-01T00:00:00Z',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      (db.all as jest.Mock).mockResolvedValue(mockNews);
      (db.get as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await repository.getAll({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('getByCategory', () => {
    it('should retrieve news items by category', async () => {
      const mockNews = [
        {
          id: 'news-1',
          title: 'Breaking News',
          content: 'Content',
          category: 'breaking_news',
          source: null,
          timestamp: '2026-01-01T00:00:00Z',
          created_at: '2026-01-01T00:00:00Z',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      (db.all as jest.Mock).mockResolvedValue(mockNews);
      (db.get as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await repository.getByCategory('breaking_news', { page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].category).toBe('breaking_news');
    });
  });

  describe('getByDateRange', () => {
    it('should retrieve news items within date range', async () => {
      const mockNews = [
        {
          id: 'news-1',
          title: 'News 1',
          content: 'Content 1',
          category: 'breaking_news',
          source: null,
          timestamp: '2026-01-05T12:00:00Z',
          created_at: '2026-01-05T12:00:00Z',
          createdAt: '2026-01-05T12:00:00Z',
        },
      ];

      (db.all as jest.Mock).mockResolvedValue(mockNews);
      (db.get as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await repository.getByDateRange(
        '2026-01-01T00:00:00Z',
        '2026-01-10T00:00:00Z',
        { page: 1, limit: 20 },
      );

      expect(result.items).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update a news item', async () => {
      const existingNews = {
        id: 'news-1',
        title: 'Original Title',
        content: 'Content',
        category: 'breaking_news',
        source: null,
        timestamp: '2026-01-01T00:00:00Z',
        created_at: '2026-01-01T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
      };

      (db.get as jest.Mock).mockResolvedValue(existingNews);
      (db.run as jest.Mock).mockResolvedValue({ changes: 1 });

      const result = await repository.update('news-1', { title: 'Updated Title' });

      expect(result?.title).toBe('Updated Title');
    });

    it('should return null if news does not exist', async () => {
      (db.get as jest.Mock).mockResolvedValue(null);

      const result = await repository.update('non-existent', { title: 'New Title' });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a news item', async () => {
      (db.run as jest.Mock).mockResolvedValue({ changes: 1 });

      const result = await repository.delete('news-1');

      expect(result).toBe(true);
    });

    it('should return false if news does not exist', async () => {
      (db.run as jest.Mock).mockResolvedValue({ changes: 0 });

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should return total count of news items', async () => {
      (db.get as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await repository.count();

      expect(result).toBe(5);
    });
  });

  describe('getLatest', () => {
    it('should get the latest news item', async () => {
      const mockNews = {
        id: 'news-1',
        title: 'Latest News',
        content: 'Content',
        category: 'breaking_news',
        source: null,
        timestamp: '2026-01-05T00:00:00Z',
        created_at: '2026-01-05T00:00:00Z',
        createdAt: '2026-01-05T00:00:00Z',
      };

      (db.get as jest.Mock).mockResolvedValue(mockNews);

      const result = await repository.getLatest();

      expect(result).not.toBeNull();
      expect(result?.id).toBe('news-1');
    });

    it('should return null if no news exists', async () => {
      (db.get as jest.Mock).mockResolvedValue(null);

      const result = await repository.getLatest();

      expect(result).toBeNull();
    });
  });
});
