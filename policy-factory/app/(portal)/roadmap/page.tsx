"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Target, AlertTriangle, CheckCircle2, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import gapAnalysis from "@/config/gap_analysis.json"

export default function RoadmapPage() {
  const gaps = (gapAnalysis as any).gapAnalysis

  const quarters = [
    {
      id: "Q1-2026",
      name: "Q1 2026",
      period: "Jan - Mar 2026",
      focus: "Critical Compliance & Security",
      documents: gaps.inProgressDocuments.filter((d: any) => 
        d.expectedCompletion <= "2026-03-31"
      ).concat(
        gaps.priorityGaps
          .filter((g: any) => g.priority.startsWith("P0"))
          .flatMap((g: any) => g.missing.filter((m: any) => m.deadline === "Q1 2026"))
      )
    },
    {
      id: "Q2-2026",
      name: "Q2 2026",
      period: "Apr - Jun 2026",
      focus: "High Priority Governance",
      documents: gaps.inProgressDocuments.filter((d: any) => 
        d.expectedCompletion > "2026-03-31" && d.expectedCompletion <= "2026-06-30"
      ).concat(
        gaps.priorityGaps
          .filter((g: any) => g.priority.startsWith("P1"))
          .flatMap((g: any) => g.missing.filter((m: any) => m.deadline === "Q2 2026"))
      )
    },
    {
      id: "Q3-2026",
      name: "Q3 2026",
      period: "Jul - Sep 2026",
      focus: "Medium Priority Operations",
      documents: gaps.inProgressDocuments.filter((d: any) => 
        d.expectedCompletion > "2026-06-30" && d.expectedCompletion <= "2026-09-30"
      ).concat(
        gaps.priorityGaps
          .filter((g: any) => g.priority.startsWith("P2"))
          .flatMap((g: any) => g.missing.filter((m: any) => m.deadline === "Q3 2026"))
      )
    },
    {
      id: "Q4-2026",
      name: "Q4 2026",
      period: "Oct - Dec 2026",
      focus: "Enhancements & Best Practices",
      documents: gaps.inProgressDocuments.filter((d: any) => 
        d.expectedCompletion > "2026-09-30"
      ).concat(
        gaps.priorityGaps
          .filter((g: any) => g.priority.startsWith("P3"))
          .flatMap((g: any) => g.missing.filter((m: any) => m.deadline === "Q4 2026"))
      )
    }
  ]

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">GRC Roadmap 2026</h1>
          <p className="text-muted-foreground mt-1">Strategic plan for completing governance documentation</p>
        </div>
        <Link href="/library">
          <Button variant="outline">
            View Document Library
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-none shadow-sm bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-base">Critical (P0)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {gaps.priorityGaps.filter((g: any) => g.priority.startsWith("P0")).reduce((sum: number, g: any) => sum + g.missing.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Due Q1 2026</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-base">High (P1)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {gaps.priorityGaps.filter((g: any) => g.priority.startsWith("P1")).reduce((sum: number, g: any) => sum + g.missing.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Due Q2 2026</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">In Progress</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{gaps.inProgressDocuments.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Currently drafting</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-base">Completed</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{gaps.summary.completed}</p>
            <p className="text-xs text-muted-foreground mt-1">{Math.round((gaps.summary.completed / gaps.summary.totalRequired) * 100)}% of total</p>
          </CardContent>
        </Card>
      </div>

      {/* Quarterly Roadmap */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>2026 Quarterly Plan</CardTitle>
              <CardDescription>Phased approach to document completion</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {quarters.map((quarter) => (
              <Card key={quarter.id} className="border-2 hover:border-blue-300 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-blue-600 text-lg px-4 py-1">{quarter.name}</Badge>
                        <CardTitle className="text-xl">{quarter.focus}</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">{quarter.period}</p>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {quarter.documents.length} docs
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {quarter.documents.length > 0 ? (
                    <div className="grid gap-2 md:grid-cols-2">
                      {quarter.documents.map((doc: any, idx: number) => {
                        const isInProgress = 'progress' in doc
                        const docName = doc.name || doc.document
                        const owner = doc.owner || 'Multiple'
                        
                        return (
                          <div 
                            key={idx} 
                            className={`p-3 rounded-lg border ${isInProgress ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-sm font-semibold">{docName}</p>
                              {isInProgress && (
                                <Badge className="bg-blue-600 text-xs">{doc.progress}%</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{owner}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No documents scheduled for this quarter</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle>Immediate Action Items</CardTitle>
          <CardDescription>Top priorities requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-white rounded-lg border-l-4 border-l-red-500">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-red-600">P0 - Critical</Badge>
                <p className="font-semibold">Complete FRA Law 227 Consumer Protection</p>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Required for full regulatory compliance with Egyptian FRA
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Compliance Team</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-red-600 font-medium">Due: Q1 2026</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border-l-4 border-l-red-500">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-red-600">P0 - Critical</Badge>
                <p className="font-semibold">Finalize Data Privacy Policy (GDPR)</p>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Essential for personal data protection and compliance
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">IT / Legal</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-red-600 font-medium">Due: Q1 2026</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border-l-4 border-l-red-500">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-red-600">P0 - Critical</Badge>
                <p className="font-semibold">Complete Disaster Recovery Plan</p>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Critical for business continuity and resilience
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">IT Department</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-red-600 font-medium">Due: Q1 2026</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
