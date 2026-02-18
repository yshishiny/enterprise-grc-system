import { notFound } from "next/navigation"
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
  FileText, 
  Download, 
  Edit,
  GitBranch,
  Clock,
  User,
  Calendar,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import backlog from "@/config/backlog.json"

export default async function DocumentPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  
  // Find document in backlog
  const allDocs = [
    ...backlog.priorities.P0,
    ...backlog.priorities.P1,
    ...backlog.priorities.P2
  ]
  
  const doc = allDocs.find((d: any) => d.code === code)
  
  if (!doc) {
    notFound()
  }

  // Mock document content and metadata
  const mockContent = `# ${(doc as any).title}

**Document Number:** ${(doc as any).code}  
**Type:** ${(doc as any).type}  
**Department:** ${(doc as any).domain}  
**Version:** 0.1 (Draft)  
**Effective Date:** TBD  

---

## 1. Purpose

This document establishes the framework and requirements for ${(doc as any).title.toLowerCase()} at Shari for Microfinance. It aims to ensure compliance with regulatory requirements and best practices.

## 2. Scope

This policy applies to:
- All employees and contractors
- All departments and branches
- All relevant operations and activities

## 3. Policy Statement

Shari for Microfinance is committed to maintaining the highest standards of ${(doc as any).domain.toLowerCase()} governance. This policy outlines the key principles and requirements that must be followed.

### 3.1 Core Requirements

1. **Compliance**: All activities must comply with relevant laws and regulations
2. **Documentation**: Proper records must be maintained for all transactions
3. **Review**: Regular reviews and audits will be conducted
4. **Training**: All staff must receive appropriate training

### 3.2 Responsibilities

- **Senior Management**: Overall accountability and policy approval
- **Department Heads**: Implementation and compliance monitoring
- **All Staff**: Adherence to policy requirements

## 4. Procedures

### 4.1 Implementation Process

1. Policy approval by management
2. Communication to all stakeholders
3. Training and awareness programs
4. Regular monitoring and review

### 4.2 Monitoring and Reporting

Compliance with this policy will be monitored through:
- Regular internal audits
- Management reviews
- Key performance indicators
- Incident reporting

## 5. Exceptions

Any exceptions to this policy must be:
- Documented in writing
- Approved by senior management
- Reviewed annually

## 6. Review and Updates

This policy will be reviewed:
- Annually at minimum
- When regulatory changes occur
- Following significant incidents
- As needed based on business changes

## 7. Related Documents

- Risk Management Framework
- Internal Audit Charter
- Compliance Manual
- Code of Conduct

## 8. Approval and Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | Draft | GRC Team | Initial draft |

---

**Document Owner:** GRC Department  
**Approved By:** Pending Review  
**Next Review Date:** TBD  
`

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/library">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>
        </Link>
      </div>

      {/* Document Header Card */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-white to-slate-50">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl">{(doc as any).title}</CardTitle>
                  <p className="text-sm text-muted-foreground font-mono mt-1">{(doc as any).code}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                  {(doc as any).type}
                </Badge>
                <Badge variant="outline" className="bg-slate-50">
                  {(doc as any).domain}
                </Badge>
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                  Draft v0.1
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <GitBranch className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2">
          <Card className="border-none shadow-sm">
            <CardContent className="p-8">
              <div 
                className="prose prose-slate max-w-none
                  prose-headings:text-slate-900 
                  prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6
                  prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-blue-900
                  prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-slate-700 prose-p:leading-7
                  prose-strong:text-slate-900 prose-strong:font-semibold
                  prose-ul:my-4 prose-li:text-slate-700
                  prose-table:border prose-table:border-slate-200
                  prose-th:bg-slate-50 prose-th:p-3 prose-th:border prose-th:border-slate-200
                  prose-td:p-3 prose-td:border prose-td:border-slate-200
                "
              >
                {mockContent.split('\n').map((line, idx) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={idx}>{line.substring(2)}</h1>
                  } else if (line.startsWith('## ')) {
                    return <h2 key={idx}>{line.substring(3)}</h2>
                  } else if (line.startsWith('### ')) {
                    return <h3 key={idx}>{line.substring(4)}</h3>
                  } else if (line.startsWith('**') && line.endsWith('**')) {
                    const parts = line.split('**')
                    return <p key={idx}><strong>{parts[1]}</strong> {parts[2]}</p>
                  } else if (line.startsWith('- ')) {
                    return (
                      <div key={idx} className="flex gap-2 pl-4">
                        <span className="text-slate-400">•</span>
                        <span>{line.substring(2)}</span>
                      </div>
                    )
                  } else if (line.startsWith('---')) {
                    return <hr key={idx} className="my-8" />
                  } else if (line.startsWith('| ')) {
                    // Simple table row handling
                    return null // Skip for now, would need proper markdown parser
                  } else if (line.trim()) {
                    return <p key={idx}>{line}</p>
                  }
                  return <br key={idx} />
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metadata Sidebar */}
        <div className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Owner</p>
                  <p className="font-medium">GRC Manager</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Created</p>
                  <p className="font-medium">2026-02-10</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Last Modified</p>
                  <p className="font-medium">2026-02-15</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Version</p>
                  <p className="font-medium">0.1 (Draft)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3 text-sm">
                  <div className="mt-1 flex h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                  <div>
                    <p className="font-medium">v0.1 Draft</p>
                    <p className="text-xs text-muted-foreground">Initial creation - Feb 10, 2026</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Related Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-slate-50 rounded-md">
                  <p className="font-mono text-xs text-blue-700">CTRL-GRC-001</p>
                  <p className="text-xs text-muted-foreground mt-1">Policy Review Control</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-md">
                  <p className="font-mono text-xs text-blue-700">CTRL-GRC-002</p>
                  <p className="text-xs text-muted-foreground mt-1">Compliance Monitoring</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
