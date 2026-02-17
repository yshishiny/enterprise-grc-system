"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Lock, CheckCircle2, XCircle } from "lucide-react"
import iso27001Data from "@/config/framework_controls/iso27001.json"

export default function ISO27001Page() {
  const categories = (iso27001Data as any).annexAControls
  const summary = (iso27001Data as any).summary

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-white">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Lock className="h-8 w-8 text-orange-600" />
                <div>
                  <CardTitle className="text-3xl">ISO/IEC 27001:2022</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Information Security Management System</p>
                </div>
              </div>
              <CardDescription className="text-base mt-2">
                Annex A Controls Checklist
              </CardDescription>
            </div>
            <Badge className="bg-orange-600 hover:bg-orange-700 text-xl px-6 py-3">
              {summary.overallCompletion}%
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mt-6">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Total Controls</p>
              <p className="text-3xl font-bold text-orange-600">{summary.totalControls}</p>
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
              <p className="text-sm text-muted-foreground">Avg Maturity</p>
              <p className="text-3xl font-bold text-purple-600">{summary.avgMaturity.toFixed(1)}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All Categories</TabsTrigger>
          {categories.map((cat: any, idx: number) => (
            <TabsTrigger key={idx} value={`cat${idx}`}>
              {cat.category.split('.')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Annex A Control Categories</CardTitle>
              <CardDescription>4 categories of information security controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {categories.map((cat: any, idx: number) => (
                  <Card key={idx} className="border-2 border-orange-200">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{cat.category}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {cat.totalControls} controls
                          </p>
                        </div>
                        <Badge variant="outline">
                          {cat.completionPct}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="w-full bg-slate-200 rounded-full h-3">
                            <div 
                              className="bg-orange-600 h-3 rounded-full"
                              style={{ width: `${cat.completionPct}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {cat.implementedControls}/{cat.totalControls} implemented
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {categories.map((cat: any, catIdx: number) => (
          <TabsContent key={catIdx} value={`cat${catIdx}`} className="space-y-4">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">{cat.category}</CardTitle>
                <CardDescription>
                  {cat.implementedControls} of {cat.totalControls} controls implemented | 
                  Avg Maturity: {cat.avgMaturity.toFixed(1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cat.controls.map((control: any) => (
                    <Card 
                      key={control.id} 
                      className={`border-l-4 ${control.implemented ? 'border-l-green-500 bg-green-50/30' : 'border-l-red-500 bg-red-50/30'}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-sm font-mono">{control.id}</CardTitle>
                              <Badge variant={control.implemented ? "default" : "outline"} className={control.implemented ? "bg-green-600" : "bg-red-100 text-red-700"}>
                                {control.implemented ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                                {control.implemented ? "Implemented" : "Not Implemented"}
                              </Badge>
                            </div>
                            <p className="text-sm mt-1">{control.name}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">
                              Maturity: {control.maturity}
                            </Badge>
                            <Badge variant="outline">
                              {control.completionPct}%
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${control.implemented ? 'bg-green-600' : 'bg-red-600'}`}
                            style={{ width: `${control.completionPct}%` }}
                          />
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
