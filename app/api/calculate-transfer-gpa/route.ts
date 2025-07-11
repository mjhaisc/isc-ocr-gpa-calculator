import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface Course {
  id: string
  name: string
  credits: number
  grade: string
  semester: string
  isTransfer?: boolean
  originalCredits?: number
  creditSystem?: "semester" | "quarter" | "trimester"
  courseType?: "core" | "elective" | "honors" | "ap"
  institutionName?: string
  rigorRating?: number
}

interface TransferGPARequest {
  courses: Course[]
  gradingScale: {
    name: string
    type: string
    grades: { [key: string]: number }
  }
  institutionalSettings: {
    includeTransferInGPA: boolean
    separateTransferGPA: boolean
    coreSubjectsOnly: boolean
    honorsBonusPoints: number
    apBonusPoints: number
    rigorAdjustment: number
  }
  studentName?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: TransferGPARequest = await request.json()
    const { courses, gradingScale, institutionalSettings, studentName } = body

    // Convert credit hours based on system
    const convertedCourses = courses.map((course) => {
      let convertedCredits = course.credits

      if (course.isTransfer && course.creditSystem && course.originalCredits) {
        switch (course.creditSystem) {
          case "quarter":
            convertedCredits = Math.round(course.originalCredits * 0.67 * 10) / 10
            break
          case "trimester":
            convertedCredits = Math.round(course.originalCredits * 0.75 * 10) / 10
            break
          default:
            convertedCredits = course.originalCredits
        }
      }

      return {
        ...course,
        convertedCredits,
      }
    })

    // Filter courses based on institutional settings
    const filteredCourses = convertedCourses.filter((course) => {
      if (institutionalSettings.coreSubjectsOnly && course.courseType === "elective") {
        return false
      }
      return true
    })

    // AI-powered validation with transfer-specific checks
    const validationPrompt = `
      Validate the following transfer and institutional course data for GPA calculation:
      
      Student: ${studentName || "Unknown"}
      Grading Scale: ${gradingScale.name}
      
      Institutional Settings:
      - Include Transfer in GPA: ${institutionalSettings.includeTransferInGPA}
      - Core Subjects Only: ${institutionalSettings.coreSubjectsOnly}
      - Honors Bonus: ${institutionalSettings.honorsBonusPoints}
      - AP Bonus: ${institutionalSettings.apBonusPoints}
      
      Courses:
      ${filteredCourses
        .map(
          (course, index) =>
            `${index + 1}. ${course.name} - ${course.convertedCredits} credits - Grade: ${course.grade} - ${course.isTransfer ? `Transfer from ${course.institutionName || "Unknown"} (${course.creditSystem} system, original: ${course.originalCredits} credits)` : "Institutional"} - Type: ${course.courseType} - Rigor: ${course.rigorRating || "N/A"}`,
        )
        .join("\n")}
      
      Check for:
      1. Credit conversion accuracy
      2. Transfer credit limitations
      3. Grading scale compatibility
      4. Course type classifications
      5. Potential rigor adjustments needed
      
      Respond with "VALID" if acceptable, or list specific issues and recommendations.
    `

    const { text: validationResult } = await generateText({
      model: openai("gpt-4o"),
      prompt: validationPrompt,
      system:
        "You are a transfer credit specialist with expertise in GPA calculations across different institutional systems.",
    })

    // Calculate separate GPAs
    let institutionalPoints = 0,
      institutionalCredits = 0
    let transferPoints = 0,
      transferCredits = 0
    let totalPoints = 0,
      totalCredits = 0

    const courseDetails = []
    const warnings = []

    for (const course of filteredCourses) {
      let baseGradePoints = gradingScale.grades[course.grade] || 0

      // Apply course type bonuses
      if (course.courseType === "honors") {
        baseGradePoints += institutionalSettings.honorsBonusPoints
      } else if (course.courseType === "ap") {
        baseGradePoints += institutionalSettings.apBonusPoints
      }

      // Apply rigor adjustment for transfer courses
      if (course.isTransfer && course.rigorRating) {
        const rigorMultiplier = (course.rigorRating / 3) * institutionalSettings.rigorAdjustment
        baseGradePoints *= rigorMultiplier

        if (rigorMultiplier !== 1) {
          warnings.push(
            `${course.name}: Rigor adjustment applied (${rigorMultiplier.toFixed(2)}x) based on institutional rating`,
          )
        }
      }

      // Cap grade points at maximum scale
      const maxPoints = Math.max(...Object.values(gradingScale.grades))
      baseGradePoints = Math.min(baseGradePoints, maxPoints + 2) // Allow some bonus beyond scale

      const qualityPoints = baseGradePoints * course.convertedCredits

      if (course.isTransfer) {
        transferPoints += qualityPoints
        transferCredits += course.convertedCredits

        if (course.creditSystem !== "semester") {
          warnings.push(
            `${course.name}: Credits converted from ${course.creditSystem} system (${course.originalCredits} → ${course.convertedCredits})`,
          )
        }
      } else {
        institutionalPoints += qualityPoints
        institutionalCredits += course.convertedCredits
      }

      // Include in total based on settings
      if (!course.isTransfer || institutionalSettings.includeTransferInGPA) {
        totalPoints += qualityPoints
        totalCredits += course.convertedCredits
      }

      courseDetails.push({
        ...course,
        adjustedGradePoints: Math.round(baseGradePoints * 100) / 100,
        qualityPoints: Math.round(qualityPoints * 100) / 100,
      })
    }

    // Calculate GPAs
    const institutionalGPA = institutionalCredits > 0 ? institutionalPoints / institutionalCredits : null
    const transferGPA = transferCredits > 0 ? transferPoints / transferCredits : null
    const cumulativeGPA = totalCredits > 0 ? totalPoints / totalCredits : null

    // Add transfer-specific warnings
    if (transferCredits > 0 && !institutionalSettings.includeTransferInGPA) {
      warnings.push("Transfer credits are excluded from cumulative GPA calculation per institutional policy")
    }

    if (transferCredits > institutionalCredits * 2) {
      warnings.push("Transfer credits significantly exceed institutional credits - verify transfer limits")
    }

    // Generate AI insights for transfer students
    const insightsPrompt = `
      Analyze this transfer student's academic record:
      
      Student: ${studentName || "Transfer Student"}
      Cumulative GPA: ${cumulativeGPA?.toFixed(2) || "N/A"}
      Institutional GPA: ${institutionalGPA?.toFixed(2) || "N/A"}
      Transfer GPA: ${transferGPA?.toFixed(2) || "N/A"}
      
      Credits: ${totalCredits} total (${institutionalCredits} institutional, ${transferCredits} transfer)
      
      Transfer Institutions: ${[...new Set(filteredCourses.filter((c) => c.isTransfer).map((c) => c.institutionName))].join(", ")}
      
      Provide 3-4 insights about:
      1. Academic progression from transfer to current institution
      2. Credit utilization and degree progress
      3. Any notable patterns or recommendations
      4. Transfer credit optimization suggestions
    `

    const { text: insights } = await generateText({
      model: openai("gpt-4o"),
      prompt: insightsPrompt,
      system: "You are an academic advisor specializing in transfer student success and degree planning.",
    })

    return NextResponse.json({
      success: true,
      results: {
        institutional: institutionalGPA ? Math.round(institutionalGPA * 100) / 100 : null,
        transfer: transferGPA ? Math.round(transferGPA * 100) / 100 : null,
        cumulative: cumulativeGPA ? Math.round(cumulativeGPA * 100) / 100 : null,
        breakdown: {
          totalCredits,
          transferCredits,
          institutionalCredits,
          qualityPoints: Math.round(totalPoints * 100) / 100,
          transferQualityPoints: Math.round(transferPoints * 100) / 100,
          institutionalQualityPoints: Math.round(institutionalPoints * 100) / 100,
        },
        insights: insights.split("\n").filter((line) => line.trim()),
        warnings,
      },
      courseDetails,
      validationResult,
    })
  } catch (error) {
    console.error("Transfer GPA calculation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate transfer GPA. Please try again.",
        results: null,
      },
      { status: 500 },
    )
  }
}
