import React from 'react';
import { AIChatScreen } from '../../../src/screens/ai/AIChatScreen';

/**
 * AI Assistant Page
 * Route: app/(dashboard)/ai-assistant/page.tsx
 *
 * Implements Phase 6 Prompt 8: Create AI Chat Interface:
 * 1. Chat Interface:
 *    - Message bubbles with AI and user distinction
 *    - Typing indicator animation with pulsing dots
 *    - Markdown support for formatted responses (headings, lists, blockquotes)
 *    - Code block highlighting with syntax coloring & one-tap copy
 *    - Image and file attachment support via expo-document-picker
 * 2. Context-Aware Responses:
 *    - Reference to current active book, chapter, and page
 *    - Historical conversation context (multi-turn memory)
 *    - Option to ask about specific passages & excerpts
 * 3. Quick Actions:
 *    - "Summarize this chapter"
 *    - "Explain this concept"
 *    - "Create study notes"
 *    - "Generate quiz questions"
 * 4. Saved Conversations:
 *    - Sidebar with full conversation history & thread management
 *    - Real-time search through past questions & concepts
 *    - One-tap export of conversations to PDF using expo-print & expo-sharing
 */
export default function AIAssistantPage() {
  return <AIChatScreen />;
}

export { AIChatScreen as AIAssistantView };
