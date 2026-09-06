import { apiClient, aiClient } from './client';
import { Book, BookChunk } from '../../types/models';
import { ApiResponse, BookUploadResponse } from '../../types/api';

export const booksApi = {
  async getBooks(): Promise<Book[]> {
    const response = await apiClient.get<ApiResponse<Book[]>>('/books');
    return response.data.data;
  },

  async getBookById(id: string): Promise<Book> {
    const response = await apiClient.get<ApiResponse<Book>>(`/books/${id}`);
    return response.data.data;
  },

  async uploadBook(formData: FormData): Promise<BookUploadResponse> {
    const response = await apiClient.post<ApiResponse<BookUploadResponse>>('/books/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async getBookChunks(bookId: string, pageNumber?: number): Promise<BookChunk[]> {
    const response = await aiClient.get<ApiResponse<BookChunk[]>>(`/chunks/${bookId}`, {
      params: { page: pageNumber },
    });
    return response.data.data;
  },

  async updateReadingProgress(bookId: string, pageNumber: number, progressPercent: number): Promise<void> {
    await apiClient.patch(`/books/${bookId}/progress`, {
      pageNumber,
      progressPercent,
    });
  },
};
