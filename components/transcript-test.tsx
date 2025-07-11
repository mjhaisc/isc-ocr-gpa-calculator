"use client"

import { useState } from "react"
import { TranscriptUpload } from "./transcript-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TranscriptTest() {
  const [processedData, setProcessedData] = useState<any>(null)
  const [extractedCourses, setExtractedCourses] = useState<any[]>([])
  const [calculatedGPA, setCalculatedGPA] = useState<{ gpa: number; details: any } | null>(null)

  return (
    <div className="space-y-6">
      <TranscriptUpload
        onTranscriptProcessed={(data) => {
          console.log("Transcript processed:", data)
          setProcessedData(data)
        }}
        onCoursesExtracted={(courses) => {
          console.log("Courses extracted:", courses)
          setExtractedCourses(courses)
        }}
        onGPACalculated={(gpa, details) => {
          console.log("GPA calculated:", gpa, details)
          setCalculatedGPA({ gpa, details })
        }}
      />

      {/* Debug Information */}
      {processedData && (
        <Card>
          <CardHeader>
            <CardTitle>Debug: Processed Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(processedData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {extractedCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Debug: Extracted Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(extractedCourses, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {calculatedGPA && (
        <Card>
          <CardHeader>
            <CardTitle>Debug: Calculated GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(calculatedGPA, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
