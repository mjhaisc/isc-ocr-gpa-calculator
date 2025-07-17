import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("transcript") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // ✅ OCR.Space API call
    const ocrForm = new FormData();
    ocrForm.append("file", new Blob([buffer], { type: file.type }), file.name);
    ocrForm.append("language", "eng");
    ocrForm.append("isOverlayRequired", "false");
    ocrForm.append("OCREngine", "2");
    // ocrForm.append("isMultiplePage", "true");

    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: process.env.OCR_SPACE_API_KEY || "helloworld",
      },
      body: ocrForm,
    });

    const ocrJson = await ocrResponse.json();
    const extractedText = ocrJson.ParsedResults
      ? ocrJson.ParsedResults.map((r: any) => r.ParsedText).join("\n")
      : "";

    if (!extractedText) {
      return NextResponse.json(
        { success: false, error: "OCR failed" },
        { status: 500 }
      );
    }

    // 🔥 OpenAI prompt to parse transcript into structured JSON
    const prompt = `
You are an expert transcript parser.

Return JSON with this format:

{
  "institutionName": "",
  "institutionType": "",
  "studentName": "",
  "studentId": "",
  "gradingScale": "",
  "totalCredits": 0,
  "cgpa": 0,
  "confidence": 95,
  "courses": [
    {
      "id": "course-1",
      "courseId": "",
      "courseName": "",
      "credits": 0,
      "grade": "",
      "semester": "",
      "year": ""
    }
  ]
}

OCR text:
"""
${extractedText}
"""

Return **only valid JSON**, no explanations.
    `;

    const { text: aiParsed } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system:
        "You are a strict JSON parser. Return only valid JSON with no extra text.",
    });

    // ✅ Clean up response to ensure valid JSON
    const cleanedJsonString = aiParsed
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedJsonString);
    } catch (err) {
      console.error("AI JSON parsing failed:", cleanedJsonString);
      return NextResponse.json(
        {
          success: false,
          error: "AI parsing failed. Invalid JSON returned.",
          raw: cleanedJsonString,
        },
        { status: 500 }
      );
    }

    // ✅ Return UI-ready mapped data
    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("OCR + AI error:", error);
    return NextResponse.json(
      { success: false, error: "Processing failed" },
      { status: 500 }
    );
  }
}
