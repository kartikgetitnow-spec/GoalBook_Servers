import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, bookTitle, pageNumber } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        summary: `Summary of ${bookTitle || 'Document'} (Page ${pageNumber || 1}):\n\n• Key Takeaway: The section covers foundational principles and core concepts.\n• Primary Focus: Structural arguments and key analytical conclusions.`
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are an expert executive book summarizer for GoalBook.
Summarize the following passage from "${bookTitle || 'Document'}" (Page ${pageNumber || 'N/A'}).
Provide:
1. A 2-sentence executive summary.
2. 3 bullet points of the most important ideas or takeaways.
3. 1 key action or reflection for the reader.

Text:
"""
${text.slice(0, 5000)}
"""`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600,
        }
      })
    });

    if (!geminiRes.ok) {
      throw new Error('Gemini API call failed');
    }

    const data = await geminiRes.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate summary.';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('AI Summarize Error:', error);
    return NextResponse.json({ error: 'Failed to summarize text' }, { status: 500 });
  }
}
