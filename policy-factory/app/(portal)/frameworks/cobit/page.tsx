"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Layers, CheckCircle2, XCircle, Activity } from "lucide-react"
import cobitData from "@/config/framework_controls/cobit.json"

export default function COBITPage() {
  const domains = (cobitData as any).domains
  const summary = (cobitData as any).summary

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Layers className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle className="text-3xl">COBIT 2019</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">IT Governance Framework</p>
                </div>
              </div>
              <CardDescription className="text-base mt-2">
                Control Objectives for Information and Related Technologies
              </CardDescription>
            </div>
            <Badge className="bg-blue-600 hover:bg-blue-700 text-xl px-6 py-3">
              {summary.overallCompletion}%
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mt-6">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Total Controls</p>
              <p className="text-3xl font-bold text-blue-600">{summary.totalControls}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Implemented</p>
                  <p className="text-3xl font-bold text-green-600">{summary.implementedControls}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Not Implemented</p>
                  <p className="text-3xl font-bold text-red-600">{summary.notImplementedControls}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Maturity</p>
                  <p className="text-3xl font-bold text-purple-600">{summary.avgMaturity.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All Domains</TabsTrigger>
          {domains.map((domain: any) => (
            <TabsTrigger key={domain.code} value={domain.code}>
              {domain.code}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>COBIT 2019 Domains Overview</CardTitle>
              <CardDescription>All 5 governance and management domains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {domains.map((domain: any) => (
                  <Card key={domain.code} className="border-2 border-blue-200">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{domain.code} - {domain.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {domain.controls.length} controls
                          </p>
                        </div>
                        <Badge variant="outline">
                          {Math.round((domain.controls.filter((c: any) => c.implemented).length / domain.controls.length) * 100)}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ 
                            width: `${(domain.controls.filter((c: any) => c.implemented).length / domain.controls.length) * 100}%` 
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {domains.map((domain: any) => (
          <TabsContent key={domain.code} value={domain.code} className="space-y-4">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">{domain.code} - {domain.name}</CardTitle>
                <CardDescription>
                  {domain.controls.length} controls | {domain.controls.filter((c: any) => c.implemented).length} implemented
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {domain.controls.map((control: any) => (
                    <Card key={control.id} className={`border-l-4 ${control.implemented ? 'border-l-green-500' : 'border-l-red-500'}`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{control.id}</CardTitle>
                            <p className="text-sm mt-1">{control.title}</p>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Badge variant={control.implemented ? "default" : "outline"} className={control.implemented ? "bg-green-600" : ""}>
                              {control.implemented ? "Implemented" : "Not Implemented"}
                            </Badge>
                            <Badge variant="outline">
                              Maturity: {control.maturity}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Completion:</span>
                          <div className="flex-1">
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${control.implemented ? 'bg-green-600' : 'bg-red-600'}`}
                                style={{ width: `${control.completionPct}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-semibold">{control.completionPct}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
