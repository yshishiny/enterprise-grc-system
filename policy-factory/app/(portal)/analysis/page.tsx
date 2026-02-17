"use client"

import { useState, useMemo } from "react"
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
  AlertTriangle, 
  Target, 
  CheckCircle2,
  XCircle,
  FileSearch,
  TrendingDown,
  Shield,
  BookOpen
} from "lucide-react"

import backlogConfig from "@/config/backlog.json"
import departmentsConfig from "@/config/departments.json"

export default function AnalysisPage() {
  const allDocs = useMemo(() => {
    return [
      ...backlogConfig.priorities.P0,
      ...backlogConfig.priorities.P1,
      ...backlogConfig.priorities.P2
    ]
  }, [])

  const departments = (departmentsConfig as any).departments

  // Gap analysis by domain
  const gapsByDomain = useMemo(() => {
    const domainMap = new Map<string, { total: number; p0: number; p1: number; p2: number }>()
    
    allDocs.forEach((doc: any) => {
      const domain = doc.domain
      if (!domainMap.has(domain)) {
        domainMap.set(domain, { total: 0, p0: 0, p1: 0, p2: 0 })
      }
      const stats = domainMap.get(domain)!
      stats.total++
      if (backlogConfig.priorities.P0.includes(doc)) stats.p0++
      else if (backlogConfig.priorities.P1.includes(doc)) stats.p1++
      else stats.p2++
    })
    
    return Array.from(domainMap.entries()).map(([domain, stats]) => ({
      domain,
      ...stats,
      risk: stats.p0 > 5 ? 'Critical' : stats.p0 > 2 ? 'High' : stats.p0 > 0 ? 'Medium' : 'Low'
    }))
  }, [allDocs])

  const totalGaps = allDocs.length
  const criticalGaps = backlogConfig.priorities.P0.length
  const highGaps = backlogConfig.priorities.P1.length

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 focus:outline-none">Gap Analysis</h1>
          <p className="text-muted-foreground mt-1">Identify policy and procedure coverage gaps across your organization.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileSearch className="h-4 w-4 mr-2" />
            Run Assessment
          </Button>
          <Button size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gaps</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGaps}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Documents in backlog
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical (P0)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalGaps}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-600 font-medium">Immediate action required</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority (P1)</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highGaps}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-orange-600 font-medium">Address soon</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">16 of 60 complete</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gap Analysis by Domain */}
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b">
          <CardTitle>Gap Analysis by Department/Domain</CardTitle>
          <CardDescription>Policy and procedure coverage assessment</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="font-semibold">Department / Domain</TableHead>
                <TableHead className="font-semibold text-center">Total Gaps</TableHead>
                <TableHead className="font-semibold text-center">P0 Critical</TableHead>
                <TableHead className="font-semibold text-center">P1 High</TableHead>
                <TableHead className="font-semibold text-center">P2 Medium</TableHead>
                <TableHead className="text-right font-semibold">Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gapsByDomain
                .sort((a, b) => b.p0 - a.p0)
                .map((gap) => (
                  <TableRow key={gap.domain} className="group hover:bg-blue-50/30 transition-colors">
                    <TableCell className="font-medium text-slate-700">
                      {gap.domain}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-normal">
                        {gap.total}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        "font-semibold border-none shadow-none",
                        gap.p0 > 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"
                      )}>
                        {gap.p0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        "font-semibold border-none shadow-none",
                        gap.p1 > 0 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"
                      )}>
                        {gap.p1}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        "font-semibold border-none shadow-none",
                        gap.p2 > 0 ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-500"
                      )}>
                        {gap.p2}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        className={cn(
                          "font-normal border-none shadow-none",
                          gap.risk === 'Critical' ? "bg-red-100 text-red-700" :
                          gap.risk === 'High' ? "bg-orange-100 text-orange-700" :
                          gap.risk === 'Medium' ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        )}
                      >
                        {gap.risk}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Critical Recommendations
            </CardTitle>
            <CardDescription>Immediate actions required to close gaps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-1 flex h-2 w-2 rounded-full bg-red-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Complete all GRC P0 policies</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    6 critical GRC policies require immediate attention to meet regulatory requirements
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1 flex h-2 w-2 rounded-full bg-red-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Address AML procedure gaps</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    3 AML procedures missing, essential for compliance certification
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1 flex h-2 w-2 rounded-full bg-red-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Finalize Commercial risk policies</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    4 commercial policies pending to complete credit risk framework
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle>Coverage Progress</CardTitle>
            <CardDescription>Policy documentation completion by domain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['GRC', 'Commercial', 'AML', 'Operations', 'Finance'].map((domain) => {
                const domainDocs = allDocs.filter((d: any) => d.domain === domain)
                // Mock completion percentage
                const completed = Math.floor(Math.random() * 40) + 20
                return (
                  <div key={domain} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{domain}</span>
                      <span className="text-muted-foreground">{completed}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all",
                          completed > 60 ? "bg-green-500" :
                          completed > 30 ? "bg-orange-500" : "bg-red-500"
                        )}
                        style={{ width: `${completed}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
