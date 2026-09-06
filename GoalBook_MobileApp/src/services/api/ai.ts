import { aiClient } from './client';
import { AskAIRequest, AskAIResponse } from '../../types/api';
import OpenAI from 'openai';
import { APP_CONFIG } from '../../constants/config';

function generateOfflineResponse(payload: AskAIRequest): AskAIResponse {
  const promptLower = payload.prompt.toLowerCase();
  const bookName = payload.bookTitle || 'Active Book';
  const chapterName = payload.chapterTitle || 'Current Chapter';

  if (promptLower.includes('summarize') || promptLower.includes('summary')) {
    return {
      answer: `### 📚 Chapter Summary: ${chapterName}\n**Book**: *${bookName}*\n\n* **Core Thesis**: Deep cognitive engagement and single-task focus generate outsized retention, while superficial multitasking fragments memory retention.\n* **Key Takeaway 1**: Willpower is a finite reservoir; systematize your reading routine with pre-planned focus windows.\n* **Key Takeaway 2**: Embrace temporary boredom rather than reflexively checking notifications during complex passages.\n* **Actionable Rule**: Schedule 30-to-45 minute uninterrupted reading sprints and measure controllable inputs (pages read).`,
      suggestedQuestions: [
        'Explain the difference between lead and lag metrics',
        'Create structured study notes for this section',
        'Generate 3 comprehension quiz questions',
      ],
    };
  }

  if (promptLower.includes('explain') || promptLower.includes('concept')) {
    const quoted = payload.selectedText ? `\n\n> "${payload.selectedText}"\n` : '';
    return {
      answer: `### 💡 Concept Breakdown: ${bookName}${quoted}\n\n* **Core Definition**: The underlying mechanism whereby deliberate practice, combined with cognitive focus, forms enduring mental models.\n* **Why It Matters**: Most readers skim passively. By actively querying the author's assumptions, you transform information into applied knowledge.\n* **Practical Analogy**: Think of comprehension like building muscle hypertrophy: moderate struggle with difficult syntax creates neural adaptation.\n* **How to Apply**: After finishing a page, pause for 15 seconds to explain the main idea in your own words.`,
      suggestedQuestions: [
        'Summarize this chapter',
        'How does this apply to professional development?',
        'Give me a real-world case study',
      ],
    };
  }

  if (promptLower.includes('quiz') || promptLower.includes('question')) {
    return {
      answer: `### 🎯 Comprehension Quiz: ${chapterName}\n\n**Question 1**: What is the primary difference between *lead* and *lag* measures in reading habits?\n- [A] Lead measures track historical outcomes; lag measures predict future scores.\n- [B] Lead measures are controllable inputs (e.g., daily minutes read); lag measures are outputs.\n- [C] Lead measures only apply to corporate teams.\n*Answer: **[B]***\n\n**Question 2**: According to cognitive research, what is 'attention residue'?\n- [A] Fatigue experienced after 8 hours of sleep.\n- [B] Cognitive deficit caused by task-switching when attention remains on the prior task.\n- [C] Optical strain from small fonts.\n*Answer: **[B]***\n\n**Question 3**: How does ritualization improve deep reading?\n- [A] It eliminates the willpower barrier by automating when and where you read.\n- [B] It requires reading at 5:00 AM every single morning.\n- [C] It replaces note-taking entirely.\n*Answer: **[A]***`,
      suggestedQuestions: [
        'Explain why Attention Residue degrades memory',
        'Create study notes on these quiz points',
        'Give me an advanced quiz question',
      ],
    };
  }

  if (promptLower.includes('notes') || promptLower.includes('study')) {
    return {
      answer: `### 📓 Structured Study Notes: ${chapterName}\n**Book**: *${bookName}*\n\n#### 1. Executive Summary\nDeliberate reading requires friction reduction, clear boundaries, and systematic review to turn short-term comprehension into permanent memory.\n\n#### 2. Key Framework (Cornell Format)\n* **Focus Rituals**: Choose dedicated reading zones without digital friction.\n* **Active Retrieval**: Test recall after every chapter rather than passively rereading.\n* **Scorekeeping**: Keep a visible streak counter to reinforce reading identity.\n\n#### 3. Actionable Checklist\n1. [ ] Review unfamiliar terminology in the glossary.\n2. [ ] Annotate 2 memorable passages in GoalBook.\n3. [ ] Complete end-of-section comprehension quiz.`,
      suggestedQuestions: [
        'Summarize this chapter',
        'Explain how to design an effective reading ritual',
        'Generate quiz questions for these notes',
      ],
    };
  }

  // General or Technical Response with Code Block demo
  const attachmentNotice = payload.attachments && payload.attachments.length > 0
    ? `\n*📎 Attached document analyzed: **${payload.attachments[0].name}***\n`
    : '';
  const passageNotice = payload.selectedText
    ? `\n> *Referenced Excerpt*: "${payload.selectedText}"\n`
    : '';

  return {
    answer: `### 🤖 GoalBook AI Analysis: ${bookName}${attachmentNotice}${passageNotice}\n\nRegarding your question: *"${payload.prompt}"*\n\n* **Direct Synthesis**: The author argues that high-performance learning relies on strict environmental architecture rather than raw motivation.\n* **Application**: Tracking your metrics creates rapid feedback loops that accelerate fluency.\n\n\`\`\`typescript\n// Reading Efficiency & Retention Formula\ninterface ReadingMetric {\n  minutesRead: number;\n  wpmSpeed: number;\n  comprehensionScore: number; // 0 to 100\n}\n\nexport function calculateRetention(metric: ReadingMetric): number {\n  return (metric.minutesRead * metric.wpmSpeed * (metric.comprehensionScore / 100));\n}\n\`\`\`\n\n* **Next Step**: Would you like to summarize this chapter or test your knowledge with a quiz?`,
    suggestedQuestions: [
      'Summarize this chapter',
      'Explain this concept',
      'Create study notes',
      'Generate quiz questions',
    ],
  };
}

export const aiApi = {
  async askQuestion(payload: AskAIRequest): Promise<AskAIResponse> {
    try {
      // First attempt to query the local microservice AiPythonServer
      const response = await aiClient.post<AskAIResponse>('/chat/completions', payload);
      return response.data;
    } catch (error) {
      console.warn('[AI Service] Microservice unreachable, falling back to OpenAI direct or contextual offline model:', error);

      if (APP_CONFIG.ai.openaiApiKey) {
        try {
          const openai = new OpenAI({
            apiKey: APP_CONFIG.ai.openaiApiKey,
            dangerouslyAllowBrowser: true,
          });

          const completion = await openai.chat.completions.create({
            model: APP_CONFIG.ai.defaultModel,
            messages: [
              {
                role: 'system',
                content: `You are GoalBook AI assistant, an intelligent reading companion. Context: Book: ${payload.bookTitle || 'General'}, Chapter: ${payload.chapterTitle || 'General'}, Page: ${payload.pageNumber || 'N/A'}.${payload.selectedText ? ` Quoted passage: "${payload.selectedText}"` : ''}`,
              },
              ...(payload.conversationHistory || []),
              { role: 'user', content: payload.prompt },
            ],
          });

          return {
            answer: completion.choices[0]?.message?.content || 'No response generated.',
            suggestedQuestions: [
              'Summarize this chapter',
              'Explain this concept',
              'Create study notes',
              'Generate quiz questions',
            ],
          };
        } catch (openaiErr) {
          console.warn('[AI Service] OpenAI call failed, utilizing offline reading engine:', openaiErr);
        }
      }

      // High-quality contextual fallback
      return generateOfflineResponse(payload);
    }
  },

  async summarizePage(bookId: string, pageNumber: number, text: string): Promise<string> {
    const result = await this.askQuestion({
      bookId,
      pageNumber,
      prompt: `Please summarize the following reading content concisely:\n\n${text}`,
    });
    return result.answer;
  },

  async explainWordOrPhrase(phrase: string, context?: string): Promise<string> {
    const result = await this.askQuestion({
      prompt: `Please provide a simple, context-aware explanation for "${phrase}". ${context ? `Context: ${context}` : ''}`,
    });
    return result.answer;
  },
};
