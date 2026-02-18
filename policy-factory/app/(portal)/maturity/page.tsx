"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck, AlertTriangle, TrendingUp, Target, FileWarning,
  CheckCircle2, XCircle, ArrowUpRight, BarChart3, Activity
} from "lucide-react"

interface CompletionScoring {
  totalRequired: number
  present: number
  coveragePct: number
  approvalPct: number
  mappingPct: number
  evidenceReadinessPct: number
  missingCount: number
}

interface DomainMaturity {
  id: string
  name: string
  isoTheme: string
  totalControls: number
  avgCurrentMaturity: number
  avgTargetMaturity: number
  gap: number
}

interface ControlMaturity {
  totalControls: number
  avgCurrentMaturity: number
  avgTargetMaturity: number
  gap: number
  domains: DomainMaturity[]
}

interface MissingDoc {
  docId: string
  title: string
  type: string
  domain: string
  department: string
  priority: string
  frameworks: string[]
}

export default function MaturityPage() {
  const [scoring, setScoring] = useState<CompletionScoring | null>(null)
  const [maturity, setMaturity] = useState<ControlMaturity | null>(null)
  const [missing, setMissing] = useState<MissingDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/registry")
      .then(r => r.json())
      .then(data => {
        setScoring(data.completionScoring)
        setMaturity(data.controlMaturity)
        setMissing(data.missingDocuments || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const metrics = [
    {
      label: "Coverage",
      value: scoring?.coveragePct ?? 0,
      desc: `${scoring?.present ?? 0} of ${scoring?.totalRequired ?? 0} required docs present`,
      icon: ShieldCheck,
      color: "hsl(142, 71%, 45%)"
    },
    {
      label: "Approval",
      value: scoring?.approvalPct ?? 0,
      desc: "Required docs with Approved status",
      icon: CheckCircle2,
      color: "hsl(217, 91%, 60%)"
    },
    {
      label: "Mapping",
      value: scoring?.mappingPct ?? 0,
      desc: "Required docs mapped to ≥1 control",
      icon: Target,
      color: "hsl(271, 91%, 65%)"
    },
    {
      label: "Evidence",
      value: scoring?.evidenceReadinessPct ?? 0,
      desc: "Control maturity vs. target",
      icon: BarChart3,
      color: "hsl(32, 95%, 55%)"
    }
  ]

  const priorityOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2 }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" />
          Maturity Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          4-metric scoring against the Required Document Register ({scoring?.totalRequired ?? 0} required documents)
        </p>
      </div>

      {/* 4-Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => (
          <Card key={m.label} className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: m.color }} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs uppercase tracking-wide font-medium">{m.label} %</CardDescription>
                <m.icon className="w-5 h-5" style={{ color: m.color }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold" style={{ color: m.color }}>{m.value}%</div>
              <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.value}%`, backgroundColor: m.color }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Control Maturity by Domain */}
      {maturity && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Control Maturity by Domain
                </CardTitle>
                <CardDescription>
                  {maturity.totalControls} controls | Avg: {maturity.avgCurrentMaturity} → {maturity.avgTargetMaturity} (gap: {maturity.gap})
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1">
                Overall: {maturity.avgCurrentMaturity}/5
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maturity.domains.map(d => {
                const pct = d.avgTargetMaturity > 0 ? Math.round((d.avgCurrentMaturity / d.avgTargetMaturity) * 100) : 0
                const barColor = pct >= 80 ? "hsl(142, 71%, 45%)" : pct >= 50 ? "hsl(32, 95%, 55%)" : "hsl(0, 84%, 60%)"
                return (
                  <div key={d.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{d.name}</span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{d.totalControls} controls</span>
                        <span>{d.avgCurrentMaturity} → {d.avgTargetMaturity}</span>
                        <Badge variant={d.gap <= 0.8 ? "default" : d.gap <= 1.2 ? "secondary" : "destructive"} className="text-xs">
                          Gap: {d.gap}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                      </div>
                      <span className="text-xs font-mono w-10 text-right" style={{ color: barColor }}>{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing Documents Table */}
      {missing.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileWarning className="w-5 h-5 text-destructive" />
                  Missing Required Documents
                </CardTitle>
                <CardDescription>
                  {missing.length} of {scoring?.totalRequired ?? 0} required documents not yet present
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="destructive">{missing.filter(m => m.priority === "Critical").length} Critical</Badge>
                <Badge variant="secondary">{missing.filter(m => m.priority === "High").length} High</Badge>
                <Badge variant="outline">{missing.filter(m => m.priority === "Medium").length} Medium</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">ID</th>
                    <th className="text-left p-3 font-medium">Title</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Domain</th>
                    <th className="text-left p-3 font-medium">Dept</th>
                    <th className="text-left p-3 font-medium">Priority</th>
                    <th className="text-left p-3 font-medium">Frameworks</th>
                  </tr>
                </thead>
                <tbody>
                  {[...missing].sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)).map(doc => (
                    <tr key={doc.docId} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-xs text-muted-foreground">{doc.docId}</td>
                      <td className="p-3 font-medium">{doc.title}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{doc.domain}</td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-xs">{doc.department}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={doc.priority === "Critical" ? "destructive" : doc.priority === "High" ? "secondary" : "outline"} className="text-xs">
                          {doc.priority === "Critical" && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {doc.priority}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground max-w-[200px] truncate">
                        {doc.frameworks?.join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maturity Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Maturity Scale Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
              <div className="font-bold text-red-500">1</div>
              <div className="text-xs text-muted-foreground mt-1">Initial / Ad Hoc</div>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
              <div className="font-bold text-orange-500">2</div>
              <div className="text-xs text-muted-foreground mt-1">Developing</div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
              <div className="font-bold text-yellow-500">3</div>
              <div className="text-xs text-muted-foreground mt-1">Defined</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
              <div className="font-bold text-blue-500">4</div>
              <div className="text-xs text-muted-foreground mt-1">Managed</div>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
              <div className="font-bold text-green-500">5</div>
              <div className="text-xs text-muted-foreground mt-1">Optimized</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
