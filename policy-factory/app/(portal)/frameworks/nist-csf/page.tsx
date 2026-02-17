"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Target, TrendingUp } from "lucide-react"
import nistCsfData from "@/config/framework_controls/nist_csf.json"

export default function NISTCSFPage() {
  const functions = (nistCsfData as any).functions
  const summary = (nistCsfData as any).summary

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-8 w-8 text-green-600" />
                <div>
                  <CardTitle className="text-3xl">NIST Cybersecurity Framework</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Version 1.1</p>
                </div>
              </div>
              <CardDescription className="text-base mt-2">
                Cyber Security Compliance Framework
              </CardDescription>
            </div>
            <Badge className="bg-green-600 hover:bg-green-700 text-xl px-6 py-3">
              {summary.overallCompletion}%
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Total Controls</p>
              <p className="text-3xl font-bold text-green-600">{summary.totalControls}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Implemented</p>
              <p className="text-3xl font-bold text-blue-600">{summary.implementedControls}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Avg Maturity</p>
              <p className="text-3xl font-bold text-purple-600">{summary.avgMaturity.toFixed(1)}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {functions.map((func: any) => (
            <TabsTrigger key={func.id} value={func.id}>
              {func.id}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Framework Functions</CardTitle>
              <CardDescription>5 core cybersecurity functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {functions.map((func: any) => (
                  <Card key={func.id} className="border-2 border-green-200 bg-green-50/30">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-600 text-lg px-3 py-1">{func.id}</Badge>
                            <CardTitle className="text-xl">{func.name}</CardTitle>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{func.description}</p>
                        </div>
                        <Badge variant="outline" className="text-lg px-4 py-2">
                          {func.completionPct}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-4 mb-3">
                        <div className="bg-white rounded p-2">
                          <p className="text-xs text-muted-foreground">Controls</p>
                          <p className="font-semibold">{func.totalControls}</p>
                        </div>
                        <div className="bg-white rounded p-2">
                          <p className="text-xs text-muted-foreground">Implemented</p>
                          <p className="font-semibold text-green-600">{func.implementedControls}</p>
                        </div>
                        <div className="bg-white rounded p-2">
                          <p className="text-xs text-muted-foreground">Categories</p>
                          <p className="font-semibold">{func.categories.length}</p>
                        </div>
                        <div className="bg-white rounded p-2">
                          <p className="text-xs text-muted-foreground">Maturity</p>
                          <p className="font-semibold text-purple-600">{func.avgMaturity.toFixed(1)}</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full"
                          style={{ width: `${func.completionPct}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {functions.map((func: any) => (
          <TabsContent key={func.id} value={func.id} className="space-y-4">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-600 text-lg px-3 py-1">{func.id}</Badge>
                  <CardTitle className="text-2xl">{func.name}</CardTitle>
                </div>
                <CardDescription>{func.description}</CardDescription>

                <div className="grid gap-3 md:grid-cols-4 mt-4">
                  <div className="bg-slate-50 rounded p-3">
                    <p className="text-sm text-muted-foreground">Total Controls</p>
                    <p className="text-2xl font-bold">{func.totalControls}</p>
                  </div>
                  <div className="bg-green-50 rounded p-3">
                    <p className="text-sm text-muted-foreground">Implemented</p>
                    <p className="text-2xl font-bold text-green-600">{func.implementedControls}</p>
                  </div>
                  <div className="bg-purple-50 rounded p-3">
                    <p className="text-sm text-muted-foreground">Maturity</p>
                    <p className="text-2xl font-bold text-purple-600">{func.avgMaturity.toFixed(1)}/5</p>
                  </div>
                  <div className="bg-blue-50 rounded p-3">
                    <p className="text-sm text-muted-foreground">Completion</p>
                    <p className="text-2xl font-bold text-blue-600">{func.completionPct}%</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <h3 className="font-semibold text-lg mb-4">Categories</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {func.categories.map((category: any) => (
                    <Card key={category.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-sm font-mono">{category.id}</CardTitle>
                            <p className="text-sm mt-1">{category.name}</p>
                          </div>
                          <Badge>{category.completionPct}%</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${category.completionPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{category.implemented}/{category.controls} implemented</span>
                          <span className="text-muted-foreground">Maturity: {category.maturity}</span>
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
