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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Users,
  Activity,
  FileText,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Briefcase
} from "lucide-react"

import departmentMappings from "@/config/department_mappings.json"

export default function HRDepartmentPage() {
  const dept = (departmentMappings as any).departments.find((d: any) => d.code === "HR")
  const complianceAreas = dept.complianceAreas || []

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{dept.name}</CardTitle>
              <CardDescription className="mt-2 text-base">{dept.description}</CardDescription>
            </div>
            <Badge className="bg-green-600 hover:bg-green-700 text-lg px-4 py-2">
              {dept.code}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mt-6">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion</p>
                  <p className="text-2xl font-bold text-green-600">{dept.completionPct}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Maturity Level</p>
                  <p className="text-2xl font-bold text-purple-600">{dept.maturityLevel.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Target: {dept.maturityTarget.toFixed(1)}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Policies</p>
                  <p className="text-2xl font-bold text-blue-600">{dept.completedPolicies}/{dept.totalPolicies}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Procedures</p>
                  <p className="text-2xl font-bold text-orange-600">{dept.completedProcedures}/{dept.totalProcedures}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-orange-600 opacity-50" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="compliance" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="compliance">Compliance Areas</TabsTrigger>
          <TabsTrigger value="documents">Policies & Procedures</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>HR Compliance Areas</CardTitle>
              <CardDescription>
                Key compliance domains managed by Human Resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {complianceAreas.map((area: any) => (
                  <Card key={area.id} className="border-2 hover:border-green-300 transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-green-100">
                          <ShieldCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{area.name}</CardTitle>
                        </div>
                      </div>
                      <Badge variant="outline" className="w-fit">
                        {area.completion}% Complete
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full"
                          style={{ width: `${area.completion}%` }}
                        />
                      </div>

                      <div className="bg-slate-50 rounded p-3">
                        <p className="text-sm text-muted-foreground">Associated Policies</p>
                        <p className="text-lg font-semibold">{area.policies}</p>
                      </div>

                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-6 bg-green-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">FRA Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    HR department ensures compliance with Financial Regulatory Authority requirements related to employee governance and labor regulations.
                  </p>
                  <Link href="/frameworks/fra">
                    <Button variant="outline" size="sm">
                      View FRA Requirements
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>HR Policies & Procedures</CardTitle>
              <CardDescription>
                Human Resources governance documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Core HR Policies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-slate-50 rounded flex justify-between items-center">
                        <span>Recruitment & Hiring Policy</span>
                        <Badge className="bg-green-600 text-xs">Approved</Badge>
                      </div>
                      <div className="p-2 bg-slate-50 rounded flex justify-between items-center">
                        <span>Performance Management</span>
                        <Badge className="bg-green-600 text-xs">Approved</Badge>
                      </div>
                      <div className="p-2 bg-slate-50 rounded flex justify-between items-center">
                        <span>Compensation & Benefits</span>
                        <Badge className="bg-green-600 text-xs">Approved</Badge>
                      </div>
                      <div className="p-2 bg-slate-50 rounded flex justify-between items-center">
                        <span>Employee Code of Conduct</span>
                        <Badge className="bg-green-600 text-xs">Approved</Badge>
                      </div>
                      <Link href="/library">
                        <Button variant="link" size="sm" className="w-full mt-2">
                          View All Policies
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Employment Procedures
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-slate-50 rounded flex justify-between items-center">
                        <span>Onboarding Procedure</span>
                        <Badge className="bg-green-600 text-xs">Approved</Badge>
                      </div>
                      <div className="p-2 bg-slate-50 rounded flex justify-between items-center">
                        <span>Leave Management</span>
                        <Badge className="bg-green-600 text-xs">Approved</Badge>
                      </div>
                      <div className="p-2 bg-slate-50 rounded flex justify-between items-center">
                        <span>Disciplinary Process</span>
                        <Badge className="bg-green-600 text-xs">Approved</Badge>
                      </div>
                      <div className="p-2 bg-slate-50 rounded flex justify-between items-center">
                        <span>Termination Procedure</span>
                        <Badge className="bg-orange-600 text-xs">Draft</Badge>
                      </div>
                      <Link href="/library">
                        <Button variant="link" size="sm" className="w-full mt-2">
                          View All Procedures
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
