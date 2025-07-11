"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Calculator, Upload, FileText, HelpCircle, Video, MessageCircle, Globe, Scan } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function Help() {
  const tutorials = [
    {
      title: "Getting Started with GPA Calculator",
      description: "Learn the basics of using the GPA calculation system",
      duration: "5 min",
      icon: Calculator,
      topics: ["Login and navigation", "Dashboard overview", "Basic calculations"],
    },
    {
      title: "Manual GPA Entry",
      description: "Step-by-step guide for entering course data manually",
      duration: "8 min",
      icon: BookOpen,
      topics: ["Adding courses", "Selecting grades", "Credit hours", "Semester tracking"],
    },
    {
      title: "Batch CSV Upload",
      description: "How to process multiple students using CSV files",
      duration: "10 min",
      icon: Upload,
      topics: ["CSV format requirements", "Data validation", "Bulk processing", "Error handling"],
    },
    {
      title: "Transcript OCR Processing",
      description: "Upload and process transcripts from global institutions",
      duration: "12 min",
      icon: Scan,
      topics: ["File upload", "OCR processing", "Institution recognition", "Grade conversion"],
    },
    {
      title: "International GPA Conversion",
      description: "Convert GPAs from global grading systems",
      duration: "15 min",
      icon: Globe,
      topics: ["Grading scale conversion", "Rigor adjustments", "Institution database", "Quality factors"],
    },
    {
      title: "Reports and Analytics",
      description: "Generate and export comprehensive GPA reports",
      duration: "7 min",
      icon: FileText,
      topics: ["Filtering data", "Export formats", "Analytics dashboard", "Custom reports"],
    },
  ]

  const faqs = [
    {
      question: "What grading scales are supported?",
      answer:
        "The system supports 4.0 scale (standard), 5.0 scale (weighted), 10-point CGPA (Indian system), percentage-based grading, and letter grade systems from various countries.",
    },
    {
      question: "How does transcript OCR work?",
      answer:
        "Our AI-powered OCR system can read PDF and image files of transcripts from global institutions. It extracts course information, grades, and credits, then applies institution-specific conversions.",
    },
    {
      question: "Which institutions are supported for transcript processing?",
      answer:
        "We support transcripts from IITs, NITs, BITS, and other Indian institutions, as well as major international universities like MIT, Stanford, Cambridge, Oxford, and many others.",
    },
    {
      question: "How are rigor adjustments calculated?",
      answer:
        "Rigor adjustments are based on institutional reputation, selectivity, academic standards, and international recognition. Each institution has a rigor rating from 1-5 that affects GPA conversions.",
    },
    {
      question: "Can I process transcripts in different languages?",
      answer:
        "Currently, the system works best with English transcripts. For transcripts in other languages, we recommend providing an official English translation.",
    },
    {
      question: "How accurate is the OCR processing?",
      answer:
        "OCR accuracy typically ranges from 85-95% depending on document quality. The system provides confidence scores and allows manual verification of extracted data.",
    },
    {
      question: "What file formats are supported for transcript upload?",
      answer:
        "We support PDF, JPG, PNG, and TIFF formats. PDF files generally provide the best OCR accuracy. Maximum file size is 10MB.",
    },
    {
      question: "How are international grades converted to 4.0 scale?",
      answer:
        "Conversions use institution-specific factors, considering grading scale differences, academic rigor, and international standards. The AI system applies contextual adjustments for accurate conversions.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-600 mt-2">
            Tutorials, guides, and frequently asked questions for global GPA calculations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Help */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="mr-2 h-5 w-5" />
                Quick Help
              </CardTitle>
              <CardDescription>Get immediate assistance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Video className="mr-2 h-4 w-4" />
                Watch Video Tutorials
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="mr-2 h-4 w-4" />
                Download User Manual
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Globe className="mr-2 h-4 w-4" />
                Institution Database
              </Button>
            </CardContent>
          </Card>

          {/* Tutorials */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Interactive Tutorials</CardTitle>
              <CardDescription>Step-by-step guides to master the GPA calculator</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorials.map((tutorial, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <tutorial.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{tutorial.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{tutorial.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="secondary">{tutorial.duration}</Badge>
                          <Button size="sm" variant="ghost">
                            Start →
                          </Button>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Topics: {tutorial.topics.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Find answers to common questions about the GPA calculator and transcript processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* System Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Requirements</CardTitle>
              <CardDescription>Technical specifications and compatibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium">Supported Browsers</h4>
                <p className="text-sm text-gray-600">Chrome 90+, Firefox 88+, Safari 14+, Edge 90+</p>
              </div>
              <div>
                <h4 className="font-medium">File Formats</h4>
                <p className="text-sm text-gray-600">PDF, JPG, PNG, TIFF (max 10MB), CSV, Excel</p>
              </div>
              <div>
                <h4 className="font-medium">Supported Institutions</h4>
                <p className="text-sm text-gray-600">
                  IITs, NITs, BITS, MIT, Stanford, Cambridge, Oxford, and 500+ more
                </p>
              </div>
              <div>
                <h4 className="font-medium">Languages</h4>
                <p className="text-sm text-gray-600">English transcripts (translations accepted)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
              <CardDescription>Tips for optimal transcript processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium">Document Quality</h4>
                <p className="text-sm text-gray-600">Use high-resolution scans (300 DPI) for best OCR accuracy</p>
              </div>
              <div>
                <h4 className="font-medium">File Preparation</h4>
                <p className="text-sm text-gray-600">Ensure text is clear and not skewed; PDF format preferred</p>
              </div>
              <div>
                <h4 className="font-medium">Verification</h4>
                <p className="text-sm text-gray-600">Always review extracted data before final GPA calculation</p>
              </div>
              <div>
                <h4 className="font-medium">Institution Selection</h4>
                <p className="text-sm text-gray-600">Select the correct institution for accurate rigor adjustments</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
