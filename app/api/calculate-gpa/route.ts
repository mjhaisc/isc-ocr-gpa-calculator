import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface Course {
  name: string
  credits: number
  grade: string
  semester: string
}

interface CalculationRequest {
  courses: Course[]
  gradingScale: {
    name: string
    type: string
    grades: { [key: string]: number }
  }
  studentName?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculationRequest = await request.json()
    const { courses, gradingScale, studentName } = body

    // AI-powered validation
    const validationPrompt = `
      Validate the following course data for GPA calculation:
      
      Student: ${studentName || "Unknown"}
      Grading Scale: ${gradingScale.name}
      
      Courses:
      ${courses
        .map(
          (course, index) =>
            `${index + 1}. ${course.name} - ${course.credits} credits - Grade: ${course.grade} - Semester: ${course.semester}`,
        )
        .join("\n")}
      
      Please check for:
      1. Missing or invalid course names
      2. Invalid credit hours (should be 1-6)
      3. Invalid grades for the selected grading scale
      4. Any other data inconsistencies
      
      Respond with either "VALID" if all data is correct, or list specific issues found.
    `

    const { text: validationResult } = await generateText({
      model: openai("gpt-4o"),
      prompt: validationPrompt,
      system: "You are a GPA calculation validator. Be thorough but concise in your validation.",
    })

    // If validation fails, return errors
    if (!validationResult.includes("VALID")) {
      return NextResponse.json({
        success: false,
        errors: validationResult.split("\n").filter((line) => line.trim()),
        gpa: null,
      })
    }

    // Calculate GPA
    let totalPoints = 0
    let totalCredits = 0
    const courseDetails = []

    for (const course of courses) {
      const gradePoints = gradingScale.grades[course.grade] || 0
      const points = gradePoints * course.credits

      totalPoints += points
      totalCredits += course.credits

      courseDetails.push({
        ...course,
        gradePoints,
        qualityPoints: points,
      })
    }

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0
    const roundedGPA = Math.round(gpa * 100) / 100

    // Generate AI insights
    const insightsPrompt = `
      Based on the following GPA calculation results, provide brief insights:
      
      Student: ${studentName || "Student"}
      Final GPA: ${roundedGPA} (${gradingScale.name})
      Total Credits: ${totalCredits}
      
      Course Performance:
      ${courseDetails.map((course) => `${course.name}: ${course.grade} (${course.gradePoints} points)`).join("\n")}
      
      Provide 2-3 brief insights about the academic performance.
    `

    const { text: insights } = await generateText({
      model: openai("gpt-4o"),
      prompt: insightsPrompt,
      system: "You are an academic advisor providing constructive insights about student performance.",
    })

    return NextResponse.json({
      success: true,
      gpa: roundedGPA,
      totalCredits,
      totalQualityPoints: Math.round(totalPoints * 100) / 100,
      courseDetails,
      insights: insights.split("\n").filter((line) => line.trim()),
      validationResult: "All data validated successfully",
    })
  } catch (error) {
    console.error("GPA calculation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate GPA. Please try again.",
        gpa: null,
      },
      { status: 500 },
    )
  }
}
