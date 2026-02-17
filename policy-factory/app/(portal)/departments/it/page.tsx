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
  ShieldCheck,
  Activity,
  FileText,
  CheckCircle2,
  Folder,
  TrendingUp
} from "lucide-react"

// Import configurations
import departmentMappings from "@/config/department_mappings.json"
import cobitControls from "@/config/framework_controls/cobit.json"
import nistCsfControls from "@/config/framework_controls/nist_csf.json"
import nist800Controls from "@/config/framework_controls/nist_800.json"

export default function ITDepartmentPage() {
  const dept = (departmentMappings as any).departments.find((d: any) => d.code === "IT")
  const processes = dept.processes || []
  const frameworks = dept.frameworks || []

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Department Header Card */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{dept.name}</CardTitle>
              <CardDescription className="mt-2 text-base">{dept.description}</CardDescription>
            </div>
            <Badge className="bg-blue-600 hover:bg-blue-700 text-lg px-4 py-2">
              {dept.code}
            </Badge>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4 mt-6">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion</p>
                  <p className="text-2xl font-bold text-blue-600">{dept.completionPct}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600 opacity-50" />
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
                  <p className="text-2xl font-bold text-green-600">{dept.completedPolicies}/{dept.totalPolicies}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600 opacity-50" />
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

      {/* Tabs for different sections */}
      <Tabs defaultValue="frameworks" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="frameworks">IT Governance Frameworks</TabsTrigger>
          <TabsTrigger value="processes">Business Processes</TabsTrigger>
          <TabsTrigger value="documents">Policies & Procedures</TabsTrigger>
        </TabsList>

        {/* Frameworks Tab */}
        <TabsContent value="frameworks" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>IT Governance Frameworks</CardTitle>
              <CardDescription>
                IT department compliance with {frameworks.length} governance and security frameworks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ITG - COBIT */}
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>ITG - IT Governance (COBIT 2019)</CardTitle>
                      <CardDescription className="mt-1">
                        Control Objectives for Information and Related Technologies
                      </CardDescription>
                    </div>
                    <Badge className="bg-blue-600 hover:bg-blue-700">
                      {(cobitControls as any).summary.overallCompletion}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Implementation Progress</span>
                        <span className="font-semibold">
                          {(cobitControls as any).summary.implementedControls}/{(cobitControls as any).summary.totalControls} controls
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                          style={{ width: `${(cobitControls as any).summary.overallCompletion}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3">
                      {(cobitControls as any).domains.map((domain: any) => (
                        <div key={domain.code} className="bg-white rounded-lg p-3 border">
                          <p className="font-semibold text-sm text-blue-700">{domain.code}</p>
                          <p className="text-xs text-muted-foreground mt-1">{domain.name}</p>
                          <p className="text-xs font-medium mt-2">{domain.controls.length} controls</p>
                        </div>
                      ))}
                    </div>

                    <Link href="/frameworks/cobit">
                      <Button variant="outline" className="w-full">
                        View All COBIT Controls
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* TRC - NIST 800-53 */}
              <Card className="border-2 border-purple-200 bg-purple-50/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>TRC - Technology Risk Compliance (NIST 800-53)</CardTitle>
                      <CardDescription className="mt-1">
                        Security and Privacy Controls for Information Systems
                      </CardDescription>
                    </div>
                    <Badge className="bg-purple-600 hover:bg-purple-700">
                      {(nist800Controls as any).summary.overallCompletion}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Implementation Progress</span>
                        <span className="font-semibold">
                          {(nist800Controls as any).summary.implementedControls}/{(nist800Controls as any).summary.totalControls} controls
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
                          style={{ width: `${(nist800Controls as any).summary.overallCompletion}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {(nist800Controls as any).controlFamilies.slice(0, 8).map((family: any) => (
                        <div key={family.id} className="bg-white rounded p-2 border">
                          <p className="font-semibold text-purple-700">{family.id}</p>
                          <p className="text-muted-foreground text-xs truncate">{family.name}</p>
                        </div>
                      ))}
                    </div>

                    <Link href="/frameworks/nist-800">
                      <Button variant="outline" className="w-full">
                        View All NIST 800-53 Controls
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* CSC - NIST CSF */}
              <Card className="border-2 border-green-200 bg-green-50/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>CSC - Cyber Security Compliance (NIST CSF)</CardTitle>
                      <CardDescription className="mt-1">
                        NIST Cybersecurity Framework Functions
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-700">
                      {(nistCsfControls as any).summary.overallCompletion}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Implementation Progress</span>
                        <span className="font-semibold">
                          {(nistCsfControls as any).summary.implementedControls}/{(nistCsfControls as any).summary.totalControls} controls
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                          style={{ width: `${(nistCsfControls as any).summary.overallCompletion}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3">
                      {(nistCsfControls as any).functions.map((func: any) => (
                        <div key={func.id} className="bg-white rounded-lg p-3 border">
                          <p className="font-semibold text-green-700">{func.id}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{func.name}</p>
                          <div className="mt-2">
                            <p className="text-xs font-medium">{func.completionPct}%</p>
                            <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
                              <div 
                                className="bg-green-600 h-1 rounded-full"
                                style={{ width: `${func.completionPct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Link href="/frameworks/nist-csf">
                      <Button variant="outline" className="w-full">
                        View NIST CSF Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processes Tab */}
        <TabsContent value="processes" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>IT Business Processes</CardTitle>
              <CardDescription>
                Documentation for {processes.length} key IT-managed business processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {processes.map((process: any) => (
                  <Card key={process.id} className="border-2 hover:border-blue-300 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <Folder className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{process.name}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">Process ID: {process.id}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{process.completion}%</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${process.completion}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-50 rounded p-2">
                          <p className="text-xs text-muted-foreground">Policies</p>
                          <p className="font-semibold">{process.policies}</p>
                        </div>
                        <div className="bg-slate-50 rounded p-2">
                          <p className="text-xs text-muted-foreground">Procedures</p>
                          <p className="font-semibold">{process.procedures}</p>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="w-full">
                        View Process Documentation
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>IT Policies & Procedures</CardTitle>
              <CardDescription>
                All governance documents owned by the IT department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Policies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                          <span>IT Security Policy</span>
                          <Badge className="bg-green-600 hover:bg-green-700 text-xs">Approved</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                          <span>Data Protection Policy</span>
                          <Badge className="bg-green-600 hover:bg-green-700 text-xs">Approved</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                          <span>Change Management Policy</span>
                          <Badge className="bg-green-600 hover:bg-green-700 text-xs">Approved</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                          <span>Access Control Policy</span>
                          <Badge className="bg-orange-600 hover:bg-orange-700 text-xs">Draft</Badge>
                        </div>
                        <Link href="/library">
                          <Button variant="link" size="sm" className="w-full mt-2">
                            View All ({dept.totalPolicies} total)
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Procedures</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                          <span>Incident Response Procedure</span>
                          <Badge className="bg-green-600 hover:bg-green-700 text-xs">Approved</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                          <span>Backup & Recovery Procedure</span>
                          <Badge className="bg-green-600 hover:bg-green-700 text-xs">Approved</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                          <span>User Access Provisioning</span>
                          <Badge className="bg-green-600 hover:bg-green-700 text-xs">Approved</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                          <span>Vulnerability Management</span>
                          <Badge className="bg-orange-600 hover:bg-orange-700 text-xs">Draft</Badge>
                        </div>
                        <Link href="/library">
                          <Button variant="link" size="sm" className="w-full mt-2">
                            View All ({dept.totalProcedures} total)
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
