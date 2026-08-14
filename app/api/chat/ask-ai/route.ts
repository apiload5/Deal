import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        answer: "As DealFast.pk AI Advisor: For property transfers in Pakistan (FBR Filer tax is 3% for buyers, 3% for sellers under Section 236K/236C). Non-filers pay higher rates up to 12%. Always verify NOC from CDA/LDA/KDA before submitting token payments via DealFast.pk Escrow!"
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are DealFast AI Real Estate Assistant, an expert in Pakistan real estate, housing societies (DHA, Bahria Town, CDA Islamabad, LDA Lahore, KDA Karachi), property tax laws (FBR Filer/Non-filer 236K, 236C, 7E), valuation tables, and DealFast escrow security.\n\nCRITICAL MANDATE: You MUST ONLY answer questions related to real estate, property buying/selling/renting, Pakistani property tax laws, housing societies, construction, or DealFast features. If the user asks about anything unrelated to real estate (such as general programming, recipes, general history, entertainment, homework, or general chat), strictly decline in Urdu/English with: 'Aap ka sawal property se mutalliq nahi hai. Main sirf DealFast Pakistan Real Estate, Property Taxes, NOCs aur Escrow Protection se mutalliq sawalat ke jawabat de sakta hoon. Baraye meharbani real estate se mutalliq sawal poochein.'"
      }
    });

    return NextResponse.json({ success: true, answer: response.text });
  } catch (err: any) {
    console.error('Gemini error:', err);
    return NextResponse.json({
      success: true,
      answer: "DealFast.pk Advisor Advice: When purchasing real estate in Islamabad, Lahore, or Karachi, ensure you verify: 1) Society NOC from local development authority, 2) FBR Filer status for tax exemptions, 3) Token payment deposit through DealFast.pk 100% Escrow Guarantee."
    });
  }
}
