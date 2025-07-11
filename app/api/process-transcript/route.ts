import { type NextRequest, NextResponse } from "next/server"
import tesseract from "node-tesseract-ocr"
import fs from "fs"
import path from "path"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "OpenAI API key missing" }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get("transcript") as File
    const selectedInstitution = formData.get("selectedInstitution") as string

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const tempPath = path.join("/tmp", file.name)
    fs.writeFileSync(tempPath, buffer)

    // Perform OCR
    const extractedText = await tesseract.recognize(tempPath, { lang: "eng" })
    fs.unlinkSync(tempPath)

    // 🔥 Call OpenAI to parse OCR text into fallback-like structured data
    const prompt = `
You are an expert OCR post-processor for academic transcripts.

Given the extracted raw text below from a transcript PDF, parse and return structured JSON **strictly in this schema**:

{
  "institutionName": "Full name of institution",
  "institutionType": "Technical/Research/Liberal Arts/Medical/Business",
  "country": "Country",
  "studentName": "Student's full name",
  "studentId": "Student ID",
  "gradingScale": "Detected grading system (e.g. '10-point CGPA', '4.0 GPA', 'Percentage', 'Letter Grades', 'Class Honours')",
  "courses": [
    {
      "id": "unique_id",
      "code": "Course code",
      "name": "Full course name",
      "credits": number,
      "grade": "Grade received",
      "semester": "Semester/Term name",
      "year": "Academic year"
    }
  ],
  "totalCredits": number,
  "cgpa": number,
  "confidence": number (0-100)
}

Here is the OCR extracted text:
"""
${extractedText}
"""

The institution is "${selectedInstitution}". Return only valid JSON with no explanation text.
    `

    const { text: aiParsed } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system:
        "You are an academic transcript OCR parser. Always respond with valid JSON strictly matching the schema, no extra text.",
    })

    let transcriptData
    try {
      transcriptData = JSON.parse(aiParsed)
    } catch (err) {
      console.error("AI JSON parsing failed:", err)
      return NextResponse.json({ success: false, error: "AI parsing failed" }, { status: 500 })
    }

    // ✅ Ensure final data has fallback fields for your UI
    const coursesWithIds = transcriptData.courses?.map((course: any, index: number) => ({
      ...course,
      id: course.id || (index + 1).toString(),
      credits: Number(course.credits) || 0,
    })) || []

    const totalCredits = coursesWithIds.reduce((sum: number, c: any) => sum + c.credits, 0)

    const finalData = {
      institutionName: transcriptData.institutionName || "Unknown",
      institutionType: transcriptData.institutionType || "Unknown",
      country: transcriptData.country || "Unknown",
      studentName: transcriptData.studentName || "Unknown",
      studentId: transcriptData.studentId || "Unknown",
      gradingScale: transcriptData.gradingScale || "Unknown",
      courses: coursesWithIds,
      totalCredits: transcriptData.totalCredits || totalCredits,
      cgpa: transcriptData.cgpa || 0.0,
      confidence: transcriptData.confidence || 90,
      processedAt: new Date().toISOString(),
      fileName: file.name,
    }

    return NextResponse.json({
      success: true,
      data: finalData,
    })
  } catch (error) {
    console.error("OCR + AI error:", error)
    return NextResponse.json({ success: false, error: "Processing failed" }, { status: 500 })
  }
}
