"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ClipboardCheck } from "lucide-react"
import departmentMappings from "@/config/department_mappings.json"

export default function AuditPage() {
  const dept = (departmentMappings as any).departments.find((d: any) => d.code === "AUDIT")

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <Link href="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button></Link>
      
      <Card className="border-none shadow-sm bg-gradient-to-br from-cyan-50 to-white">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{dept.name}</CardTitle>
              <CardDescription className="mt-2 text-base">{dept.description}</CardDescription>
            </div>
            <Badge className="bg-cyan-600 text-lg px-4 py-2">{dept.code}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-4 mt-6">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Completion</p>
              <p className="text-2xl font-bold text-cyan-600">{dept.completionPct}%</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Maturity Level</p>
              <p className="text-2xl font-bold text-purple-600">{dept.maturityLevel.toFixed(1)}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Policies</p>
              <p className="text-2xl font-bold text-blue-600">{dept.completedPolicies}/{dept.totalPolicies}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Procedures</p>
              <p className="text-2xl font-bold text-green-600">{dept.completedProcedures}/{dept.totalProcedures}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Internal Audit Documentation</CardTitle>
          <CardDescription>Audit policies, procedures, and compliance monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border">
              <CardHeader className="pb-3"><CardTitle className="text-base">Audit Policies</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Internal Audit Charter</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Audit Independence Policy</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Compliance Monitoring Policy</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="border">
              <CardHeader className="pb-3"><CardTitle className="text-base">Audit Procedures</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Annual Audit Planning</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Audit Execution SOP</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Finding Reporting Process</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Follow-up Procedure</span><Badge className="bg-orange-600 text-xs">Draft</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
