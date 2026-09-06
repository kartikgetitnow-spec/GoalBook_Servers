import { aiApi } from '../ai';
import { aiClient } from '../client';

jest.mock('../client', () => ({
  aiClient: {
    post: jest.fn(),
  },
}));

describe('aiApi Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('posts request to /chat/completions when backend is online', async () => {
    const mockApiResponse = {
      answer: 'Focused reading activates high-order cognitive synthesis.',
      suggestedQuestions: ['Can you provide an example?'],
    };

    (aiClient.post as jest.Mock).mockResolvedValueOnce({
      data: mockApiResponse,
    });

    const response = await aiApi.askQuestion({
      prompt: 'What is the main point?',
      bookTitle: 'Thinking Fast and Slow',
      chapterTitle: 'Two Systems',
    });

    expect(aiClient.post).toHaveBeenCalledWith('/chat/completions', {
      prompt: 'What is the main point?',
      bookTitle: 'Thinking Fast and Slow',
      chapterTitle: 'Two Systems',
    });
    expect(response).toEqual(mockApiResponse);
  });

  it('falls back to contextual offline summary when AI server is unreachable', async () => {
    (aiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const response = await aiApi.askQuestion({
      prompt: 'Can you summarize this chapter?',
      bookTitle: 'Deep Work',
      chapterTitle: 'The Deep Work Hypothesis',
    });

    expect(response.answer).toContain('Chapter Summary');
    expect(response.answer).toContain('Deep Work');
    expect(response.suggestedQuestions?.length).toBeGreaterThan(0);
  });

  it('falls back to contextual offline quiz when prompt requests quiz', async () => {
    (aiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Network unreachable'));

    const response = await aiApi.askQuestion({
      prompt: 'Generate a quiz for this page',
      chapterTitle: 'Habit Loops',
    });

    expect(response.answer).toContain('Comprehension Quiz');
    expect(response.answer).toContain('Question 1');
  });

  it('falls back to concept explanation when prompt asks to explain', async () => {
    (aiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Server error 500'));

    const response = await aiApi.askQuestion({
      prompt: 'Please explain this concept in simple terms',
      bookTitle: 'Atomic Habits',
      selectedText: 'Habits are the compound interest of self-improvement.',
    });

    expect(response.answer).toContain('Concept Breakdown');
    expect(response.answer).toContain('Atomic Habits');
    expect(response.answer).toContain('Habits are the compound interest');
  });

  it('provides structured study notes when prompt mentions study notes', async () => {
    (aiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Offline'));

    const response = await aiApi.askQuestion({
      prompt: 'Generate study notes for my exam',
      chapterTitle: 'Neural Plasticity',
    });

    expect(response.answer).toContain('Structured Study Notes');
    expect(response.answer).toContain('Cornell Format');
  });

  it('summarizePage delegates properly to askQuestion', async () => {
    (aiClient.post as jest.Mock).mockResolvedValueOnce({
      data: {
        answer: 'Page summary of key principles.',
        suggestedQuestions: [],
      },
    });

    const summary = await aiApi.summarizePage('book-10', 4, 'Full page text content here.');
    expect(summary).toBe('Page summary of key principles.');
  });

  it('explainWordOrPhrase formats prompt and returns explanation', async () => {
    (aiClient.post as jest.Mock).mockResolvedValueOnce({
      data: {
        answer: 'Neuroplasticity is the brain ability to reorganize itself.',
        suggestedQuestions: [],
      },
    });

    const explanation = await aiApi.explainWordOrPhrase('neuroplasticity', 'In the context of adult learning');
    expect(explanation).toBe('Neuroplasticity is the brain ability to reorganize itself.');
  });
});
