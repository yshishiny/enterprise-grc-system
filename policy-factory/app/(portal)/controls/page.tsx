"use client"

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
  ShieldCheck, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck,
  BarChart3
} from "lucide-react"

import controlsConfig from "@/config/controls.json"

export default function ControlsPage() {
  const controls = (controlsConfig as any).controls

  // Mock compliance data
  const complianceStats = {
    total: controls.length,
    compliant: Math.floor(controls.length * 0.92),
    partial: Math.floor(controls.length * 0.06),
    nonCompliant: Math.floor(controls.length * 0.02),
    overallScore: 92.4
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 focus:outline-none">Controls & KPIs</h1>
          <p className="text-muted-foreground mt-1">Monitor governance controls and key performance indicators.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileCheck className="h-4 w-4 mr-2" />
            Submit Evidence
          </Button>
          <Button size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.overallScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fully Compliant</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.compliant}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {complianceStats.total} controls
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partial Compliance</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.partial}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-orange-600 font-medium">Needs attention</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.nonCompliant}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-600 font-medium">Critical items</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls Table */}
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Governance Controls Registry</CardTitle>
              <CardDescription>All defined controls with current compliance status</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[120px] font-semibold">Control ID</TableHead>
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Frequency</TableHead>
                <TableHead className="font-semibold">KPI Target</TableHead>
                <TableHead className="font-semibold">Current</TableHead>
                <TableHead className="text-right font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {controls.map((ctrl: any, idx: number) => {
                // Mock current performance
                const target = parseFloat(ctrl.kpi.target.replace('%', ''))
                const current = target + (Math.random() * 10 - 2)
                const isCompliant = current >= target
                const isPartial = current >= target - 5 && current < target
                
                return (
                  <TableRow key={ctrl.id} className="group hover:bg-blue-50/30 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-blue-700">
                      {ctrl.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-700">{ctrl.title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal bg-slate-50">
                        {ctrl.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ctrl.frequency}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {ctrl.kpi.target}
                    </TableCell>
                    <TableCell className={cn(
                      "text-sm font-semibold",
                      isCompliant ? "text-green-600" : 
                      isPartial ? "text-orange-600" : "text-red-600"
                    )}>
                      {current.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        className={cn(
                          "font-normal border-none shadow-none",
                          isCompliant ? "bg-green-100 text-green-700" : 
                          isPartial ? "bg-orange-100 text-orange-700" : 
                          "bg-red-100 text-red-700"
                        )}
                      >
                        {isCompliant ? "Compliant" : isPartial ? "Partial" : "Non-Compliant"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Compliance Trend
            </CardTitle>
            <CardDescription>Last 6 months performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => {
                const score = 85 + idx * 1.2 + Math.random() * 2
                return (
                  <div key={month} className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium text-muted-foreground">{month}</div>
                    <div className="flex-1 h-8 bg-slate-100 rounded-md overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-end px-3"
                        style={{ width: `${score}%` }}
                      >
                        <span className="text-white text-xs font-semibold">{score.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle>Control Type Distribution</CardTitle>
            <CardDescription>Breakdown by control category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Preventive', 'Detective', 'Corrective'].map((type) => {
                const count = controls.filter((c: any) => c.type === type).length
                const percentage = (count / controls.length) * 100
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{type}</span>
                      <span className="text-muted-foreground">{count} controls ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full",
                          type === 'Preventive' ? "bg-blue-500" :
                          type === 'Detective' ? "bg-purple-500" : "bg-green-500"
                        )}
                        style={{ width: `${percentage}%` }}
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
