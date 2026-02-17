"use client"

import { useState } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText,
  AlertCircle,
  ChevronRight
} from "lucide-react"

// Mock workflow data
const mockWorkflows = [
  {
    id: "wf-001",
    documentNo: "POL-GRC-001",
    documentTitle: "Information Security Policy",
    currentStage: "GRC Review",
    submittedBy: "Credit Head",
    submittedDate: "2026-02-14",
    priority: "high",
    daysOpen: 2
  },
  {
    id: "wf-002",
    documentNo: "POL-CRD-002",
    documentTitle: "Credit Risk Assessment Policy",
    currentStage: "Risk Review",
    submittedBy: "GRC Manager",
    submittedDate: "2026-02-13",
    priority: "medium",
    daysOpen: 3
  },
  {
    id: "wf-003",
    documentNo: "PROC-AML-001",
    documentTitle: "KYC Verification Procedure",
    currentStage: "AML Review",
    submittedBy: "Finance Head",
    submittedDate: "2026-02-12",
    priority: "high",
    daysOpen: 4
  },
  {
    id: "wf-004",
    documentNo: "POL-FIN-003",
    documentTitle: "Financial Controls Policy",
    currentStage: "Final Approval",
    submittedBy: "Risk Officer",
    submittedDate: "2026-02-10",
    priority: "low",
    daysOpen: 6
  },
]

const completedWorkflows = [
  {
    id: "wf-c-001",
    documentNo: "POL-OPS-001",
    documentTitle: "Operational Excellence Policy",
    action: "Approved",
    completedBy: "Yasser Admin",
    completedDate: "2026-02-15",
  },
  {
    id: "wf-c-002",
    documentNo: "POL-COM-002",
    documentTitle: "Data Protection Policy",
    action: "Rejected",
    completedBy: "GRC Manager",
    completedDate: "2026-02-14",
  },
]

export default function WorkflowPage() {
  const [selectedTab, setSelectedTab] = useState("pending")

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 focus:outline-none">Workflow Inbox</h1>
          <p className="text-muted-foreground mt-1">Review and approve policy documents awaiting your action.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-white px-3 py-1">
            {mockWorkflows.length} Pending Tasks
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockWorkflows.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-orange-600 font-medium">2 High Priority</span>
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">On track</span>
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-600 font-medium">&gt; 5 days</span>
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Review Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4d</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-blue-600 font-medium">Within SLA</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Table */}
      <Card className="border-none shadow-sm">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <CardHeader className="pb-3 border-b">
            <TabsList className="w-fit">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <TabsContent value="pending" className="m-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="w-[120px] font-semibold">Code</TableHead>
                    <TableHead className="font-semibold">Document</TableHead>
                    <TableHead className="font-semibold">Stage</TableHead>
                    <TableHead className="font-semibold">Submitted By</TableHead>
                    <TableHead className="font-semibold">Age</TableHead>
                    <TableHead className="w-[180px] text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockWorkflows.map((wf) => (
                    <TableRow key={wf.id} className="group hover:bg-blue-50/30 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-blue-700">
                        {wf.documentNo}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <div>
                            <div className="font-medium text-slate-700">{wf.documentTitle}</div>
                            <div className="text-xs text-muted-foreground">Submitted {wf.submittedDate}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal bg-blue-50 border-blue-200 text-blue-700">
                          {wf.currentStage}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{wf.submittedBy}</TableCell>
                      <TableCell>
                        <Badge 
                          className={cn(
                            "font-normal border-none shadow-none",
                            wf.daysOpen > 5 ? "bg-red-100 text-red-700" : 
                            wf.daysOpen > 3 ? "bg-orange-100 text-orange-700" : 
                            "bg-green-100 text-green-700"
                          )}
                        >
                          {wf.daysOpen}d
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8">
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                          <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </TabsContent>

          <TabsContent value="completed" className="m-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="w-[120px] font-semibold">Code</TableHead>
                    <TableHead className="font-semibold">Document</TableHead>
                    <TableHead className="font-semibold">Action</TableHead>
                    <TableHead className="font-semibold">Completed By</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedWorkflows.map((wf) => (
                    <TableRow key={wf.id} className="group hover:bg-slate-50 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-slate-600">
                        {wf.documentNo}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-700">{wf.documentTitle}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={cn(
                            "font-normal border-none shadow-none",
                            wf.action === "Approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}
                        >
                          {wf.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{wf.completedBy}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{wf.completedDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
