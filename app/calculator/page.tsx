"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  Plus,
  Trash2,
  CalculatorIcon,
  AlertCircle,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { useSearchParams } from "next/navigation";
import { InstitutionalSettings } from "@/components/institutional-settings";
import { GPAResultsDisplay } from "@/components/gpa-results-display";
import { InstitutionDatabase } from "@/components/institution-database";
import { TranscriptTest } from "@/components/transcript-test";

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
  semester: string;
  isTransfer?: boolean;
  originalCredits?: number;
  creditSystem?: "semester" | "quarter" | "trimester";
  courseType?: "core" | "elective" | "honors" | "ap";
  institutionName?: string;
  rigorRating?: number;
}

interface GradingScale {
  name: string;
  type: "4.0" | "5.0" | "percentage" | "letter";
  grades: { [key: string]: number };
}

const gradingScales: GradingScale[] = [
  {
    name: "4.0 Scale (Standard)",
    type: "4.0",
    grades: {
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
  },
  {
    name: "5.0 Scale (Weighted)",
    type: "5.0",
    grades: {
      A: 5.0,
      "A-": 4.7,
      "B+": 4.3,
      B: 4.0,
      "B-": 3.7,
      "C+": 3.3,
      C: 3.0,
      "C-": 2.7,
      "D+": 2.3,
      D: 2.0,
      F: 0.0,
    },
  },
  {
    name: "Percentage Scale",
    type: "percentage",
    grades: {
      "90-100": 4.0,
      "80-89": 3.0,
      "70-79": 2.0,
      "60-69": 1.0,
      "0-59": 0.0,
    },
  },
];

export default function GPAApp() {
  const searchParams = useSearchParams();
  const mode = searchParams?.get("mode") || "manual";

  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "", credits: 3, grade: "", semester: "Fall 2024" },
  ]);
  const [selectedScale, setSelectedScale] = useState<GradingScale>(
    gradingScales[0]
  );
  const [calculatedGPA, setCalculatedGPA] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [csvData, setCsvData] = useState("");
  const [studentName, setStudentName] = useState("");
  const [batchResults, setBatchResults] = useState<{
    institutional: number | null;
    transfer: number | null;
    cumulative: number | null;
    breakdown: {
      totalCredits: number;
      transferCredits: number;
      institutionalCredits: number;
      qualityPoints: number;
      transferQualityPoints: number;
      institutionalQualityPoints: number;
    };
    insights: string[];
    warnings: string[];
  } | null>(null);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [transferMode, setTransferMode] = useState(false);
  const [institutionalSettings, setInstitutionalSettings] = useState({
    includeTransferInGPA: true,
    separateTransferGPA: true,
    coreSubjectsOnly: false,
    honorsBonusPoints: 0.5,
    apBonusPoints: 1.0,
    rigorAdjustment: 1.0,
  });
  const [gpaResults, setGpaResults] = useState<{
    institutional: number | null;
    transfer: number | null;
    cumulative: number | null;
    breakdown: {
      totalCredits: number;
      transferCredits: number;
      institutionalCredits: number;
      qualityPoints: number;
      transferQualityPoints: number;
      institutionalQualityPoints: number;
    };
    insights: string[];
    warnings: string[];
  } | null>(null);

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name: "",
      credits: 3,
      grade: "",
      semester: "Fall 2024",
    };
    setCourses([...courses, newCourse]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter((course) => course.id !== id));
  };

  const updateCourse = (
    id: string,
    field: keyof Course,
    value: string | number | boolean
  ) => {
    setCourses(
      courses.map((course) =>
        course.id === id ? { ...course, [field]: value } : course
      )
    );
  };

  const validateCourses = () => {
    const errors: string[] = [];

    courses.forEach((course, index) => {
      if (!course.name.trim()) {
        errors.push(`Course ${index + 1}: Name is required`);
      }
      if (course.credits <= 0) {
        errors.push(`Course ${index + 1}: Credits must be greater than 0`);
      }
      if (!course.grade) {
        errors.push(`Course ${index + 1}: Grade is required`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

 const calculateGPA = async () => {
  if (!validateCourses()) return;

  setIsCalculating(true);

  try {
    const response = await fetch("/api/calculate-transfer-gpa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        courses,
        gradingScale: selectedScale,
        institutionalSettings,
        studentName,
      }),
    });

    const data = await response.json();

    if (data.success && data.results) {
      setGpaResults(data.results);
      setValidationErrors([]);

      // ✅ Increment transferGPA counter in localStorage
      const prevCount = parseInt(localStorage.getItem("transferGPA") || "0", 10);
      const newCount = prevCount + 1;
      localStorage.setItem("transferGPA", newCount.toString());

      // ✅ Prepare new entry for results array
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      const firstCourse = data.courseDetails?.[0];

      const newEntry = {
        Student:  studentName || "Unknown Student",
        GPA: data.results.cumulative ?? 0,
        Scale: selectedScale.name || selectedScale.type || "Unknown Scale",
        Credits: data.results.breakdown.totalCredits ?? 0,
        Semester: firstCourse ? `${firstCourse.semester} ${firstCourse.year || ""}` : "N/A",
        Date: today,
        Status: "Completed",
      };

      // ✅ Save to results array in localStorage
      const existingResults = JSON.parse(localStorage.getItem("results") || "[]");
      existingResults.push(newEntry);
      localStorage.setItem("results", JSON.stringify(existingResults));

      console.log("✅ Transfer GPA result saved to localStorage results array");
    } else {
      setValidationErrors([data.error || "Calculation failed"]);
    }
  } catch (error) {
    setValidationErrors(["Network error. Please try again."]);
  } finally {
    setIsCalculating(false);
  }
};

const handleCsvUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  formData.append(
    "options",
    new Blob(
      [
        JSON.stringify({
          gradingScale: selectedScale,
          institutionalSettings,
        }),
      ],
      { type: "application/json" }
    )
  );

  try {
    const response = await fetch("/api/calculate-batch-gpa", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success && result.results) {
      const { results, courseDetails } = result;

      // ✅ Transform and store only required GPA summary structure in state
      setBatchResults({
        institutional: results.institutional ?? null,
        transfer: results.transfer ?? null,
        cumulative: results.cumulative ?? null,
        breakdown: {
          totalCredits: results.breakdown.totalCredits ?? 0,
          transferCredits: results.breakdown.transferCredits ?? 0,
          institutionalCredits: results.breakdown.institutionalCredits ?? 0,
          qualityPoints: results.breakdown.qualityPoints ?? 0,
          transferQualityPoints: results.breakdown.transferQualityPoints ?? 0,
          institutionalQualityPoints: results.breakdown.institutionalQualityPoints ?? 0,
        },
        insights: results.insights ?? [],
        warnings: results.warnings ?? [],
      });

      console.log("✅ GPA summary saved to batchResults state");

      // ✅ Increment batchUploads counter in localStorage
      const prevCount = parseInt(localStorage.getItem("batchUploads") || "0", 10);
      const newCount = prevCount + 1;
      localStorage.setItem("batchUploads", newCount.toString());

      // ✅ Prepare new entry for results array
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      const firstCourse = courseDetails?.[0];

      const newEntry = {
        Student: studentName || "Unknown Student",
        GPA: results.cumulative ?? 0,
        Scale: selectedScale.name || selectedScale.type || "Unknown Scale",
        Credits: results.breakdown.totalCredits ?? 0,
        Semester: firstCourse ? `${firstCourse.semester} ${firstCourse.year || ""}` : "N/A",
        Date: today,
        Status: "Completed",
      };

      // ✅ Save to results array in localStorage
      const existingResults = JSON.parse(localStorage.getItem("results") || "[]");
      existingResults.push(newEntry);
      localStorage.setItem("results", JSON.stringify(existingResults));

      console.log("✅ Batch upload result saved to localStorage results array");
    } else {
      console.error("❌ Batch GPA calculation failed:", result.error);
    }
  } catch (error) {
    console.error("❌ Error uploading CSV:", error);
  }
};



  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">GPA Calculator</h1>
          <p className="text-gray-600 mt-2">
            Calculate GPA with AI-powered validation and multiple grading
            scales.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Data Entry</CardTitle>
                <CardDescription>
                  Enter course information manually or upload CSV data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={mode} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    <TabsTrigger value="batch">Batch Upload</TabsTrigger>
                    <TabsTrigger value="transfer">Transfer Credits</TabsTrigger>
                    <TabsTrigger value="transcript">Transcript OCR</TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-name">Student Name</Label>
                      <Input
                        id="student-name"
                        placeholder="Enter student name"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-4">
                      {courses.map((course, index) => (
                        <div
                          key={course.id}
                          className="p-4 border rounded-lg space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Course {index + 1}</h4>
                            {courses.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCourse(course.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="md:col-span-2">
                              <Label>Course Name</Label>
                              <Input
                                placeholder="e.g., Calculus I"
                                value={course.name}
                                onChange={(e) =>
                                  updateCourse(
                                    course.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>Credits</Label>
                              <Input
                                type="number"
                                min="1"
                                max="6"
                                value={course.credits}
                                onChange={(e) =>
                                  updateCourse(
                                    course.id,
                                    "credits",
                                    Number.parseInt(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>Grade</Label>
                              <Select
                                value={course.grade}
                                onValueChange={(value) =>
                                  updateCourse(course.id, "grade", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(selectedScale.grades).map(
                                    (grade) => (
                                      <SelectItem key={grade} value={grade}>
                                        {grade} ({selectedScale.grades[grade]})
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label>Semester</Label>
                            <Input
                              placeholder="e.g., Fall 2024"
                              value={course.semester}
                              onChange={(e) =>
                                updateCourse(
                                  course.id,
                                  "semester",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={addCourse}
                      variant="outline"
                      className="w-full bg-transparent"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Course
                    </Button>
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>Calculate GPA</CardTitle>
                        <CardDescription>
                          AI-powered validation and calculation
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button
                          onClick={calculateGPA}
                          className="w-full"
                          disabled={isCalculating || courses.length === 0}
                        >
                          {isCalculating ? (
                            "Calculating..."
                          ) : (
                            <>
                              <CalculatorIcon className="mr-2 h-4 w-4" />
                              Calculate GPA
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                    {gpaResults && (
                      <GPAResultsDisplay
                        results={gpaResults}
                        studentName={studentName}
                        gradingScale={selectedScale.name}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="batch" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-name-batch">Student Name</Label>
                      <Input
                        id="student-name-batch"
                        placeholder="Enter student name"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="csv-file">Upload CSV File</Label>
                      <Input
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBatchFile(file); // ✅ store file in state
                          }
                        }}
                      />
                      <p className="text-sm text-gray-500">
                        Upload a CSV with the following fields:
                        <br />
                        <strong>
                          university_name, program_name, student_id,
                          student_name, term/semester, course_code, course_name,
                          credits, grade
                        </strong>
                      </p>
                    </div>

                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>Calculate GPA</CardTitle>
                        <CardDescription>
                          AI-powered validation and calculation
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button
                          onClick={async () => {
                            if (batchFile) {
                              setIsCalculating(true); // ✅ set calculating state
                              await handleCsvUpload(batchFile);
                              setIsCalculating(false); // ✅ reset calculating state
                            }
                          }}
                          className="w-full"
                          disabled={isCalculating || !batchFile}
                        >
                          {isCalculating ? (
                            "Calculating..."
                          ) : (
                            <>
                              <CalculatorIcon className="mr-2 h-4 w-4" />
                              Calculate GPA
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                    {batchResults && (
                      <GPAResultsDisplay
                        results={batchResults}
                        studentName={studentName}
                        gradingScale={selectedScale.name}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="transfer" className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-red-600 text-sm italic">
                        * This section is not part of the current implementation
                        and may be included in future iterations.
                      </p>

                      <Label htmlFor="student-name-transfer">
                        Student Name
                      </Label>
                      <Input
                        id="student-name-transfer"
                        placeholder="Enter student name"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-4">
                      {courses.map((course, index) => (
                        <div
                          key={course.id}
                          className="p-4 border rounded-lg space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              {course.isTransfer ? "Transfer " : ""}Course{" "}
                              {index + 1}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <Label className="text-sm">Transfer Credit</Label>
                              <input
                                type="checkbox"
                                checked={course.isTransfer || false}
                                onChange={(e) =>
                                  updateCourse(
                                    course.id,
                                    "isTransfer",
                                    e.target.checked
                                  )
                                }
                                className="rounded"
                              />
                              {courses.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCourse(course.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label>Course Name</Label>
                              <Input
                                placeholder="e.g., Calculus I"
                                value={course.name}
                                onChange={(e) =>
                                  updateCourse(
                                    course.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>Institution (if transfer)</Label>
                              <Input
                                placeholder="e.g., Previous University"
                                value={course.institutionName || ""}
                                onChange={(e) =>
                                  updateCourse(
                                    course.id,
                                    "institutionName",
                                    e.target.value
                                  )
                                }
                                disabled={!course.isTransfer}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <Label>Current Credits</Label>
                              <Input
                                type="number"
                                min="1"
                                max="6"
                                value={course.credits}
                                onChange={(e) =>
                                  updateCourse(
                                    course.id,
                                    "credits",
                                    Number.parseInt(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>Original Credits</Label>
                              <Input
                                type="number"
                                min="1"
                                max="6"
                                value={course.originalCredits || course.credits}
                                onChange={(e) =>
                                  updateCourse(
                                    course.id,
                                    "originalCredits",
                                    Number.parseInt(e.target.value) || 0
                                  )
                                }
                                disabled={!course.isTransfer}
                              />
                            </div>
                            <div>
                              <Label>Credit System</Label>
                              <Select
                                value={course.creditSystem || "semester"}
                                onValueChange={(value) =>
                                  updateCourse(course.id, "creditSystem", value)
                                }
                                disabled={!course.isTransfer}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="semester">
                                    Semester
                                  </SelectItem>
                                  <SelectItem value="quarter">
                                    Quarter
                                  </SelectItem>
                                  <SelectItem value="trimester">
                                    Trimester
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Grade</Label>
                              <Select
                                value={course.grade}
                                onValueChange={(value) =>
                                  updateCourse(course.id, "grade", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(selectedScale.grades).map(
                                    (grade) => (
                                      <SelectItem key={grade} value={grade}>
                                        {grade} ({selectedScale.grades[grade]})
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label>Course Type</Label>
                              <Select
                                value={course.courseType || "core"}
                                onValueChange={(value) =>
                                  updateCourse(course.id, "courseType", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="core">
                                    Core Academic
                                  </SelectItem>
                                  <SelectItem value="elective">
                                    Elective
                                  </SelectItem>
                                  <SelectItem value="honors">Honors</SelectItem>
                                  <SelectItem value="ap">
                                    AP/Advanced
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Semester</Label>
                              <Input
                                placeholder="e.g., Fall 2024"
                                value={course.semester}
                                onChange={(e) =>
                                  updateCourse(
                                    course.id,
                                    "semester",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>Rigor Rating (1-5)</Label>
                              <Input
                                type="number"
                                min="1"
                                max="5"
                                value={course.rigorRating || 3}
                                onChange={(e) =>
                                  updateCourse(
                                    course.id,
                                    "rigorRating",
                                    Number.parseInt(e.target.value) || 3
                                  )
                                }
                                disabled={!course.isTransfer}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={addCourse}
                      variant="outline"
                      className="w-full bg-transparent"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Course
                    </Button>
                  </TabsContent>
                  <TabsContent value="transcript" className="space-y-4">
                    <TranscriptTest />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Grading Scale Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Grading Scale</CardTitle>
                <CardDescription>
                  Select the appropriate grading scale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedScale.name}
                  onValueChange={(value) => {
                    const scale = gradingScales.find((s) => s.name === value);
                    if (scale) setSelectedScale(scale);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gradingScales.map((scale) => (
                      <SelectItem key={scale.name} value={scale.name}>
                        {scale.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="mt-4 space-y-2">
                  <h4 className="font-medium text-sm">Grade Values:</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {Object.entries(selectedScale.grades).map(
                      ([grade, value]) => (
                        <div key={grade} className="flex justify-between">
                          <span>{grade}</span>
                          <span>{value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Validation Errors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-red-600">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Institutional Settings */}
            <InstitutionalSettings
              settings={institutionalSettings}
              onSettingsChange={setInstitutionalSettings}
            />

            <InstitutionDatabase />

            {/* Calculate GPA */}
          </div>
        </div>
      </main>
    </div>
  );
}
