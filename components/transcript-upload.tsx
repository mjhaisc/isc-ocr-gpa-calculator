"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileText,
  Eye,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Globe,
  Edit3,
  Save,
  X,
  Calculator,
} from "lucide-react"

interface ExtractedCourse {
  id: string
  courseId: string
  courseName: string
  credits: number
  grade: string
  semester: string
  year: string
}

interface TranscriptData {
  institutionName: string
  institutionType: string
  studentName: string
  studentId: string
  courses: ExtractedCourse[]
  gradingScale: string
  totalCredits: number
  cgpa?: number
  confidence: number
}

interface TranscriptUploadProps {
  onTranscriptProcessed: (data: TranscriptData) => void
  onCoursesExtracted: (courses: any[]) => void
  onGPACalculated: (gpa: number, details: any) => void
}

export function TranscriptUpload({
  onTranscriptProcessed,
  onCoursesExtracted,
  onGPACalculated,
}: TranscriptUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState("")
  const [progress, setProgress] = useState(0)
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedInstitution, setSelectedInstitution] = useState("")
  const [editingCourse, setEditingCourse] = useState<string | null>(null)
  const [calculatedGPA, setCalculatedGPA] = useState<{ gpa: number; details: any } | null>(null)
  const [isCalculatingGPA, setIsCalculatingGPA] = useState(false)

  const globalInstitutions = [
    {
      id: "iit-bombay",
      name: "IIT Bombay",
      country: "India",
      rigor: 4.8,
      type: "Technical",
      gradingScale: "10-point CGPA",
    },
    {
      id: "iit-delhi",
      name: "IIT Delhi",
      country: "India",
      rigor: 4.8,
      type: "Technical",
      gradingScale: "10-point CGPA",
    },
    {
      id: "iit-madras",
      name: "IIT Madras",
      country: "India",
      rigor: 4.7,
      type: "Technical",
      gradingScale: "10-point CGPA",
    },
    {
      id: "iisc-bangalore",
      name: "IISc Bangalore",
      country: "India",
      rigor: 4.9,
      type: "Research",
      gradingScale: "Letter Grades",
    },
    {
      id: "nit-trichy",
      name: "NIT Trichy",
      country: "India",
      rigor: 4.2,
      type: "Technical",
      gradingScale: "10-point CGPA",
    },
    {
      id: "bits-pilani",
      name: "BITS Pilani",
      country: "India",
      rigor: 4.3,
      type: "Technical",
      gradingScale: "10-point CGPA",
    },
    { id: "mit", name: "MIT", country: "USA", rigor: 4.9, type: "Technical", gradingScale: "4.0 GPA" },
    {
      id: "stanford",
      name: "Stanford University",
      country: "USA",
      rigor: 4.8,
      type: "Research",
      gradingScale: "4.0 GPA",
    },
    {
      id: "cambridge",
      name: "University of Cambridge",
      country: "UK",
      rigor: 4.7,
      type: "Research",
      gradingScale: "Class Honours",
    },
    {
      id: "oxford",
      name: "University of Oxford",
      country: "UK",
      rigor: 4.7,
      type: "Research",
      gradingScale: "Class Honours",
    },
  ]

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setTranscriptData(null)
      setCalculatedGPA(null)

      // Create preview URL for PDF/images
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }, [])

  const processTranscript = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    setProgress(0)

    try {
      // Step 1: OCR Processing
      setProcessingStep("Extracting text from document...")
      setProgress(20)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Step 2: Institution Recognition
      setProcessingStep("Identifying institution and grading system...")
      setProgress(40)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Step 3: Course Data Extraction
      setProcessingStep("Extracting course information...")
      setProgress(60)
      await new Promise((resolve) => setTimeout(resolve, 1200))

      // Step 4: Grade Conversion
      setProcessingStep("Converting grades and calculating GPA...")
      setProgress(80)
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Step 5: Validation
      setProcessingStep("Validating extracted data...")
      setProgress(100)

      // Simulate API call for transcript processing
      const formData = new FormData()
      formData.append("transcript", uploadedFile)
      formData.append("selectedInstitution", selectedInstitution)

      const response = await fetch("/api/process-transcript", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // Convert courses to the expected format with proper IDs
        const processedCourses = result.data.courses.map((course: any, index: number) => ({
          id: course.id || `course-${index}`,
          courseId: course.code || course.courseId || `COURSE${index + 1}`,
          courseName: course.name || course.courseName,
          credits: course.credits || 3,
          grade: course.grade,
          semester: course.semester || "Fall",
          year: course.year || "2023",
        }))

        const processedData = {
          ...result.data,
          courses: processedCourses,
        }

        setTranscriptData(processedData)
        onTranscriptProcessed(processedData)
        onCoursesExtracted(processedCourses)
      }
    } catch (error) {
      console.error("Transcript processing error:", error)
    } finally {
      setIsProcessing(false)
      setProcessingStep("")
    }
  }

  const updateCourse = (courseId: string, field: keyof ExtractedCourse, value: string | number) => {
    if (!transcriptData) return

    const updatedCourses = transcriptData.courses.map((course) =>
      course.id === courseId ? { ...course, [field]: value } : course,
    )

    setTranscriptData({
      ...transcriptData,
      courses: updatedCourses,
    })
  }

  const calculateGPAFromTranscript = async () => {
    if (!transcriptData) return

    setIsCalculatingGPA(true)

    try {
      // Convert transcript data to the format expected by the GPA calculator
      const courses = transcriptData.courses.map((course) => ({
        id: course.id,
        name: course.courseName,
        credits: course.credits,
        grade: course.grade,
        semester: `${course.semester} ${course.year}`,
        isTransfer: false,
        courseType: "core",
      }))

      // Get institution details for rigor adjustment
      const institution = globalInstitutions.find((inst) => inst.id === selectedInstitution)

      const response = await fetch("/api/calculate-transcript-gpa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courses,
          institutionData: {
            name: transcriptData.institutionName,
            gradingScale: transcriptData.gradingScale,
            rigor: institution?.rigor || 4.0,
            originalCGPA: transcriptData.cgpa,
          },
          studentName: transcriptData.studentName,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setCalculatedGPA({
          gpa: result.convertedGPA,
          details: result.details,
        })
        onGPACalculated(result.convertedGPA, result.details)
      } else {
        console.error("GPA calculation failed:", result.error)
      }
    } catch (error) {
      console.error("GPA calculation error:", error)
    } finally {
      setIsCalculatingGPA(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload Transcript/Marksheet
          </CardTitle>
          <CardDescription>
            Upload transcripts from global institutions (PDF, JPG, PNG). Supports IITs, NITs, and international
            universities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transcript-file">Select Transcript File</Label>
            <Input
              id="transcript-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500">Supported formats: PDF, JPG, PNG (Max size: 10MB)</p>
          </div>

          {uploadedFile && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{uploadedFile.name}</span>
                  <Badge variant="secondary">{(uploadedFile.size / 1024 / 1024).toFixed(1)} MB</Badge>
                </div>
                {previewUrl && (
                  <Button variant="ghost" size="sm" onClick={() => window.open(previewUrl, "_blank")}>
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="institution-select">Institution (Optional - helps with accuracy)</Label>
            <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
              <SelectTrigger>
                <SelectValue placeholder="Select institution if known" />
              </SelectTrigger>
              <SelectContent>
                {globalInstitutions.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id}>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-3 w-3" />
                      <span>{inst.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {inst.country}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={processTranscript} disabled={!uploadedFile || isProcessing} className="w-full">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Transcript...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Process Transcript
              </>
            )}
          </Button>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{processingStep}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Viewer and Extracted Data */}
      {transcriptData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document Viewer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Uploaded Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previewUrl && (
                <div className="border rounded-lg overflow-hidden">
                  {uploadedFile?.type === "application/pdf" ? (
                    <iframe src={previewUrl} className="w-full h-96" title="Transcript Preview" />
                  ) : (
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Transcript"
                      className="w-full h-96 object-contain bg-gray-50"
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Institution Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                Extracted Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Institution</Label>
                  <p className="text-sm">{transcriptData.institutionName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Student</Label>
                  <p className="text-sm">{transcriptData.studentName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Student ID</Label>
                  <p className="text-sm">{transcriptData.studentId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Grading System</Label>
                  <p className="text-sm">{transcriptData.gradingScale}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Original CGPA/GPA</Label>
                  <p className="text-sm font-semibold">{transcriptData.cgpa || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Extraction Confidence</Label>
                  <div className="flex items-center space-x-2">
                    <Progress value={transcriptData.confidence} className="w-20 h-2" />
                    <span className="text-sm">{transcriptData.confidence}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Extracted Course Data Table */}
      {transcriptData && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Course Data</CardTitle>
            <CardDescription>
              Review and edit the extracted course information. Click on any cell to edit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-3 text-left font-medium">Course ID</th>
                    <th className="border border-gray-300 p-3 text-left font-medium">Course Name</th>
                    <th className="border border-gray-300 p-3 text-left font-medium">Credits</th>
                    <th className="border border-gray-300 p-3 text-left font-medium">Grade</th>
                    <th className="border border-gray-300 p-3 text-left font-medium">Semester</th>
                    <th className="border border-gray-300 p-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transcriptData.courses.map((course, index) => (
                    <tr key={course.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 p-3">
                        {editingCourse === course.id ? (
                          <Input
                            value={course.courseId}
                            onChange={(e) => updateCourse(course.id, "courseId", e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          <span className="font-mono text-sm">{course.courseId}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {editingCourse === course.id ? (
                          <Input
                            value={course.courseName}
                            onChange={(e) => updateCourse(course.id, "courseName", e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          <span>{course.courseName}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {editingCourse === course.id ? (
                          <Input
                            type="number"
                            value={course.credits}
                            onChange={(e) => updateCourse(course.id, "credits", Number.parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        ) : (
                          <span className="font-semibold">{course.credits}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {editingCourse === course.id ? (
                          <Input
                            value={course.grade}
                            onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
                            className="w-16"
                          />
                        ) : (
                          <Badge variant="outline" className="font-semibold">
                            {course.grade}
                          </Badge>
                        )}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {editingCourse === course.id ? (
                          <Input
                            value={`${course.semester} ${course.year}`}
                            onChange={(e) => {
                              const [semester, year] = e.target.value.split(" ")
                              updateCourse(course.id, "semester", semester || "")
                              updateCourse(course.id, "year", year || "")
                            }}
                            className="w-full"
                          />
                        ) : (
                          <span className="text-sm">
                            {course.semester} {course.year}
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {editingCourse === course.id ? (
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => setEditingCourse(null)}>
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingCourse(null)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => setEditingCourse(course.id)}>
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Total Courses: {transcriptData.courses.length}</p>
                  <p className="text-sm text-gray-600">
                    Total Credits: {transcriptData.courses.reduce((sum, course) => sum + course.credits, 0)}
                  </p>
                </div>
                <Button
                  onClick={calculateGPAFromTranscript}
                  disabled={isCalculatingGPA}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCalculatingGPA ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculate GPA
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GPA Results */}
      {calculatedGPA && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle className="mr-2 h-5 w-5" />
              GPA Calculation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="text-4xl font-bold text-green-600 mb-2">{calculatedGPA.gpa.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Converted GPA</div>
                <div className="text-xs text-gray-500">4.0 Scale</div>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="text-4xl font-bold text-blue-600 mb-2">{transcriptData?.cgpa?.toFixed(2) || "N/A"}</div>
                <div className="text-sm text-gray-600">Original GPA</div>
                <div className="text-xs text-gray-500">{transcriptData?.gradingScale}</div>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {calculatedGPA.details?.rigorAdjustedGPA?.toFixed(2) || "N/A"}
                </div>
                <div className="text-sm text-gray-600">Rigor Adjusted</div>
                <div className="text-xs text-gray-500">Quality Factor Applied</div>
              </div>
            </div>

            {calculatedGPA.details?.conversionNotes && (
              <div className="mt-4 p-4 bg-white rounded-lg">
                <h4 className="font-medium mb-2">Conversion Notes:</h4>
                <p className="text-sm text-gray-700">{calculatedGPA.details.conversionNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confidence Warnings */}
      {transcriptData && transcriptData.confidence < 90 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Review Recommended</p>
              <p className="text-sm text-yellow-700">
                Confidence level is {transcriptData.confidence}%. Please verify the extracted data before proceeding
                with GPA calculation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
