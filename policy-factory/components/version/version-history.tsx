"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock,
  User,
  CheckCircle2,
  Download,
  GitCompare
} from "lucide-react"

interface Version {
  version: string
  date: string
  author: string
  approver: string
  status: string
  changes: string
  file: string
}

interface VersionHistoryProps {
  documentCode: string
  documentTitle: string
  currentVersion: string
  versions: Version[]
}

export default function VersionHistory({ 
  documentCode, 
  documentTitle, 
  currentVersion, 
  versions 
}: VersionHistoryProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">{documentTitle}</h3>
        <p className="text-sm text-muted-foreground">
          Document Code: {documentCode} | Current Version: {currentVersion}
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {versions.map((version, index) => (
          <div key={version.version} className="relative">
            <Card className={`
              border-2 transition-all
              ${version.status === 'Current' 
                ? 'border-shari-purple-600 bg-shari-purple-50' 
                : 'border-slate-200 hover:border-shari-teal-300'
              }
            `}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${version.status === 'Current' 
                        ? 'bg-shari-purple-600 text-white' 
                        : 'bg-slate-200 text-slate-600'
                      }
                    `}>
                      {version.status === 'Current' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span className="font-semibold text-sm">v{version.version}</span>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">Version {version.version}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{version.changes}</p>
                    </div>
                  </div>
                  <Badge className={
                    version.status === 'Current' 
                      ? 'bg-shari-purple-600' 
                      : 'bg-slate-500'
                  }>
                    {version.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {new Date(version.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Author:</span>
                    <span className="font-medium">{version.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Approved by:</span>
                    <span className="font-medium">{version.approver}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download v{version.version}
                  </Button>
                  {index > 0 && (
                    <Button size="sm" variant="outline">
                      <GitCompare className="h-4 w-4 mr-2" />
                      Compare with v{versions[index - 1].version}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Connector Line */}
            {index < versions.length - 1 && (
              <div className="absolute left-5 top-[calc(100%)] h-3 w-0.5 bg-slate-300" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
