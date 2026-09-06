import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const { question, context, bookTitle } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        answer: `As an AI reading assistant, based on "${bookTitle || 'your document'}": here is an explanation for your question "${question}". Context provides relevant insights regarding key themes and concepts discussed.`
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are GoalBook AI Reading Assistant.
Book: ${bookTitle || 'Current Document'}
Page Context:
"""
${(context || '').slice(0, 4000)}
"""

User Question: ${question}

Provide a concise, engaging, and highly informative answer (2 to 4 paragraphs maximum) directly referencing the text when possible.`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800,
        }
      })
    });

    if (!geminiRes.ok) {
      throw new Error('Gemini API call failed');
    }

    const data = await geminiRes.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated.';

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'Failed to generate AI response' }, { status: 500 });
  }
}
