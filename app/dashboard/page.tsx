"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  Upload,
  FileText,
  Users,
  TrendingUp,
  Download,
  Plus,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { getLocalStorageCount, calculatePercentageChange } from "@/lib/utils";

type CalculationResult = {
  id: string;
  student: string;
  gpa: number | null;
  scale: string;
  credits: number;
  semester: string;
  date: string;
  status: string;
};

const buildStats = () => {
  // ✅ Current counts
  const transferGpaCount = getLocalStorageCount("transferGPA");
  const batchUploadsCount = getLocalStorageCount("batchUploads");
  const transcriptProcessCount = getLocalStorageCount("transcriptProcess");
  const reportGeneratedCount = getLocalStorageCount("reportGenerated");

  // ✅ Previous counts (for % change)
  const transferGpaPrev = getLocalStorageCount("transferGPA_prev");
  const batchUploadsPrev = getLocalStorageCount("batchUploads_prev");
  const transcriptProcessPrev = getLocalStorageCount("transcriptProcess_prev");
  const reportGeneratedPrev = getLocalStorageCount("reportGenerated_prev");

  // ✅ Calculations
  const totalCalculations =
    transferGpaCount + batchUploadsCount + transcriptProcessCount;
  const totalCalculationsPrev =
    transferGpaPrev + batchUploadsPrev + transcriptProcessPrev;

  const studentsProcessed = totalCalculations;
  const studentsProcessedPrev = totalCalculationsPrev;

  // ✅ Build stats array with % change logic
  return [
    {
      title: "Total Calculations",
      value: totalCalculations.toLocaleString(),
      icon: Calculator,
      change: calculatePercentageChange(
        totalCalculations,
        totalCalculationsPrev
      ),
    },
    {
      title: "Students Processed",
      value: studentsProcessed.toLocaleString(),
      icon: Users,
      change: calculatePercentageChange(
        studentsProcessed,
        studentsProcessedPrev
      ),
    },
    {
      title: "Batch Uploads",
      value: batchUploadsCount.toLocaleString(),
      icon: Upload,
      change: calculatePercentageChange(batchUploadsCount, batchUploadsPrev),
    },
    {
      title: "Reports Generated",
      value: reportGeneratedCount.toLocaleString(),
      icon: FileText,
      change: calculatePercentageChange(
        reportGeneratedCount,
        reportGeneratedPrev
      ),
    },
  ];
};

export default function Dashboard() {
  const [recentCalculations, setRecentCalculations] = useState<
    CalculationResult[]
  >([]);

  useEffect(() => {
    const loadResults = () => {
      const resultsString = localStorage.getItem("results");
      if (!resultsString) return;

      const resultsArray = JSON.parse(resultsString) as any[];

      const mappedResults: CalculationResult[] = resultsArray.map(
        (r, index) => ({
          id: r.id || `calc-${index + 1}`,
          student: r.Student || "Unknown",
          gpa: r.GPA ?? null,
          scale: r.Scale || "N/A",
          credits: r.Credits ?? 0,
          semester: r.Semester || "N/A",
          date: r.Date || new Date().toISOString().split("T")[0],
          status: r.Status || "completed",
        })
      );

      setRecentCalculations(mappedResults);
    };

    loadResults();
  }, []);

  const stats = buildStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's an overview of your GPA calculations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{stat.change}</span>
                  <span className="text-sm text-gray-500 ml-1">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Start a new calculation or upload data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/calculator" className="block">
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New GPA Calculation
                </Button>
              </Link>
              <Link href="/calculator?mode=batch" className="block">
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Batch Upload CSV
                </Button>
              </Link>
              <Link href="/reports" className="block">
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Calculations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Calculations</CardTitle>
              <CardDescription>
                Latest GPA calculations and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCalculations.map((calc) => (
                  <div
                    key={calc.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {calc.student}
                        </p>
                        <p className="text-sm text-gray-500">
                          GPA: {calc.gpa} ({calc.scale} scale)
                        </p>
                        <p className="text-sm text-gray-500">
                          Credits: {calc.credits}, Semester: {calc.semester}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={
                          calc.status === "completed" ? "default" : "secondary"
                        }
                      >
                        {calc.status === "completed" ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <Clock className="mr-1 h-3 w-3" />
                        )}
                        {calc.status}
                      </Badge>
                      <span className="text-sm text-gray-500">{calc.date}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/reports">
                  <Button variant="outline" className="w-full bg-transparent">
                    View All Calculations
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
