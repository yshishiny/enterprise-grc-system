"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp } from "lucide-react"
import departmentMappings from "@/config/department_mappings.json"

export default function CommercialPage() {
  const dept = (departmentMappings as any).departments.find((d: any) => d.code === "COM")

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <Link href="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button></Link>
      
      <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{dept.name}</CardTitle>
              <CardDescription className="mt-2 text-base">{dept.description}</CardDescription>
            </div>
            <Badge className="bg-indigo-600 text-lg px-4 py-2">{dept.code}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-4 mt-6">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Completion</p>
              <p className="text-2xl font-bold text-indigo-600">{dept.completionPct}%</p>
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
          <CardTitle>Commercial & Marketing Documentation</CardTitle>
          <CardDescription>Sales, marketing, and customer relations policies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border">
              <CardHeader className="pb-3"><CardTitle className="text-base">Sales & Marketing</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Marketing Standards Policy</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Client Acquisition Policy</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Pricing Policy</span><Badge className="bg-orange-600 text-xs">Draft</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="border">
              <CardHeader className="pb-3"><CardTitle className="text-base">Customer Relations</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Customer Service Standards</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>CRM Procedures</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
                <div className="p-2 bg-slate-50 rounded flex justify-between">
                  <span>Client Feedback Process</span><Badge className="bg-green-600 text-xs">Approved</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
