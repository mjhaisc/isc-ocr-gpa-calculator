"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Search, FileText, User, GraduationCap, TrendingUp, BarChart3 } from "lucide-react"
import { Navigation } from "@/components/navigation"

interface StudentRecord {
  id: string
  name: string
  gpa: number
  scale: string
  totalCredits: number
  semester: string
  calculatedDate: string
  status: "completed" | "pending" | "reviewed"
}

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterScale, setFilterScale] = useState("all")
  const [filterSemester, setFilterSemester] = useState("all")

  const [studentRecords] = useState<StudentRecord[]>([
    {
      id: "1",
      name: "John Smith",
      gpa: 3.85,
      scale: "4.0",
      totalCredits: 120,
      semester: "Fall 2024",
      calculatedDate: "2024-01-15",
      status: "completed",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      gpa: 4.2,
      scale: "5.0",
      totalCredits: 115,
      semester: "Fall 2024",
      calculatedDate: "2024-01-14",
      status: "completed",
    },
    {
      id: "3",
      name: "Mike Davis",
      gpa: 3.67,
      scale: "4.0",
      totalCredits: 98,
      semester: "Spring 2024",
      calculatedDate: "2024-01-14",
      status: "pending",
    },
    {
      id: "4",
      name: "Emily Chen",
      gpa: 3.92,
      scale: "4.0",
      totalCredits: 105,
      semester: "Fall 2024",
      calculatedDate: "2024-01-13",
      status: "completed",
    },
    {
      id: "5",
      name: "David Wilson",
      gpa: 3.45,
      scale: "4.0",
      totalCredits: 87,
      semester: "Spring 2024",
      calculatedDate: "2024-01-12",
      status: "reviewed",
    },
    {
      id: "6",
      name: "Lisa Anderson",
      gpa: 4.1,
      scale: "5.0",
      totalCredits: 110,
      semester: "Fall 2024",
      calculatedDate: "2024-01-11",
      status: "completed",
    },
  ])

  const filteredRecords = studentRecords.filter((record) => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesScale = filterScale === "all" || record.scale === filterScale
    const matchesSemester = filterSemester === "all" || record.semester === filterSemester
    return matchesSearch && matchesScale && matchesSemester
  })

  const stats = {
    totalStudents: studentRecords.length,
    averageGPA:
      Math.round((studentRecords.reduce((sum, record) => sum + record.gpa, 0) / studentRecords.length) * 100) / 100,
    completedCalculations: studentRecords.filter((r) => r.status === "completed").length,
    pendingReview: studentRecords.filter((r) => r.status === "pending").length,
  }

  const exportReport = (format: "csv" | "pdf" | "excel") => {
    // Simulate export functionality
    console.log(`Exporting ${filteredRecords.length} records as ${format.toUpperCase()}`)
    alert(`Exporting ${filteredRecords.length} records as ${format.toUpperCase()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">View, filter, and export GPA calculation reports.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average GPA</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageGPA}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedCalculations}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Student GPA Records</CardTitle>
                <CardDescription>Manage and export student GPA calculations</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => exportReport("csv")} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button onClick={() => exportReport("excel")} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button onClick={() => exportReport("pdf")} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="search">Search Students</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by student name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="scale-filter">Grading Scale</Label>
                <Select value={filterScale} onValueChange={setFilterScale}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scales</SelectItem>
                    <SelectItem value="4.0">4.0 Scale</SelectItem>
                    <SelectItem value="5.0">5.0 Scale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="semester-filter">Semester</Label>
                <Select value={filterSemester} onValueChange={setFilterSemester}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                    <SelectItem value="Spring 2024">Spring 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">GPA</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Scale</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Credits</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Semester</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{record.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-lg">{record.gpa}</span>
                      </td>
                      <td className="py-3 px-4">{record.scale}</td>
                      <td className="py-3 px-4">{record.totalCredits}</td>
                      <td className="py-3 px-4">{record.semester}</td>
                      <td className="py-3 px-4 text-gray-600">{record.calculatedDate}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            record.status === "completed"
                              ? "default"
                              : record.status === "pending"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {record.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">No records found matching your criteria.</div>
            )}

            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredRecords.length} of {studentRecords.length} records
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
