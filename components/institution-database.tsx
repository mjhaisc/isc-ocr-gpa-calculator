"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Search, Globe, Star } from "lucide-react"

interface Institution {
  id: string
  name: string
  country: string
  rigor: number
  type: string
  gradingSystem: string
  conversionFactor: number
  recognitionLevel: "High" | "Medium" | "Standard"
  specializations: string[]
}

const institutionDatabase: Institution[] = [
  {
    id: "iit-bombay",
    name: "Indian Institute of Technology Bombay",
    country: "India",
    rigor: 4.8,
    type: "Technical",
    gradingSystem: "10-point CGPA",
    conversionFactor: 0.4,
    recognitionLevel: "High",
    specializations: ["Engineering", "Technology", "Sciences"],
  },
  {
    id: "iit-delhi",
    name: "Indian Institute of Technology Delhi",
    country: "India",
    rigor: 4.8,
    type: "Technical",
    gradingSystem: "10-point CGPA",
    conversionFactor: 0.4,
    recognitionLevel: "High",
    specializations: ["Engineering", "Technology", "Management"],
  },
  {
    id: "iisc-bangalore",
    name: "Indian Institute of Science Bangalore",
    country: "India",
    rigor: 4.9,
    type: "Research",
    gradingSystem: "Letter grades (A-F)",
    conversionFactor: 1.0,
    recognitionLevel: "High",
    specializations: ["Sciences", "Engineering", "Research"],
  },
  {
    id: "nit-trichy",
    name: "National Institute of Technology Tiruchirappalli",
    country: "India",
    rigor: 4.2,
    type: "Technical",
    gradingSystem: "10-point CGPA",
    conversionFactor: 0.4,
    recognitionLevel: "High",
    specializations: ["Engineering", "Technology"],
  },
  {
    id: "bits-pilani",
    name: "Birla Institute of Technology and Science Pilani",
    country: "India",
    rigor: 4.3,
    type: "Technical",
    gradingSystem: "10-point CGPA",
    conversionFactor: 0.4,
    recognitionLevel: "High",
    specializations: ["Engineering", "Sciences", "Management"],
  },
  {
    id: "mit",
    name: "Massachusetts Institute of Technology",
    country: "USA",
    rigor: 4.9,
    type: "Technical",
    gradingSystem: "4.0 GPA",
    conversionFactor: 1.0,
    recognitionLevel: "High",
    specializations: ["Engineering", "Technology", "Sciences"],
  },
  {
    id: "cambridge",
    name: "University of Cambridge",
    country: "UK",
    rigor: 4.7,
    type: "Research",
    gradingSystem: "Class Honours",
    conversionFactor: 0.8,
    recognitionLevel: "High",
    specializations: ["Sciences", "Engineering", "Liberal Arts"],
  },
  {
    id: "tsinghua",
    name: "Tsinghua University",
    country: "China",
    rigor: 4.6,
    type: "Technical",
    gradingSystem: "100-point scale",
    conversionFactor: 0.04,
    recognitionLevel: "High",
    specializations: ["Engineering", "Technology", "Sciences"],
  },
]

export function InstitutionDatabase() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("all")

  const filteredInstitutions = institutionDatabase.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.country.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCountry = selectedCountry === "all" || inst.country === selectedCountry
    return matchesSearch && matchesCountry
  })

  const countries = [...new Set(institutionDatabase.map((inst) => inst.country))]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="mr-2 h-5 w-5" />
          Global Institution Database
        </CardTitle>
        <CardDescription>
          Comprehensive database of global institutions with rigor ratings and grading system conversions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Institutions</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by name or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <select
              id="country"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Institution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {filteredInstitutions.map((institution) => (
            <div key={institution.id} className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{institution.name}</h4>
                    <p className="text-xs text-gray-600">{institution.country}</p>
                  </div>
                  <Badge
                    variant={
                      institution.recognitionLevel === "High"
                        ? "default"
                        : institution.recognitionLevel === "Medium"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {institution.recognitionLevel}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <Label className="text-xs">Rigor Rating</Label>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="font-medium">{institution.rigor}/5.0</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Type</Label>
                    <p className="font-medium">{institution.type}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Grading System</Label>
                  <p className="text-xs font-medium">{institution.gradingSystem}</p>
                  <p className="text-xs text-gray-600">Conversion Factor: {institution.conversionFactor}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Specializations</Label>
                  <div className="flex flex-wrap gap-1">
                    {institution.specializations.map((spec, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInstitutions.length === 0 && (
          <div className="text-center py-8 text-gray-500">No institutions found matching your criteria.</div>
        )}

        <div className="text-sm text-gray-600 border-t pt-4">
          <p>
            <strong>Note:</strong> Rigor ratings are based on academic standards, selectivity, and international
            recognition. Conversion factors help standardize GPAs across different grading systems.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
