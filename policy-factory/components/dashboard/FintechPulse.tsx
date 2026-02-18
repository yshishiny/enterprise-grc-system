"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Lock, Landmark, FileText } from "lucide-react"

interface FintechPulseProps {
  frameworks: any[]
}

export function FintechPulse({ frameworks }: FintechPulseProps) {
  const pci = frameworks.find(f => f.code === "PCI-DSS") || { coveragePct: 0, implementedControls: 0, totalControls: 12 }
  const cbe = frameworks.find(f => f.code === "CBE") || { coveragePct: 0, implementedControls: 0, totalControls: 50 }
  const fra = frameworks.find(f => f.code === "FRA") || { coveragePct: 0, implementedControls: 0, totalControls: 45 }

  const renderGauge = (title: string, data: any, icon: any, color: string, href: string) => {
    const pct = data.coveragePct || 0
    const strokeDasharray = `${pct}, 100`

    return (
      <Link href={href} className="group block">
        <Card className="flex-1 min-w-[200px] border-none shadow-sm bg-gradient-to-br from-slate-50 to-white hover:shadow-md hover:ring-1 hover:ring-slate-200 transition-all cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-slate-900 transition-colors">{title}</CardTitle>
            {icon}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className={`${color} transition-all duration-1000 ease-out`}
                    strokeDasharray={strokeDasharray}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                  <span className={`text-sm font-bold ${color.replace('text-', 'text-')}`}>{pct}%</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors">{data.implementedControls}</div>
                <p className="text-xs text-muted-foreground">/ {data.totalControls} Controls</p>
                <p className="text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1">Click for details →</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {renderGauge("PCI DSS v4.0", pci, <Lock className="h-4 w-4 text-blue-500" />, "text-blue-500", "/frameworks/pci-dss")}
      {renderGauge("CBE Cybersecurity", cbe, <Landmark className="h-4 w-4 text-emerald-500" />, "text-emerald-500", "/frameworks/cbe")}
      {renderGauge("FRA Compliance", fra, <FileText className="h-4 w-4 text-purple-500" />, "text-purple-500", "/frameworks/fra")}
    </div>
  )
}
