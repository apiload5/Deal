import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY environment variable is missing" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const body = await req.json().catch(() => ({}));
    const { category, topic, rssFeeds, promptTemplate } = body;

    const prompt = `Write a comprehensive, professional, highly informative SEO blog article about Pakistan Real Estate and FBR Tax Regulations.
Category: ${category || 'FBR Tax & Real Estate News'}
Topic / Context: ${topic || 'FBR Section 236K/236C Tax Brackets, Property Valuation Table Updates 2026, Escrow Security, DHA & Bahria Market Analysis'}
Configured RSS Feeds: ${Array.isArray(rssFeeds) && rssFeeds.length > 0 ? rssFeeds.join(', ') : 'FBR Official News & State Bank RDA Directives'}
Custom Prompt Instructions: ${promptTemplate || 'Provide clear, actionable buyer advice, withholding tax rates for filers vs non-filers, and escrow protection guidance.'}

Return ONLY a valid JSON object with the following fields:
- "title": (string) Engaging, SEO-friendly headline
- "summary": (string) 1-2 sentence executive overview
- "content": (string) Comprehensive article body in clean Markdown (use ### headings, bullet points, and key takeaways)
- "readTime": (string) e.g., "4 min read"
- "tags": (array of strings) e.g. ["FBR", "TaxRates", "RealEstatePK", "EscrowGuaranteed"]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text || "{}";
    const articleData = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      article: {
        title: articleData.title || "FBR Tax & Property Valuation Updates 2026",
        summary: articleData.summary || "Latest regulatory changes regarding property tax brackets and escrow protection in Pakistan.",
        content: articleData.content || "### FBR Regulation Notice\n\nDetailed breakdown of advance tax rates under Section 236K/C for filers and non-filers.",
        readTime: articleData.readTime || "3 min read",
        tags: Array.isArray(articleData.tags) ? articleData.tags : ["FBR", "RealEstatePK", "Escrow"]
      }
    });
  } catch (error: any) {
    console.error("Gemini AI blog generation error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate AI blog post' },
      { status: 500 }
    );
  }
}
