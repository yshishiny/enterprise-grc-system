"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Crown } from "lucide-react"
import departmentMappings from "@/config/department_mappings.json"

export default function BODPage() {
  const dept = (departmentMappings as any).departments.find((d: any) => d.code === "BOD")

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <Link href="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button></Link>
      
      <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-white">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{dept.name}</CardTitle>
              <CardDescription className="mt-2 text-base">{dept.description}</CardDescription>
            </div>
            <Badge className="bg-amber-600 text-lg px-4 py-2">{dept.code}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-4 mt-6">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Completion</p>
              <p className="text-2xl font-bold text-amber-600">{dept.completionPct}%</p>
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
          <CardTitle>Board Governance Documentation</CardTitle>
          <CardDescription>Board policies, charters, and strategic governance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border">
              <CardHeader className="pb-3"><CardTitle className="text-base">Governance Policies</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Board Charter</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Corporate Governance Policy</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Board Committees Policy</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Conflict of Interest Policy</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="border">
              <CardHeader className="pb-3"><CardTitle className="text-base">Board Procedures</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Board Meeting Procedure</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Decision Making Process</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Strategic Planning Process</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
