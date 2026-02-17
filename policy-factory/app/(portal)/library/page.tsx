"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  FileText, 
  Download, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3
} from "lucide-react"

import classification from "@/config/document_classification.json"
import gapAnalysis from "@/config/gap_analysis.json"

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

  const subjects = Object.entries((classification as any).documentClassification)
  const metrics = (classification as any).overallMetrics
  const gaps = (gapAnalysis as any).gapAnalysis

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Document Library</h1>
          <p className="text-muted-foreground mt-1">Professional governance document repository organized by subject</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Overall Metrics Card */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle>Library Overview</CardTitle>
          <CardDescription>Comprehensive document inventory across all governance areas</CardDescription>
          
          <div className="grid gap-4 md:grid-cols-5 mt-6">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Subject Areas</p>
              <p className="text-3xl font-bold text-blue-600">{metrics.totalSubjects}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Total Required</p>
              <p className="text-3xl font-bold text-slate-600">{metrics.totalDocumentsRequired}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{metrics.totalCompleted}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold text-orange-600">{metrics.totalInProgress}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Not Started</p>
                  <p className="text-3xl font-bold text-red-600">{metrics.totalNotStarted}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm font-bold text-blue-600">{metrics.overallCompletionPct}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${metrics.overallCompletionPct}%` }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="subjects" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="subjects">By Subject Area</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
          <TabsTrigger value="progress">In Progress</TabsTrigger>
        </TabsList>

        {/* By Subject Area */}
        <TabsContent value="subjects" className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>10 Professional Subject Areas</CardTitle>
                  <CardDescription>Documents organized by governance domain</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {subjects.map(([key, subject]: [string, any]) => {
                  const completionPct = Math.round((subject.completed / subject.totalRequired) * 100)
                  
                  return (
                    <Card key={key} className="border-2 hover:border-blue-300 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-blue-600">{subject.code}</Badge>
                              <CardTitle className="text-lg">{subject.name}</CardTitle>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{subject.description}</p>
                          </div>
                          <Badge variant="outline" className="text-lg px-3 py-1">
                            {completionPct}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="bg-green-50 rounded p-2 text-center">
                            <p className="text-xs text-muted-foreground">Done</p>
                            <p className="font-bold text-green-600">{subject.completed}</p>
                          </div>
                          <div className="bg-orange-50 rounded p-2 text-center">
                            <p className="text-xs text-muted-foreground">Progress</p>
                            <p className="font-bold text-orange-600">{subject.inProgress}</p>
                          </div>
                          <div className="bg-red-50 rounded p-2 text-center">
                            <p className="text-xs text-muted-foreground">Missing</p>
                            <p className="font-bold text-red-600">{subject.notStarted}</p>
                          </div>
                        </div>

                        <div className="border-t pt-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Subcategories:</p>
                          <div className="flex flex-wrap gap-1">
                            {subject.subcategories.slice(0, 4).map((sub: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {sub}
                              </Badge>
                            ))}
                            {subject.subcategories.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{subject.subcategories.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button variant="outline" size="sm" className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          View Documents ({subject.totalRequired})
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gap Analysis */}
        <TabsContent value="gaps" className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-orange-600" />
                <div>
                  <CardTitle>Gap Analysis & Priorities</CardTitle>
                  <CardDescription>Missing documents by priority level</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {gaps.priorityGaps.map((gap: any, idx: number) => {
                const priorityColor = gap.priority.startsWith('P0') ? 'red' : gap.priority.startsWith('P1') ? 'orange' : gap.priority.startsWith('P2') ? 'yellow' : 'slate'
                const bgColor = `bg-${priorityColor}-50`
                const borderColor = `border-${priorityColor}-200`
                const textColor = `text-${priorityColor}-700`
                
                return (
                  <Card key={idx} className={`border-2 ${borderColor} ${bgColor}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{gap.category}</CardTitle>
                        </div>
                        <Badge className={`${gap.priority.startsWith('P0') ? 'bg-red-600' : gap.priority.startsWith('P1') ? 'bg-orange-600' : gap.priority.startsWith('P2') ? 'bg-yellow-600' : 'bg-slate-600'}`}>
                          {gap.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {gap.missing.map((doc: any, docIdx: number) => (
                          <div key={docIdx} className="bg-white rounded-lg p-3 border">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-semibold text-sm">{doc.document}</p>
                              <Badge variant="outline" className="text-xs">
                                {doc.deadline}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{doc.reason}</p>
                            <p className="text-xs text-muted-foreground">Owner: <span className="font-medium">{doc.owner}</span></p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* In Progress */}
        <TabsContent value="progress" className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Documents In Progress</CardTitle>
                  <CardDescription>{gaps.inProgressDocuments.length} documents currently being developed</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {gaps.inProgressDocuments.map((doc: any, idx: number) => (
                  <Card key={idx} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-sm">{doc.name}</CardTitle>
                          <Badge variant="outline" className="mt-1 text-xs">{doc.category}</Badge>
                        </div>
                        <Badge className="bg-blue-600">{doc.progress}%</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${doc.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Expected: {new Date(doc.expectedCompletion).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
