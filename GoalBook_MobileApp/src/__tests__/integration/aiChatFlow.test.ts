import { useAppStore } from '../../store';
import { aiApi } from '../../services/api/ai';
import { ChatMessage } from '../../types/models';

jest.mock('../../services/api/ai', () => ({
  aiApi: {
    askQuestion: jest.fn(),
  },
}));

describe('Integration: AI Chat Functionality & Context Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({
      messages: [],
      activeContextText: null,
      activeBookContext: null,
      activePassageContext: null,
      isGeneratingAI: false,
    });
  });

  it('orchestrates complete AI chat workflow: context attachment -> question submission -> response handling -> follow-up suggestions', async () => {
    // 1. Reader sets active book and passage context
    useAppStore.getState().setActiveBookContext({
      bookId: 'book-ai-1',
      title: 'Thinking Fast and Slow',
      chapterTitle: 'Part 1: Two Systems',
      pageNumber: 24,
    });
    useAppStore.getState().setActivePassageContext('System 1 operates automatically and quickly, with little or no effort.');

    const state = useAppStore.getState();
    expect(state.activeBookContext?.title).toBe('Thinking Fast and Slow');
    expect(state.activePassageContext).toContain('System 1 operates');

    // 2. User inputs a prompt
    const userPrompt = 'Can you simplify this for a high school student?';
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      content: userPrompt,
      timestamp: new Date().toISOString(),
      bookTitle: state.activeBookContext?.title,
      chapterTitle: state.activeBookContext?.chapterTitle,
      referencedPage: state.activeBookContext?.pageNumber,
      selectedPassage: state.activePassageContext || undefined,
    };

    useAppStore.getState().addMessage(userMsg);
    useAppStore.getState().setIsGeneratingAI(true);

    expect(useAppStore.getState().messages.length).toBe(1);
    expect(useAppStore.getState().isGeneratingAI).toBe(true);

    // 3. Mock AI API response
    const mockAiResponse = {
      answer: 'System 1 is like autopilot in your brain—it recognizes faces and dodges obstacles without thinking.',
      suggestedQuestions: [
        'Give me an example of System 2',
        'How do System 1 and System 2 conflict?',
      ],
    };

    (aiApi.askQuestion as jest.Mock).mockResolvedValueOnce(mockAiResponse);

    // 4. Invoke API with contextual parameters
    const aiResult = await aiApi.askQuestion({
      prompt: userPrompt,
      bookTitle: state.activeBookContext?.title,
      chapterTitle: state.activeBookContext?.chapterTitle,
      pageNumber: state.activeBookContext?.pageNumber,
      selectedText: state.activePassageContext || undefined,
      conversationHistory: useAppStore.getState().messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    });

    // 5. Append Assistant message with suggested follow-ups
    const botMsg: ChatMessage = {
      id: `msg_bot_${Date.now()}`,
      sender: 'assistant',
      content: aiResult.answer,
      timestamp: new Date().toISOString(),
      suggestedPrompts: aiResult.suggestedQuestions,
    };

    useAppStore.getState().addMessage(botMsg);
    useAppStore.getState().setIsGeneratingAI(false);

    // Verify messages and state
    const currentMessages = useAppStore.getState().messages;
    expect(currentMessages.length).toBe(2);
    expect(currentMessages[1].sender).toBe('assistant');
    expect(currentMessages[1].content).toContain('autopilot in your brain');
    expect(currentMessages[1].suggestedPrompts).toEqual([
      'Give me an example of System 2',
      'How do System 1 and System 2 conflict?',
    ]);
    expect(useAppStore.getState().isGeneratingAI).toBe(false);

    // 6. User clicks on suggested prompt
    const chosenSuggestion = currentMessages[1].suggestedPrompts![0];
    const followUpMsg: ChatMessage = {
      id: `msg_user_followup_${Date.now()}`,
      sender: 'user',
      content: chosenSuggestion,
      timestamp: new Date().toISOString(),
    };
    useAppStore.getState().addMessage(followUpMsg);

    expect(useAppStore.getState().messages.length).toBe(3);
    expect(useAppStore.getState().messages[2].content).toBe('Give me an example of System 2');
  });

  it('manages conversation switching and history retention', () => {
    // Create new conversation
    const convId = useAppStore.getState().createConversation(
      'Deep Work Discussion',
      'book-1',
      'Deep Work',
      'Rule #1'
    );

    expect(useAppStore.getState().activeConversationId).toBe(convId);
    expect(useAppStore.getState().messages.length).toBeGreaterThan(0);

    // Add a message into this conversation
    useAppStore.getState().addMessage({
      id: 'custom-msg-1',
      sender: 'user',
      content: 'Let us discuss Deep Work',
      timestamp: new Date().toISOString(),
    });

    // Switch to another conversation
    const convId2 = useAppStore.getState().createConversation('Second Conversation');
    expect(useAppStore.getState().activeConversationId).toBe(convId2);

    // Switch back
    useAppStore.getState().selectConversation(convId);
    expect(useAppStore.getState().activeConversationId).toBe(convId);
    expect(useAppStore.getState().messages.some((m) => m.id === 'custom-msg-1')).toBe(true);
  });
});
