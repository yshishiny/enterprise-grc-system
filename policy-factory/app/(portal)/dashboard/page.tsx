"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Building2, FileText, ShieldCheck, TrendingUp, ArrowRight,
  CheckCircle2, AlertCircle, Activity, ClipboardCheck, Sparkles,
  RefreshCw, Eye, ExternalLink
} from "lucide-react"

import { FintechPulse } from "@/components/dashboard/FintechPulse"
import { ComplianceHeatmap } from "@/components/dashboard/ComplianceHeatmap"

interface DeptMetric {
  code: string
  totalPolicies: number
  completedPolicies: number
  totalProcedures: number
  completedProcedures: number
  completionPct: number
  approved: number
  draft: number
  review: number
  enhancement: number
  frameworks: string[]
  documents: any[]
}

interface FrameworkMetric {
  code: string
  name: string
  version: string
  description: string
  totalControls: number
  implementedControls: number
  coveragePct: number
  totalDocs: number
  approvedDocs: number
  draftDocs: number
  maturityLevel: number
}

interface RegistryData {
  success: boolean
  lastUpdated: string
  overall: {
    totalDocuments: number
    totalApproved: number
    totalDraft: number
    totalPolicies: number
    completedPolicies: number
    policyCompletionPct: number
    totalProcedures: number
    completedProcedures: number
    procedureCompletionPct: number
    overallCompletionPct: number
    frameworkCompliancePct: number
  }
  departments: DeptMetric[]
  frameworks: FrameworkMetric[]
  missingDocuments: any[]
  completionScoring?: {
    totalRequired: number
    present: number
    coveragePct: number
    approvalPct: number
    mappingPct: number
    evidenceReadinessPct: number
    missingCount: number
    complianceReadinessPct: number
  }
}

const deptConfig: Record<string, { name: string; icon: string }> = {
  IT:    { name: "Information Technology", icon: "💻" },
  HR:    { name: "Human Resources",       icon: "👥" },
  OPS:   { name: "Operations",            icon: "⚙️" },
  COM:   { name: "Commercial",            icon: "💼" },
  RISK:  { name: "Risk Management",       icon: "⚠️" },
  AUDIT: { name: "Internal Audit",        icon: "🔍" },
  BOD:   { name: "Board of Directors",    icon: "🏛️" },
  ADMIN: { name: "Administration",        icon: "📋" },
  FIN:   { name: "Finance",               icon: "💰" },
  GEN:   { name: "General / Corporate",   icon: "🏢" }
}

export default function DashboardPage() {
  const [data, setData] = useState<RegistryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/registry")
      .then(r => r.json())
      .then(d => { if (d.success) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const dateStr = now.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })

  const o = data?.overall
  const depts = data?.departments || []
  const fws = data?.frameworks || []
  const missing = data?.missingDocuments || []

  // Ensure ALL departments are shown, even if empty
  const allDeptCodes = ["IT", "HR", "OPS", "COM", "RISK", "AUDIT", "BOD", "ADMIN", "FIN", "GEN"]
  const deptCards = allDeptCodes.map(code => {
    const real = depts.find(d => d.code === code)
    const cfg = deptConfig[code]
    return {
      code, name: cfg?.name || code, icon: cfg?.icon || "📁",
      totalPolicies: real?.totalPolicies || 0, completedPolicies: real?.completedPolicies || 0,
      totalProcedures: real?.totalProcedures || 0, completedProcedures: real?.completedProcedures || 0,
      completionPct: real?.completionPct || 0, approved: real?.approved || 0,
      draft: real?.draft || 0, review: real?.review || 0, enhancement: real?.enhancement || 0,
      frameworks: real?.frameworks || [],
      total: (real?.totalPolicies || 0) + (real?.totalProcedures || 0) // Used for sorting, not hiding
    }
  })

  // ... (rest of component) ...

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Executive Compliance Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time Fintech Compliance Status • PCI-DSS • CBE • FRA
            {data?.lastUpdated && <span className="ml-2 text-[10px]">• Last sync: {new Date(data.lastUpdated).toLocaleString()}</span>}
          </p>
        </div>
        <div className="flex gap-2">
            <Link href="/audit">
              <Button variant="outline" size="sm" className="gap-1">
                <Eye className="h-4 w-4" /> Audit Registry
              </Button>
            </Link>
          <Badge variant="outline" className="bg-white px-3 py-1 flex items-center gap-2">{dateStr} {timeStr}</Badge>
        </div>
      </div>
      {/* ========== FINTECH PULSE ========== */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-slate-700" />
          <h2 className="text-xl font-semibold text-slate-800">Fintech Compliance Pulse</h2>
        </div>
        <FintechPulse frameworks={fws} />
      </section>

      {/* ========== HEATMAP & ACTIONS ========== */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ComplianceHeatmap departments={depts} missingDocs={missing} />
        
        <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="shadow-sm border-none bg-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Health</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{data?.completionScoring?.coveragePct || 0}%</div>
                            <p className="text-xs text-muted-foreground">Doc Coverage</p>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-shari-purple-600">{data?.completionScoring?.complianceReadinessPct || 0}%</div>
                            <p className="text-xs text-muted-foreground">Readiness Score</p>
                        </div>
                    </div>
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Policies Approved</span>
                                <span className="font-medium">{o?.completedPolicies}/{o?.totalPolicies}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${o?.policyCompletionPct}%` }} />
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Procedures Approved</span>
                                <span className="font-medium">{o?.completedProcedures}/{o?.totalProcedures}</span>
                            </div>
                         <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${o?.procedureCompletionPct}%` }} />
                        </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
             <Card className="shadow-sm border-none bg-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Link href="/audit"><Button variant="default" className="w-full justify-start gap-2 bg-slate-900 h-9 text-xs"><Eye className="h-3.5 w-3.5" /> View Registry</Button></Link>
                    <Link href="/request"><Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs bg-white"><Sparkles className="h-3.5 w-3.5" /> Request Policy</Button></Link>
                    <Link href="/analysis"><Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs bg-white"><AlertCircle className="h-3.5 w-3.5" /> View Gaps</Button></Link>
                </CardContent>
            </Card>
        </div>
      </section>

      {/* ========== DEPARTMENT SNAPSHOTS ========== */}
      <section>
        <div className="flex items-center gap-2 mb-4">
           <Building2 className="h-5 w-5 text-slate-700" />
           <h2 className="text-xl font-semibold text-slate-800">Department Snapshots</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {deptCards.map((dept) => {
            // REMOVED: if (dept.total === 0) return null 
            const allApproved = dept.total > 0 && dept.approved === dept.total
            
            return (
              <Link key={dept.code} href={`/departments/${dept.code.toLowerCase()}`}>
                <Card className={`shadow-sm border hover:shadow-md transition-all cursor-pointer group h-full ${allApproved ? "border-green-200 bg-green-50/30" : "bg-white"}`}>
                  <CardHeader className="pb-3 pt-4 px-4">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                             <span className="text-2xl">{dept.icon}</span>
                             <div>
                                <div className="font-semibold text-sm">{dept.name}</div>
                                <div className="text-[10px] text-muted-foreground">{dept.code} • {dept.total} Docs</div>
                             </div>
                        </div>
                        <Badge variant={allApproved ? "default" : "secondary"} className={`text-[10px] ${allApproved ? "bg-green-600" : ""}`}>{dept.completionPct}%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                     <div className="flex gap-1 flex-wrap mt-2">
                        {dept.frameworks.slice(0, 3).map(f => (
                            <Badge key={f} variant="outline" className="text-[9px] h-4 px-1 bg-slate-50 border-slate-200 text-slate-600">{f}</Badge>
                        ))}
                        {dept.frameworks.length > 3 && <Badge variant="outline" className="text-[9px] h-4 px-1 bg-slate-50 border-slate-200 text-slate-600">+{dept.frameworks.length - 3}</Badge>}
                     </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
