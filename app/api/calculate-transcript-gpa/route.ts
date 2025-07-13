import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
  semester: string;
}

interface InstitutionData {
  name: string;
  gradingScale: string;
  rigor: number;
  originalCGPA?: number;
}

interface TranscriptGPARequest {
  courses: Course[];
  institutionData: InstitutionData;
  studentName: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TranscriptGPARequest = await request.json();
    const { courses, institutionData, studentName } = body;

    // ✅ Build OpenAI prompt
    const prompt = `
You are an international transcript evaluator. Convert the following to a standard 4.0 GPA. Return only **strict valid JSON** as:

{
  "convertedGPA": number,
  "rigorAdjustedGPA": number,
  "courseConversions": [
    {
      "course": "course name",
      "originalGrade": "original grade",
      "convertedGrade": number,
      "qualityPoints": number
    }
  ],
  "conversionMethodology": "short explanation",
  "confidence": number (0-100),
  "conversionNotes": "short note",
  "qualityAnalysis": "brief analysis",
  "recommendations": "brief recommendation"
}

Institution: ${institutionData.name}
Grading Scale: ${institutionData.gradingScale}
Original CGPA: ${institutionData.originalCGPA || "Not provided"}
Rigor: ${institutionData.rigor}/5.0
Student: ${studentName}

Courses (${courses.length} total):
${courses.map((c, i) => `${i + 1}. ${c.name}, Grade: ${c.grade}, Credits: ${c.credits}, Semester: ${c.semester}`).join("\n")}

Ensure:
- Calculated GPA is max 4.0
- Rigor adjusted GPA considers rigor rating proportionally but does not exceed 4.0
- Quality points = convertedGrade * credits
Return JSON only.
`;

    const { text: aiResponse } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system: "You are an expert GPA evaluator. Return only valid JSON. No explanations or markdown formatting.",
    });

    // ✅ Clean and parse AI JSON response
    const cleaned = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("AI JSON parsing failed:", cleaned, err);
      return NextResponse.json(
        {
          success: false,
          error: "AI parsing failed. Invalid JSON returned.",
          raw: cleaned,
        },
        { status: 500 },
      );
    }

    // ✅ Final response structure matching UI expectations
    return NextResponse.json({
      success: true,
      convertedGPA: Math.min(parsed.convertedGPA, 4.0),
      details: {
        rigorAdjustedGPA: Math.min(parsed.rigorAdjustedGPA, 4.0),
        courseConversions: parsed.courseConversions || [],
        conversionMethodology: parsed.conversionMethodology || "AI-powered conversion",
        confidence: parsed.confidence || 95,
        conversionNotes: parsed.conversionNotes || "",
        qualityAnalysis: parsed.qualityAnalysis || "",
        recommendations: parsed.recommendations || "",
        originalCGPA: institutionData.originalCGPA,
        institutionRigor: institutionData.rigor,
        totalCourses: courses.length,
        totalCredits: courses.reduce((sum, c) => sum + c.credits, 0),
        aiProcessed: true,
      },
    });
  } catch (error) {
    console.error("Transcript GPA calculation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "AI processing failed due to unexpected error.",
      },
      { status: 500 },
    );
  }
}
