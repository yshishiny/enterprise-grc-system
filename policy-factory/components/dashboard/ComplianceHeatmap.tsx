"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface ComplianceHeatmapProps {
  departments: any[]
  missingDocs: any[]
}

const FRAMEWORKS = ["CBE", "PCI-DSS", "FRA-139", "ISO27001"]

export function ComplianceHeatmap({ departments, missingDocs }: ComplianceHeatmapProps) {
  
  const getCellData = (deptCode: string, fw: string) => {
    const dept = departments.find(d => d.code === deptCode)
    if (!dept) return { score: 0, total: 0 }

    const deptDocs = dept.documents || []
    const existingInterest = deptDocs.filter((d: any) => d.frameworks?.some((f: string) => f.includes(fw)))
    const approved = existingInterest.filter((d: any) => d.status === "Approved").length
    
    // Missing docs for this dept & framework
    const missingInterest = missingDocs.filter(d => d.department === deptCode && d.frameworks?.some((f: string) => f.includes(fw)))
    
    const total = existingInterest.length + missingInterest.length
    if (total === 0) return { score: -1, total: 0 } // No Answer
    
    return { score: Math.round((approved / total) * 100), total }
  }

  const getColor = (score: number) => {
    if (score === -1) return "bg-slate-100 text-slate-400"
    if (score >= 80) return "bg-green-100 text-green-700"
    if (score >= 50) return "bg-amber-100 text-amber-700"
    return "bg-red-100 text-red-700"
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Departmental Compliance Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Department</TableHead>
              {FRAMEWORKS.map(fw => <TableHead key={fw} className="text-center">{fw}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map(dept => {
              if (dept.totalPolicies + dept.totalProcedures === 0) return null
              return (
                <TableRow key={dept.code}>
                  <TableCell className="font-medium">{dept.code}</TableCell>
                  {FRAMEWORKS.map(fw => {
                    const { score, total } = getCellData(dept.code, fw)
                    return (
                      <TableCell key={fw} className="text-center">
                        {score === -1 ? (
                          <span className="text-slate-300">-</span>
                        ) : (
                          <div className={`mx-auto w-12 py-1 rounded text-xs font-bold ${getColor(score)}`}>
                            {score}%
                          </div>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
