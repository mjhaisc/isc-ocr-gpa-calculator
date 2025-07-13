import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No CSV file uploaded" }, { status: 400 });
    }

    // ✅ Parse options JSON
    const optionsBlob = formData.get("options") as Blob;
    const optionsText = await optionsBlob.text();
    const { gradingScale, institutionalSettings } = JSON.parse(optionsText);

    // ✅ Read file as text
    const buffer = Buffer.from(await file.arrayBuffer());
    const csvContent = buffer.toString("utf-8");

    // ✅ Parse CSV using built-in methods
    const lines = csvContent.split(/\r?\n/).filter(Boolean);
    const headers = lines[0].split(",").map((h) => h.trim());

    const requiredFields = [
      "university_name",
      "program_name",
      "student_id",
      "student_name",
      "term/semester",
      "course_code",
      "course_name",
      "credits",
      "grade",
    ];

    const missingFields = requiredFields.filter((field) => !headers.includes(field));
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 },
      );
    }

    const records = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      return row;
    });

    // ✅ Build AI prompt
    const prompt = `
You are a university GPA evaluation expert.

Using the following data, calculate GPA precisely considering institutional rigor, grading scale, and institutional settings. Return **valid JSON only** matching this exact structure:

{
  "success": true,
  "results": {
    "institutional": number,
    "transfer": number | null,
    "cumulative": number,
    "breakdown": {
      "totalCredits": number,
      "transferCredits": number,
      "institutionalCredits": number,
      "qualityPoints": number,
      "transferQualityPoints": number,
      "institutionalQualityPoints": number
    },
    "insights": [string],
    "warnings": [string]
  },
  "courseDetails": [
    {
      "id": string,
      "name": string,
      "credits": number,
      "grade": string,
      "semester": string,
      "convertedCredits": number,
      "adjustedGradePoints": number,
      "qualityPoints": number
    }
  ],
  "validationResult": string
}

### Grading Scale:
${JSON.stringify(gradingScale, null, 2)}

### Institutional Settings:
${JSON.stringify(institutionalSettings, null, 2)}

### CSV Courses:
${records
  .map(
    (r, i) =>
      `${i + 1}. ${r.course_code}: ${r.course_name}, Grade: ${r.grade}, Credits: ${r.credits}, Term: ${r["term/semester"]}, Student: ${r.student_name}`,
  )
  .join("\n")}

**Notes:**
- Perform precise GPA calculation with rigor adjustments if applicable.
- If transfer credits exist, calculate cumulative GPA accordingly.
- Provide thorough insights and a validationResult text.
- Return only valid JSON. No explanation or surrounding text.
`;

    const { text: aiResponse } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system:
        "You are a credential evaluation AI. Always respond with strict valid JSON matching the provided structure with no extra text or explanations.",
    });

    let parsedResult;
    try {
      // ✅ Remove wrapping ```json ... ``` if present
      const cleanedResponse = aiResponse
        .replace(/^\s*```json\s*/i, "")
        .replace(/^\s*```\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      parsedResult = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("AI response parsing failed:", aiResponse);
      return NextResponse.json(
        { success: false, error: "Failed to parse AI response. Please check data consistency." },
        { status: 500 },
      );
    }

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error("Batch GPA calculation error:", error);
    return NextResponse.json(
      { success: false, error: "Processing failed" },
      { status: 500 },
    );
  }
}
