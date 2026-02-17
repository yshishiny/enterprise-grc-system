"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Activity } from "lucide-react"
import nist800Data from "@/config/framework_controls/nist_800.json"

export default function NIST800Page() {
  const families = (nist800Data as any).controlFamilies
  const summary = (nist800Data as any).summary

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <CardTitle className="text-3xl">NIST 800-53 Rev 5</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Technology Risk Compliance</p>
                </div>
              </div>
              <CardDescription className="text-base mt-2">
                Security and Privacy Controls for Information Systems and Organizations
              </CardDescription>
            </div>
            <Badge className="bg-purple-600 hover:bg-purple-700 text-xl px-6 py-3">
              {summary.overallCompletion}%
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mt-6">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Control Families</p>
              <p className="text-3xl font-bold text-purple-600">{summary.totalFamilies}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Total Controls</p>
              <p className="text-3xl font-bold text-blue-600">{summary.totalControls}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Implemented</p>
              <p className="text-3xl font-bold text-green-600">{summary.implementedControls}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Maturity</p>
                  <p className="text-3xl font-bold text-orange-600">{summary.avgMaturity.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Control Families</CardTitle>
          <CardDescription>{families.length} security and privacy control families</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {families.map((family: any) => (
              <Card key={family.id} className="border-2 hover:border-purple-300 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base font-mono">{family.id}</CardTitle>
                      <p className="text-sm mt-1">{family.name}</p>
                    </div>
                    <Badge variant="outline">
                      {family.completionPct}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full"
                        style={{ width: `${family.completionPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-slate-50 rounded p-2">
                      <p className="text-xs text-muted-foreground">Controls</p>
                      <p className="font-semibold">{family.controls}</p>
                    </div>
                    <div className="bg-slate-50 rounded p-2">
                      <p className="text-xs text-muted-foreground">Implemented</p>
                      <p className="font-semibold text-green-600">{family.implemented}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Maturity</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div 
                          key={level}
                          className={`w-3 h-3 rounded-sm ${level <= family.maturity ? 'bg-purple-600' : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
