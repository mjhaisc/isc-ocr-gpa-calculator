"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, User, GraduationCap, TrendingUp, BarChart3, Trash } from "lucide-react";
import { Navigation } from "@/components/navigation";

interface StudentRecord {
  id: string;
  name: string;
  gpa: number;
  scale: string;
  totalCredits: number;
  semester: string;
  calculatedDate: string;
  status: "completed" | "pending" | "reviewed";
}

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterScale, setFilterScale] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");
  const [studentRecords, setStudentRecords] = useState<StudentRecord[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    const loadData = () => {
      if (typeof window === "undefined") return;

      const batchUploads = parseInt(localStorage.getItem("batchUploads") || "0", 10);
      const transcriptProcess = parseInt(localStorage.getItem("transcriptProcess") || "0", 10);
      const transferGPA = parseInt(localStorage.getItem("transferGPA") || "0", 10);

      setTotalStudents(batchUploads + transcriptProcess + transferGPA);

      const resultsString = localStorage.getItem("results");
      let resultsArray = resultsString ? JSON.parse(resultsString) : [];

      // Add unique IDs if missing
      resultsArray = resultsArray.map((r: any, i: number) => {
        if (!r.id) {
          r.id = `rec-${Date.now()}-${i}`;
        }
        return r;
      });

      // Save back to localStorage with IDs assigned
      localStorage.setItem("results", JSON.stringify(resultsArray));

      // Map to StudentRecord[]
      const mapped: StudentRecord[] = resultsArray.map((r: any) => ({
        id: r.id,
        name: r.Student || "Unknown",
        gpa: r.GPA ?? 0,
        scale: r.Scale || "N/A",
        totalCredits: r.Credits ?? 0,
        semester: r.Semester || "N/A",
        calculatedDate: r.Date || new Date().toISOString().split("T")[0],
        status: (r.Status || "completed").toLowerCase(),
      }));

      setStudentRecords(mapped);
    };

    loadData();
  }, []);

  const filteredRecords = studentRecords.filter((record) => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScale = filterScale === "all" || record.scale === filterScale;
    const matchesSemester = filterSemester === "all" || record.semester === filterSemester;
    return matchesSearch && matchesScale && matchesSemester;
  });

  const completedCalculations = studentRecords.filter((r) => r.status === "completed").length;
  const pendingReview = studentRecords.filter((r) => r.status === "pending").length;

  const averageGPA =
    studentRecords.length > 0
      ? Math.round(
          (studentRecords.reduce((sum, record) => sum + record.gpa, 0) / studentRecords.length) * 100
        ) / 100
      : 0;

  const handleDelete = (id: string) => {
    if (typeof window === "undefined") return;

    const resultsString = localStorage.getItem("results");
    let resultsArray = resultsString ? JSON.parse(resultsString) : [];

    // Filter out deleted record by id
    resultsArray = resultsArray.filter((r: any) => r.id !== id);

    // Save updated array back to localStorage
    localStorage.setItem("results", JSON.stringify(resultsArray));

    // Update state to re-render table
    setStudentRecords((prev) => prev.filter((record) => record.id !== id));
  };

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
          <StatCard title="Total Students" value={totalStudents} icon={<User className="h-8 w-8 text-blue-600" />} />
          <StatCard title="Average GPA" value={averageGPA} icon={<GraduationCap className="h-8 w-8 text-green-600" />} />
          <StatCard title="Completed" value={completedCalculations} icon={<TrendingUp className="h-8 w-8 text-purple-600" />} />
          <StatCard title="Pending Review" value={pendingReview} icon={<BarChart3 className="h-8 w-8 text-orange-600" />} />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Student GPA Records</CardTitle>
                <CardDescription>Manage and export student GPA calculations</CardDescription>
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

              <FilterSelect label="Grading Scale" value={filterScale} onChange={setFilterScale} options={["4.0", "5.0"]} />
              <FilterSelect label="Semester" value={filterSemester} onChange={setFilterSemester} options={["Fall 2024", "Spring 2024"]} />
            </div>

            {/* Records Table */}
            <Table records={filteredRecords} onDelete={handleDelete} />

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
  );
}

function StatCard({ title, value, icon }: { title: string; value: any; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Table({
  records,
  onDelete,
}: {
  records: StudentRecord[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {["Student", "GPA", "Scale", "Credits", "Semester", "Date", "Status", "Actions"].map((h) => (
              <th key={h} className="text-left py-3 px-4 font-medium text-gray-900">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">{record.name}</span>
                </div>
              </td>
              <td className="py-3 px-4 font-semibold text-lg">{record.gpa}</td>
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
                <Button variant="ghost" size="sm" onClick={() => onDelete(record.id)}>
                  <Trash className="h-4 w-4 text-red-600" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
