import { type NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    if (data === undefined || data === null) {
      throw new Error("No data provided");
    }

    // Generate CSV dynamically using OpenAI
    const prompt = `
You are an expert academic data analyst and CSV report generator.

Given the following input data (which may be JSON, array, string, or boolean), generate a **professional CSV report** that includes:

1. All summary statistics, insights, or results in tabular rows
2. Course details if available as table rows
3. Warnings or validation results if present
4. Dynamic adaptation to the data structure and keys
5. The output must be a **single valid CSV string**, with proper headers and rows, suitable for direct download.

Respond ONLY with the CSV string without any explanation or disclaimers.

Here is the data:
\`\`\`
${JSON.stringify(data, null, 2)}
\`\`\`
    `;

    const { text: csvContent } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system:
        "You are a structured data to CSV converter with expertise in academic reporting. Output strictly valid CSV only.",
    });

    const filename = `academic-report-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Dynamic CSV export error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate CSV export via AI. Please try again.",
      },
      { status: 500 }
    );
  }
}
