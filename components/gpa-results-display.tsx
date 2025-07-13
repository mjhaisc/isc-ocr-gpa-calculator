"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap,
  School,
  TrendingUp,
  Download,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useState } from "react";

interface GPAResultsProps {
  results: {
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
  } | null;
  studentName: string;
  gradingScale: string;
}

export function GPAResultsDisplay({
  results,
  studentName,
  gradingScale,
}: GPAResultsProps) {
  if (!results) return null;

  const { institutional, transfer, cumulative, breakdown, insights, warnings } =
    results;
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  const handleExportReport = async () => {
    setIsDownloadingReport(true);
    try {
      const body = {
        data: {
          results,
          studentName,
          gradingScale,
        },
      };

      const response = await fetch("/api/export-report/route.ts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Export API call failed");

      const fileBlob = await response.blob();
      const url = window.URL.createObjectURL(fileBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "Detailed_Report.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setIsDownloadingReport(false);
      console.log("✅ Detailed report downloaded successfully");
    } catch (error) {
      console.error("❌ Failed to export detailed report:", error);
      alert("Failed to export detailed report. Please try again.");
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Main GPA Display */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5" />
            GPA Calculation Results
          </CardTitle>
          {studentName && (
            <CardDescription>Student: {studentName}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cumulative GPA */}
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600">
                {cumulative?.toFixed(2) || "N/A"}
              </div>
              <div className="text-sm text-gray-600">Cumulative GPA</div>
              <div className="text-xs text-gray-500">{gradingScale}</div>
            </div>

            {/* Institutional GPA */}
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-green-600">
                {institutional?.toFixed(2) || "N/A"}
              </div>
              <div className="text-sm text-gray-600">Institutional GPA</div>
              <div className="text-xs text-gray-500">Current Institution</div>
            </div>

            {/* Transfer GPA */}
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-purple-600">
                {transfer?.toFixed(2) || "N/A"}
              </div>
              <div className="text-sm text-gray-600">Transfer GPA</div>
              <div className="text-xs text-gray-500">Previous Institutions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <School className="mr-2 h-5 w-5" />
            Credit Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold">
                {breakdown.totalCredits}
              </div>
              <div className="text-sm text-gray-600">Total Credits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold">
                {breakdown.institutionalCredits}
              </div>
              <div className="text-sm text-gray-600">Institutional</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold">
                {breakdown.transferCredits}
              </div>
              <div className="text-sm text-gray-600">Transfer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold">
                {breakdown.qualityPoints.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Quality Points</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Institutional Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Credits:</span>
                  <span>{breakdown.institutionalCredits}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality Points:</span>
                  <span>{breakdown.institutionalQualityPoints.toFixed(1)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>GPA:</span>
                  <span>{institutional?.toFixed(2) || "N/A"}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Transfer Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Credits:</span>
                  <span>{breakdown.transferCredits}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality Points:</span>
                  <span>{breakdown.transferQualityPoints.toFixed(1)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>GPA:</span>
                  <span>{transfer?.toFixed(2) || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Transfer Considerations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {warnings.map((warning, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span className="text-orange-800 text-sm">{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Academic Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700 text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Export Options */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              disabled={isDownloadingReport}
            >
              {isDownloadingReport ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Detailed Report
                </>
              )}
            </Button>
            {/* <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Transfer Credit Summary
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              GPA Verification Letter
            </Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
