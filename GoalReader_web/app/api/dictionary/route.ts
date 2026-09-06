import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const { word } = await request.json();

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    const cleanWord = word.toLowerCase().trim();

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const prompt = `You are a dictionary API. Define the English word: "${cleanWord}".
Provide the response as a pure, raw JSON object (without markdown blocks) with exactly these 5 string keys:
"pronunciation": The phonetic spelling of the word (e.g. /wɜːrd/).
"hin": The direct translation of the word in Hindi.
"meaning": A short, clear meaning of the word in English.
"exampleEng": A short example sentence using the word in English.
"exampleHin": The same example sentence translated into Hindi.`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      })
    });

    if (!geminiRes.ok) {
      throw new Error('Failed to fetch from Gemini');
    }

    const data = await geminiRes.json();
    const textResp = data.candidates[0].content.parts[0].text;
    
    // Make JSON parsing robust by stripping markdown blocks if present
    let cleanedText = textResp.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '');
      cleanedText = cleanedText.replace(/\s*```$/, '');
    }
    
    const parsed = JSON.parse(cleanedText);
    const { pronunciation, hin, meaning, exampleEng, exampleHin } = parsed;

    // If user is logged in, save the word to their account
    if (userId) {
      await prisma.savedWord.upsert({
        where: {
          userId_word: {
            userId,
            word: cleanWord
          }
        },
        update: {
          pronunciation,
          meaning,
          hin,
          exampleEng,
          exampleHin,
          createdAt: new Date()
        },
        create: {
          word: cleanWord,
          pronunciation,
          meaning,
          hin,
          exampleEng,
          exampleHin,
          userId,
        }
      });
    }

    return NextResponse.json({ 
      word: cleanWord, 
      pronunciation,
      meaning, 
      hin, 
      exampleEng, 
      exampleHin 
    });
  } catch (error) {
    console.error('Dictionary API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch meaning' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const words = await prisma.savedWord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ words });
  } catch (error) {
    console.error('Dictionary API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
  }
}
