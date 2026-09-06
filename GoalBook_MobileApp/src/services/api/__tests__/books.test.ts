import { booksApi } from '../books';
import { apiClient, aiClient } from '../client';

jest.mock('../client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
  aiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('booksApi Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches books list from /books endpoint', async () => {
    const mockBooks = [
      {
        id: 'book-1',
        title: 'Deep Work',
        author: 'Cal Newport',
        coverUrl: 'https://example.com/cover.jpg',
        fileUrl: 'https://example.com/deepwork.pdf',
        pages: 304,
        fileSize: 2048000,
        userId: 'user-1',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-02',
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: mockBooks },
    });

    const result = await booksApi.getBooks();
    expect(apiClient.get).toHaveBeenCalledWith('/books');
    expect(result).toEqual(mockBooks);
  });

  it('fetches single book details by ID from /books/:id', async () => {
    const mockBook = {
      id: 'book-42',
      title: 'Atomic Habits',
      author: 'James Clear',
      pages: 320,
    };

    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: mockBook },
    });

    const result = await booksApi.getBookById('book-42');
    expect(apiClient.get).toHaveBeenCalledWith('/books/book-42');
    expect(result).toEqual(mockBook);
  });

  it('uploads book using multipart formData to /books/upload', async () => {
    const mockResponse = {
      bookId: 'new-book-1',
      title: 'Ultralearning',
      totalPages: 280,
      totalChunks: 140,
    };

    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: mockResponse },
    });

    const formData = new FormData();
    formData.append('title', 'Ultralearning');

    const result = await booksApi.uploadBook(formData);
    expect(apiClient.post).toHaveBeenCalledWith('/books/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(result).toEqual(mockResponse);
  });

  it('fetches book chunks with page query parameter from AI client', async () => {
    const mockChunks = [
      {
        id: 'chunk-1',
        bookId: 'book-1',
        pageNumber: 3,
        chunkIndex: 0,
        text: 'This is paragraph one of page 3.',
      },
    ];

    (aiClient.get as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: mockChunks },
    });

    const result = await booksApi.getBookChunks('book-1', 3);
    expect(aiClient.get).toHaveBeenCalledWith('/chunks/book-1', {
      params: { page: 3 },
    });
    expect(result).toEqual(mockChunks);
  });

  it('updates reading progress via PATCH /books/:bookId/progress', async () => {
    (apiClient.patch as jest.Mock).mockResolvedValueOnce({
      data: { success: true },
    });

    await booksApi.updateReadingProgress('book-1', 45, 15.5);
    expect(apiClient.patch).toHaveBeenCalledWith('/books/book-1/progress', {
      pageNumber: 45,
      progressPercent: 15.5,
    });
  });
});
