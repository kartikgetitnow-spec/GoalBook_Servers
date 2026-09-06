import React from 'react';
import { render } from '@testing-library/react-native';
import { MessageBubble } from '../MessageBubble';
import { ChatMessage } from '../../../types/models';

describe('MessageBubble Component', () => {
  it('renders user message and context tags correctly', () => {
    const userMsg: ChatMessage = {
      id: 'msg-1',
      sender: 'user',
      content: 'What does neuroplasticity mean in Chapter 3?',
      timestamp: '2026-03-01T10:00:00.000Z',
      bookTitle: 'The Brain That Changes Itself',
      referencedPage: 45,
    };

    const { getByText } = render(<MessageBubble message={userMsg} />);

    expect(getByText('The Brain That Changes Itself')).toBeTruthy();
    expect(getByText('P. 45')).toBeTruthy();
    expect(getByText('What does neuroplasticity mean in Chapter 3?')).toBeTruthy();
  });

  it('renders bot message with quoted passage card', () => {
    const botMsg: ChatMessage = {
      id: 'msg-2',
      sender: 'assistant',
      content: 'It refers to the brain capacity to reorganize neural pathways.',
      timestamp: '2026-03-01T10:00:05.000Z',
      selectedPassage: 'Neurons that fire together wire together.',
    };

    const { getByText } = render(<MessageBubble message={botMsg} />);

    expect(getByText('QUOTED PASSAGE')).toBeTruthy();
    expect(getByText('"Neurons that fire together wire together."')).toBeTruthy();
    expect(getByText('It refers to the brain capacity to reorganize neural pathways.')).toBeTruthy();
  });
});
