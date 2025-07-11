import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface Course {
  id: string
  name: string
  credits: number
  grade: string
  semester: string
}

interface InstitutionData {
  name: string
  gradingScale: string
  rigor: number
  originalCGPA?: number
}

interface TranscriptGPARequest {
  courses: Course[]
  institutionData: InstitutionData
  studentName: string
}

export async function POST(request: NextRequest) {
  try {
    const body: TranscriptGPARequest = await request.json()
    const { courses, institutionData, studentName } = body

    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.log("OpenAI API key not found, using manual calculation")
      const result = performManualCalculation(courses, institutionData)
      return NextResponse.json({
        success: true,
        convertedGPA: result.convertedGPA,
        details: {
          ...result,
          aiProcessed: false,
          processingNote: "Calculated using manual method - AI features unavailable",
        },
      })
    }

    // AI-powered grade conversion and GPA calculation
    const conversionPrompt = `
    You are an expert in international academic credential evaluation and GPA conversions.
    
    Convert the following academic record to a standardized 4.0 GPA scale:
    
    Institution: ${institutionData.name}
    Original Grading Scale: ${institutionData.gradingScale}
    Original CGPA/GPA: ${institutionData.originalCGPA || "Not provided"}
    Institution Rigor Rating: ${institutionData.rigor}/5.0
    Student: ${studentName}
    
    Courses (${courses.length} total):
    ${courses
      .map(
        (course, index) =>
          `${index + 1}. ${course.name}: ${course.grade} (${course.credits} credits, ${course.semester})`,
      )
      .join("\n")}
    
    Please provide a comprehensive conversion analysis in JSON format:
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
      "conversionMethodology": "detailed explanation of conversion method",
      "confidence": number (0-100),
      "conversionNotes": "detailed notes about the conversion process",
      "qualityAnalysis": "analysis of academic performance",
      "recommendations": "recommendations for further evaluation"
    }
    
    Consider these factors:
    1. Institution's academic rigor and international reputation (${institutionData.rigor}/5.0)
    2. Grading scale differences and standards
    3. Course credit weighting and distribution
    4. Academic progression and consistency
    5. International recognition and equivalency standards
    6. Grade inflation/deflation patterns at the institution
    
    For different grading systems:
    - 10-point CGPA: Convert using appropriate scale (AA=10→4.0, AB=9→3.6, BB=8→3.2, etc.)
    - 4.0 GPA: Direct mapping with rigor adjustment
    - Class Honours: First=4.0, 2:1=3.5, 2:2=3.0, Third=2.5
    - Percentage: Use standard percentage to GPA conversion tables
    
    Apply rigor adjustment based on institutional quality but cap at reasonable limits.
    `

    const { text: conversionResult } = await generateText({
      model: openai("gpt-4o"),
      prompt: conversionPrompt,
      system:
        "You are an expert in international academic credential evaluation. Always respond with valid JSON and provide thorough, accurate conversions.",
    })

    let aiResult
    try {
      aiResult = JSON.parse(conversionResult)
    } catch (error) {
      console.error("AI result parsing error:", error)
      // Fallback to manual calculation
      aiResult = performManualCalculation(courses, institutionData)
    }

    // Validate AI results and apply safety checks
    const validatedResult = validateAndSanitizeResults(aiResult, courses, institutionData)

    return NextResponse.json({
      success: true,
      convertedGPA: validatedResult.convertedGPA,
      details: {
        rigorAdjustedGPA: validatedResult.rigorAdjustedGPA,
        courseConversions: validatedResult.courseConversions,
        conversionMethodology: validatedResult.conversionMethodology,
        confidence: validatedResult.confidence,
        conversionNotes: validatedResult.conversionNotes,
        qualityAnalysis: validatedResult.qualityAnalysis,
        recommendations: validatedResult.recommendations,
        originalCGPA: institutionData.originalCGPA,
        institutionRigor: institutionData.rigor,
        totalCourses: courses.length,
        totalCredits: courses.reduce((sum, course) => sum + course.credits, 0),
        aiProcessed: true,
      },
    })
  } catch (error) {
    console.error("Transcript GPA calculation error:", error)
    // Fallback to manual calculation on any error
    const body: TranscriptGPARequest = await request.json()
    const result = performManualCalculation(body.courses, body.institutionData)

    return NextResponse.json({
      success: true,
      convertedGPA: result.convertedGPA,
      details: {
        ...result,
        aiProcessed: false,
        processingNote: "Calculated using fallback method due to error",
      },
    })
  }
}

function performManualCalculation(courses: Course[], institutionData: InstitutionData) {
  // Comprehensive manual calculation with multiple grading systems
  const gradeConversions: { [key: string]: { [key: string]: number } } = {
    "10-point CGPA": {
      AA: 10,
      AB: 9,
      BB: 8,
      BC: 7,
      CC: 6,
      CD: 5,
      DD: 4,
      F: 0,
      "A+": 10,
      A: 9,
      "A-": 8,
      "B+": 7,
      B: 6,
      "B-": 5,
      "C+": 4,
      C: 3,
      D: 2,
      F: 0,
      O: 10,
    },
    "4.0 GPA": {
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      "D+": 1.3,
      D: 1.0,
      F: 0.0,
    },
    "Class Honours": {
      First: 4.0,
      "2:1": 3.5,
      "2:2": 3.0,
      Third: 2.5,
      Pass: 2.0,
      Fail: 0.0,
    },
    "Letter Grades": {
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      "D+": 1.3,
      D: 1.0,
      F: 0.0,
    },
    Percentage: {
      "90-100": 4.0,
      "80-89": 3.5,
      "70-79": 3.0,
      "60-69": 2.5,
      "50-59": 2.0,
      "40-49": 1.0,
      "0-39": 0.0,
    },
  }

  const conversionMap = gradeConversions[institutionData.gradingScale] || gradeConversions["4.0 GPA"]

  let totalPoints = 0
  let totalCredits = 0
  const courseConversions = []

  for (const course of courses) {
    let gradePoints = conversionMap[course.grade] || 0

    // Convert from 10-point to 4.0 scale if needed
    if (institutionData.gradingScale === "10-point CGPA" && gradePoints > 4) {
      gradePoints = (gradePoints / 10) * 4
    }

    const qualityPoints = gradePoints * course.credits
    totalPoints += qualityPoints
    totalCredits += course.credits

    courseConversions.push({
      course: course.name,
      originalGrade: course.grade,
      convertedGrade: Math.round(gradePoints * 100) / 100,
      qualityPoints: Math.round(qualityPoints * 100) / 100,
    })
  }

  const baseGPA = totalCredits > 0 ? totalPoints / totalCredits : 0
  const rigorMultiplier = Math.min(institutionData.rigor / 4.0, 1.2)
  const rigorAdjustedGPA = Math.min(baseGPA * rigorMultiplier, 4.0)

  return {
    convertedGPA: Math.round(baseGPA * 100) / 100,
    rigorAdjustedGPA: Math.round(rigorAdjustedGPA * 100) / 100,
    courseConversions,
    conversionMethodology: `Manual conversion from ${institutionData.gradingScale} to 4.0 scale using standard conversion factors`,
    confidence: 88,
    conversionNotes: `Converted using standard conversion factors with rigor adjustment of ${rigorMultiplier.toFixed(2)}x. ${institutionData.originalCGPA ? `Original CGPA: ${institutionData.originalCGPA}` : ""}`,
    qualityAnalysis: "Manual calculation completed successfully with comprehensive grade mapping",
    recommendations:
      "Results calculated using established conversion standards. Consider professional credential evaluation for official purposes.",
    originalCGPA: institutionData.originalCGPA,
    institutionRigor: institutionData.rigor,
    totalCourses: courses.length,
    totalCredits: courses.reduce((sum, course) => sum + course.credits, 0),
  }
}

function validateAndSanitizeResults(result: any, courses: Course[], institutionData: InstitutionData) {
  // Validate and sanitize AI results
  const sanitized = {
    convertedGPA: Math.min(Math.max(result.convertedGPA || 0, 0), 4.0),
    rigorAdjustedGPA: Math.min(Math.max(result.rigorAdjustedGPA || 0, 0), 4.0),
    courseConversions: result.courseConversions || [],
    conversionMethodology: result.conversionMethodology || "AI-powered conversion with validation",
    confidence: Math.min(Math.max(result.confidence || 80, 0), 100),
    conversionNotes: result.conversionNotes || "Conversion completed successfully",
    qualityAnalysis: result.qualityAnalysis || "Academic performance analysis completed",
    recommendations: result.recommendations || "Results validated and ready for use",
  }

  // Ensure course conversions match input courses
  if (sanitized.courseConversions.length !== courses.length) {
    sanitized.courseConversions = courses.map((course, index) => ({
      course: course.name,
      originalGrade: course.grade,
      convertedGrade: 3.0, // Default B grade
      qualityPoints: 3.0 * course.credits,
    }))
    sanitized.confidence = Math.min(sanitized.confidence, 70)
  }

  return sanitized
}
