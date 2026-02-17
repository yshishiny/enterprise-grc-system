"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Scale, CheckCircle2, XCircle, Clock, FileText } from "lucide-react"
import fraData from "@/config/framework_controls/fra.json"

export default function FRAPage() {
  const laws = (fraData as any).laws
  const metrics = (fraData as any).overallMetrics

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Header Card */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Scale className="h-8 w-8 text-indigo-600" />
                <div>
                  <CardTitle className="text-3xl">{fraData.fullName}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Egyptian Financial Regulatory Authority</p>
                </div>
              </div>
              <CardDescription className="text-base mt-2">{fraData.description}</CardDescription>
            </div>
            <Badge className="bg-indigo-600 hover:bg-indigo-700 text-xl px-6 py-3">
              {metrics.overallCompletionPct}%
            </Badge>
          </div>

          {/* Overall Metrics */}
          <div className="grid gap-4 md:grid-cols-4 mt-6">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Total Articles</p>
              <p className="text-3xl font-bold text-indigo-600">{metrics.totalArticles}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Compliant</p>
                  <p className="text-3xl font-bold text-green-600">{metrics.compliantArticles}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold text-orange-600">{metrics.inProgressArticles}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Not Started</p>
                  <p className="text-3xl font-bold text-red-600">{metrics.notStartedArticles}</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Laws Tabs */}
      <Tabs defaultValue="law139" className="w-full">
        <TabsList className="w-full justify-start">
          {laws.map((law: any) => (
            <TabsTrigger key={law.number} value={`law${law.number}`}>
              Law {law.number}/{law.year}
            </TabsTrigger>
          ))}
        </TabsList>

        {laws.map((law: any) => (
          <TabsContent key={law.number} value={`law${law.number}`} className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{law.title}</CardTitle>
                    <CardDescription className="mt-2">{law.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {law.completionPct}% Complete
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-3 mt-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Total Articles</p>
                    <p className="text-2xl font-bold">{law.totalArticles}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Compliant</p>
                    <p className="text-2xl font-bold text-green-600">{law.compliantArticles}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="w-full bg-slate-200 rounded-full h-3 mt-1">
                      <div 
                        className="bg-indigo-600 h-3 rounded-full"
                        style={{ width: `${law.completionPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <h3 className="font-semibold text-lg mb-4">Key Requirements</h3>
                <div className="space-y-3">
                  {law.keyRequirements.map((req: any, idx: number) => {
                    const statusColors = {
                      "Compliant": "bg-green-100 text-green-700 border-green-200",
                      "In Progress": "bg-orange-100 text-orange-700 border-orange-200",
                      "Not Started": "bg-red-100 text-red-700 border-red-200"
                    }
                    const statusColor = statusColors[req.status as keyof typeof statusColors] || "bg-slate-100"

                    return (
                      <Card key={idx} className={`border-2 ${statusColor}`}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{req.article}</CardTitle>
                              <p className="text-sm mt-1">{req.requirement}</p>
                            </div>
                            <Badge className={statusColor.split(' ')[0].replace('bg-', 'bg-opacity-100 ')}>
                              {req.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground font-medium">Evidence:</p>
                            {req.evidence.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {req.evidence.map((ev: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {ev}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">No evidence provided</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Action Buttons */}
      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-3">
            <Link href="/library">
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                View Related Policies
              </Button>
            </Link>
            <Button variant="outline" className="w-full">
              Download Compliance Report
            </Button>
            <Button variant="outline" className="w-full">
              Schedule FRA Audit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
