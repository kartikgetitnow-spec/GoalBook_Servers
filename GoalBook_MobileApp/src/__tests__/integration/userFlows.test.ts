import { useAppStore } from '../../store';
import { booksApi } from '../../services/api/books';
import { analyticsTracker } from '../../services/analytics/tracking';
import { calculateReadingTimeMinutes, calculateWpm } from '../../utils/speedCalculator';

jest.mock('../../services/api/books', () => ({
  booksApi: {
    getBooks: jest.fn(),
    getBookById: jest.fn(),
    uploadBook: jest.fn(),
    updateReadingProgress: jest.fn(),
  },
}));

jest.mock('../../services/storage/database', () => ({
  database: {
    saveReadingSession: jest.fn().mockResolvedValue(undefined),
    saveBook: jest.fn().mockResolvedValue(undefined),
    getBook: jest.fn().mockResolvedValue(null),
    getAllBooks: jest.fn().mockResolvedValue([]),
  },
}));

describe('Integration: User Flows (Upload, Read, Save Progress)', () => {
  const sampleBook: any = {
    id: 'book-integral-1',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverUrl: 'https://example.com/cover.jpg',
    fileUri: 'file:///data/atomichabits.pdf',
    pageCount: 320,
    currentPage: 1,
    progressPercent: 0,
    totalReadingTimeMinutes: 0,
    fileSize: 3500000,
    createdAt: '2026-03-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({
      books: [],
      activeBook: null,
      isLoadingBooks: false,
    });
  });

  it('executes full reading lifecycle: open book -> turn pages -> track speed -> persist progress', async () => {
    // 1. Load book into store and activate
    useAppStore.getState().setActiveBook(sampleBook);
    expect(useAppStore.getState().activeBook?.title).toBe('Atomic Habits');

    // 2. Configure reader settings
    useAppStore.getState().updateSettings({ readingSpeedWpm: 300 });
    expect(useAppStore.getState().settings.readingSpeedWpm).toBe(300);

    // 3. Start reading session analytics tracking
    analyticsTracker.startReadingSession(sampleBook.id, 1);

    // 4. Calculate reading metrics for pages read (e.g. pages 1 to 5)
    const wordsPerPage = 250;
    const pagesRead = 5;
    const wordsRead = (pagesRead - 1) * wordsPerPage; // 1000 words
    const estimatedMinutes = calculateReadingTimeMinutes(wordsRead, 300);
    expect(estimatedMinutes).toBe(4);

    const calculatedWpm = calculateWpm(wordsRead, 240); // 1000 words in 4 mins
    expect(calculatedWpm).toBe(250);

    // 5. Save reading progress via API
    (booksApi.updateReadingProgress as jest.Mock).mockResolvedValueOnce(undefined);
    const progressPercent = Math.round((5 / sampleBook.pageCount) * 100);

    await booksApi.updateReadingProgress(sampleBook.id, 5, progressPercent);
    expect(booksApi.updateReadingProgress).toHaveBeenCalledWith('book-integral-1', 5, 2);

    // 6. Update progress in client store
    useAppStore.getState().updateBookProgressInStore(sampleBook.id, 5, progressPercent);
    expect(useAppStore.getState().activeBook?.currentPage).toBe(5);
    expect(useAppStore.getState().activeBook?.progressPercent).toBe(2);

    // 7. Stop reading session and persist to local database
    const session = await analyticsTracker.stopReadingSession(5, wordsRead);
    expect(session).not.toBeNull();
    expect(session?.bookId).toBe('book-integral-1');
    expect(session?.pagesRead).toBe(5);
    expect(session?.wordsPerMinute).toBeGreaterThan(0);
  });

  it('handles book upload and updates library collection in store', async () => {
    const uploadedBook: any = {
      id: 'uploaded-101',
      title: 'Make It Stick',
      author: 'Peter C. Brown',
      fileUri: 'file:///data/makeitstick.pdf',
      pageCount: 240,
      currentPage: 0,
      progressPercent: 0,
      totalReadingTimeMinutes: 0,
      fileSize: 1500000,
      createdAt: new Date().toISOString(),
    };

    const uploadPayload = {
      book: uploadedBook,
      processedChunks: 120,
    };

    (booksApi.uploadBook as jest.Mock).mockResolvedValueOnce(uploadPayload);

    const formData = new FormData();
    formData.append('title', 'Make It Stick');

    const result = await booksApi.uploadBook(formData);
    expect(result.book.id).toBe('uploaded-101');
    expect(result.book.title).toBe('Make It Stick');

    // Add to books store collection
    useAppStore.getState().addBook(result.book);

    expect(useAppStore.getState().books.length).toBe(1);
    expect(useAppStore.getState().books[0].title).toBe('Make It Stick');
  });
});
