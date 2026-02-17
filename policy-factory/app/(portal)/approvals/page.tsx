"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Users,
  Calendar,
  TrendingUp,
  Filter
} from "lucide-react"
import Link from "next/link"
import workflowConfig from "@/config/workflow_config.json"

export default function ApprovalsPage() {
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [stageFilter, setStageFilter] = useState<string>("all")

  const approvals = (workflowConfig as any).sampleApprovals
  const stages = (workflowConfig as any).workflowStages

  const filteredApprovals = approvals.filter((approval: any) => {
    const matchesPriority = priorityFilter === "all" || approval.priority === priorityFilter
    const matchesStage = stageFilter === "all" || approval.currentStage === stageFilter
    return matchesPriority && matchesStage
  })

  const pendingReview = approvals.filter((a: any) => a.currentStage === "review").length
  const pendingApproval = approvals.filter((a: any) => a.currentStage === "approval").length
  const inDraft = approvals.filter((a: any) => a.currentStage === "draft").length
  const published = approvals.filter((a: any) => a.currentStage === "published").length

  const getStageColor = (stage: string) => {
    const stageConfig = stages.find((s: any) => s.id === stage)
    return stageConfig?.color || "slate"
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case "draft": return <FileText className="h-4 w-4" />
      case "review": return <Clock className="h-4 w-4" />
      case "approval": return <AlertCircle className="h-4 w-4" />
      case "published": return <CheckCircle2 className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P0": return "bg-red-600"
      case "P1": return "bg-orange-600"
      case "P2": return "bg-yellow-600"
      case "P3": return "bg-slate-600"
      default: return "bg-slate-600"
    }
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Approval Workflow</h1>
          <p className="text-muted-foreground mt-1">Manage document approvals and track workflow status</p>
        </div>
        <Link href="/library">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Document Library
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-none shadow-sm bg-gradient-to-br from-slate-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-600" />
              <CardTitle className="text-base">Draft</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-600">{inDraft}</p>
            <p className="text-xs text-muted-foreground mt-1">Being authored</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">Under Review</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{pendingReview}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending review</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-base">Pending Approval</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{pendingApproval}</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting BOD</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-base">Published</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{published}</p>
            <p className="text-xs text-muted-foreground mt-1">Approved & active</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="pending">Pending Actions</TabsTrigger>
          <TabsTrigger value="all">All Approvals</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Pending Actions */}
        <TabsContent value="pending" className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Pending Reviews & Approvals</CardTitle>
                  <CardDescription>Documents requiring your action</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredApprovals
                .filter((a: any) => a.currentStage === "review" || a.currentStage === "approval")
                .map((approval: any) => (
                  <Card key={approval.id} className="border-2 hover:border-blue-300 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getPriorityColor(approval.priority)}>
                              {approval.priority}
                            </Badge>
                            <Badge variant="outline" className="font-mono text-xs">
                              {approval.documentCode}
                            </Badge>
                            <Badge 
                              className={`bg-${getStageColor(approval.currentStage)}-600`}
                            >
                              {getStageIcon(approval.currentStage)}
                              <span className="ml-1 capitalize">{approval.currentStage}</span>
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{approval.documentTitle}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{approval.category}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Submitted by:</span>
                          <span className="font-medium">{approval.submittedBy}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Due:</span>
                          <span className="font-medium text-orange-600">
                            {new Date(approval.dueDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>

                      {approval.history.length > 0 && (
                        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Latest Activity:</p>
                          <p className="text-sm">
                            <span className="font-medium">{approval.history[approval.history.length - 1].user}</span>
                            {" "}{approval.history[approval.history.length - 1].action.toLowerCase()}
                            {approval.history[approval.history.length - 1].comment && (
                              <span className="text-muted-foreground">
                                {" - "}{approval.history[approval.history.length - 1].comment}
                              </span>
                            )}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                          <Clock className="h-4 w-4 mr-2" />
                          Request Changes
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                          Reject
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Approvals */}
        <TabsContent value="all" className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>All Workflow Items</CardTitle>
              <CardDescription>Complete list of documents in workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredApprovals.map((approval: any) => (
                <Card key={approval.id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getPriorityColor(approval.priority)} variant="default">
                            {approval.priority}
                          </Badge>
                          <Badge variant="outline" className="font-mono text-xs">
                            {approval.documentCode}
                          </Badge>
                          <Badge 
                            className={`bg-${getStageColor(approval.currentStage)}-600`}
                          >
                            {getStageIcon(approval.currentStage)}
                            <span className="ml-1 capitalize">{approval.currentStage}</span>
                          </Badge>
                        </div>
                        <CardTitle className="text-base">{approval.documentTitle}</CardTitle>
                      </div>
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Approval History</CardTitle>
                  <CardDescription>Recently completed approvals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">No completed approvals yet</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
