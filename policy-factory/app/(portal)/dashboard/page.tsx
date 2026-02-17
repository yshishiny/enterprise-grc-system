"use client"

import Link from "next/link"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Building2,
  FileText, 
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Activity
} from "lucide-react"

// Import our new configurations
import departmentMappings from "@/config/department_mappings.json"
import frameworks from "@/config/frameworks.json"

export default function DashboardPage() {
  const depts = (departmentMappings as any).departments
  const metrics = (departmentMappings as any).overallMetrics
  const frameworksList = (frameworks as any).frameworks

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 focus:outline-none">Enterprise GRC Dashboard</h1>
          <p className="text-muted-foreground mt-1">Governance, Risk & Compliance — Shari for Microfinance</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-white px-3 py-1">Last Updated: Today 10:30 AM</Badge>
        </div>
      </div>

      {/* Company-Wide Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-none bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Maturity Level</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{metrics.overallMaturityLevel.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-blue-600 font-medium">Target: {metrics.maturityTarget.toFixed(1)}</span> | Scale 1-5
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Completion</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{metrics.policyCompletionPct}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">{metrics.completedPolicies}/{metrics.totalPolicies}</span> policies completed
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Procedure Completion</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{metrics.procedureCompletionPct}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-purple-600 font-medium">{metrics.completedProcedures}/{metrics.totalProcedures}</span> procedures completed
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Framework Compliance</CardTitle>
            <ShieldCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">
              {Math.round(frameworksList.reduce((acc: number, f: any) => acc + (f.completionPct || f.overallCompletion || 0), 0) / frameworksList.length)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-orange-600 font-medium">{frameworksList.length} frameworks</span> tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Departments Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Departments</h2>
            <p className="text-sm text-muted-foreground mt-1">Policy and procedure completion by department</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {depts.map((dept: any) => {
            const MaturityIcon = dept.maturityLevel >= dept.maturityTarget ? CheckCircle2 : AlertCircle
            const maturityColor = dept.maturityLevel >= dept.maturityTarget ? "text-green-600" : "text-orange-600"
            
            return (
              <Card key={dept.code} className="shadow-sm border hover:border-blue-300 transition-all hover:shadow-md group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{dept.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{dept.code}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Completion Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-semibold text-slate-900">{dept.completionPct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${dept.completionPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Maturity Level */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Maturity</span>
                    <div className="flex items-center gap-1">
                      <MaturityIcon className={`h-4 w-4 ${maturityColor}`} />
                      <span className="font-semibold">{dept.maturityLevel.toFixed(1)}</span>
                      <span className="text-muted-foreground">/ {dept.maturityTarget.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Policies</p>
                      <p className="text-sm font-semibold">{dept.completedPolicies}/{dept.totalPolicies}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Procedures</p>
                      <p className="text-sm font-semibold">{dept.completedProcedures}/{dept.totalProcedures}</p>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <Link href={`/departments/${dept.code.toLowerCase()}`} className="block">
                    <Button variant="ghost" size="sm" className="w-full group-hover:bg-blue-50 group-hover:text-blue-700">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Frameworks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Compliance Frameworks</h2>
            <p className="text-sm text-muted-foreground mt-1">Regulatory and standard compliance tracking</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {frameworksList.map((framework: any) => {
            const completionPct = framework.completionPct || framework.overallCompletion || 0
            const maturity = framework.maturityLevel || 0
            
            return (
              <Card key={framework.code} className="shadow-sm border hover:border-purple-300 transition-all hover:shadow-md group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <CardTitle className="text-lg">{framework.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{framework.code} • {framework.version}</p>
                    </div>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {completionPct}%
                    </Badge>
                  </div>
                  <CardDescription className="text-xs line-clamp-2">{framework.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Progress Bar */}
                  <div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Framework-specific metrics */}
                  {framework.code === "FRA" && framework.laws && (
                    <div className="space-y-1">
                      {framework.laws.map((law: any) => (
                        <div key={law.number} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Law {law.number}/{law.year}</span>
                          <span className="font-medium">{law.completionPct}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {framework.totalControls && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Controls</span>
                      <span className="font-semibold">{framework.implementedControls || 0}/{framework.totalControls}</span>
                    </div>
                  )}

                  {maturity > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Maturity Level</span>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5 text-purple-600" />
                        <span className="font-semibold">{maturity.toFixed(1)}</span>
                        <span className="text-muted-foreground text-xs">/ 5.0</span>
                      </div>
                    </div>
                  )}

                  {/* View Details Button */}
                  <Link href={`/frameworks/${framework.code.toLowerCase()}`} className="block">
                    <Button variant="ghost" size="sm" className="w-full group-hover:bg-purple-50 group-hover:text-purple-700 mt-2">
                      View Framework
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-sm border-none bg-gradient-to-r from-slate-50 to-white">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Link href="/workflow">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Review Pending Approvals
              </Button>
            </Link>
            <Link href="/analysis">
              <Button variant="outline" className="w-full justify-start">
                <AlertCircle className="h-4 w-4 mr-2" />
                View Gap Analysis
              </Button>
            </Link>
            <Link href="/generate">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Generate New Policy
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
