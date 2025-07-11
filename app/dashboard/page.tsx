"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calculator, Upload, FileText, Users, TrendingUp, Download, Plus, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

export default function Dashboard() {
  const [recentCalculations] = useState([
    { id: 1, student: "John Smith", gpa: 3.85, scale: "4.0", date: "2024-01-15", status: "completed" },
    { id: 2, student: "Sarah Johnson", gpa: 4.2, scale: "5.0", date: "2024-01-14", status: "completed" },
    { id: 3, student: "Mike Davis", gpa: 3.67, scale: "4.0", date: "2024-01-14", status: "pending" },
    { id: 4, student: "Emily Chen", gpa: 3.92, scale: "4.0", date: "2024-01-13", status: "completed" },
  ])

  const stats = [
    { title: "Total Calculations", value: "1,247", icon: Calculator, change: "+12%" },
    { title: "Students Processed", value: "892", icon: Users, change: "+8%" },
    { title: "Batch Uploads", value: "34", icon: Upload, change: "+23%" },
    { title: "Reports Generated", value: "156", icon: FileText, change: "+15%" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your GPA calculations.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{stat.change}</span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
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
              <CardDescription>Start a new calculation or upload data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/calculator" className="block">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  New GPA Calculation
                </Button>
              </Link>
              <Link href="/calculator?mode=batch" className="block">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Batch Upload CSV
                </Button>
              </Link>
              <Link href="/reports" className="block">
                <Button className="w-full justify-start bg-transparent" variant="outline">
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
              <CardDescription>Latest GPA calculations and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCalculations.map((calc) => (
                  <div key={calc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{calc.student}</p>
                        <p className="text-sm text-gray-500">
                          GPA: {calc.gpa} ({calc.scale} scale)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={calc.status === "completed" ? "default" : "secondary"}>
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
  )
}
