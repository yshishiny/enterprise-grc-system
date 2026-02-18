"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HelpCircle,
  FolderOpen,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  Shield,
  Save,
  ExternalLink,
  Eye,
  Edit3,
  Sparkles
} from "lucide-react"

interface AuditDocument {
  status: string
  name: string
  extension: string
  sizeKB: number
  lastModified: string
  relativePath: string
}

interface RegistryDoc {
  id: string
  filename: string
  folder: string
  department: string
  type: string
  status: string
  validatedBy: string | null
  validatedAt: string | null
  frameworks: string[]
  systemNotes: string
}

interface AuditData {
  success: boolean
  scanDate: string
  total: number
  statusSummary: { status: string; count: number; percent: number }[]
  folderSummary: any[]
  extensionBreakdown: { ext: string; count: number }[]
  documents: AuditDocument[]
}

const statusOptions = ["Approved", "Draft", "Under Review", "Enhancement Needed"]
const deptOptions = ["IT", "HR", "OPS", "COM", "RISK", "AUDIT", "BOD", "ADMIN"]

const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  "Approved":           { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2, label: "Approved" },
  "Draft":              { color: "text-amber-600",   bg: "bg-amber-50 border-amber-200",     icon: Edit3,        label: "Draft" },
  "Under Review":       { color: "text-blue-600",    bg: "bg-blue-50 border-blue-200",       icon: Clock,        label: "Under Review" },
  "Enhancement Needed": { color: "text-purple-600",  bg: "bg-purple-50 border-purple-200",   icon: Sparkles,     label: "Enhancement Needed" },
  "Unknown":            { color: "text-slate-500",   bg: "bg-slate-50 border-slate-200",     icon: HelpCircle,   label: "Unknown" },
  "Old":                { color: "text-red-600",     bg: "bg-red-50 border-red-200",         icon: AlertTriangle, label: "Old" },
}

const deptNames: Record<string, string> = {
  IT: "Information Technology", HR: "Human Resources", OPS: "Operations",
  COM: "Commercial", RISK: "Risk Management", AUDIT: "Internal Audit",
  BOD: "Board of Directors", ADMIN: "Administration"
}

export default function AuditPage() {
  const [auditData, setAuditData] = useState<AuditData | null>(null)
  const [registryDocs, setRegistryDocs] = useState<RegistryDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [viewingDoc, setViewingDoc] = useState<string | null>(null)
  const [changes, setChanges] = useState<Record<string, { status?: string; department?: string }>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/audit").then(r => r.json()),
      fetch("/api/registry").then(r => r.json())
    ]).then(([audit, registry]) => {
      if (audit.success) setAuditData(audit)
      if (registry.success) setRegistryDocs(registry.documents || [])
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Match audit scan file to registry document
  const findRegistryMatch = (auditDoc: AuditDocument): RegistryDoc | undefined => {
    return registryDocs.find(rd => 
      rd.filename === auditDoc.name ||
      auditDoc.relativePath?.includes(rd.filename) ||
      rd.filename.includes(auditDoc.name.replace(auditDoc.extension, '').trim())
    )
  }

  // Get effective status (registry overrides scan)
  const getEffectiveStatus = (auditDoc: AuditDocument): string => {
    const match = findRegistryMatch(auditDoc)
    if (changes[auditDoc.name]?.status) return changes[auditDoc.name].status!
    if (match) return match.status
    return auditDoc.status
  }

  const getEffectiveDept = (auditDoc: AuditDocument): string => {
    const match = findRegistryMatch(auditDoc)
    if (changes[auditDoc.name]?.department) return changes[auditDoc.name].department!
    if (match) return match.department
    return ""
  }

  const handleStatusChange = (docName: string, newStatus: string) => {
    setChanges(prev => ({ ...prev, [docName]: { ...prev[docName], status: newStatus } }))
  }

  const handleDeptChange = (docName: string, newDept: string) => {
    setChanges(prev => ({ ...prev, [docName]: { ...prev[docName], department: newDept } }))
  }

  const saveDocStatus = async (auditDoc: AuditDocument) => {
    const match = findRegistryMatch(auditDoc)
    const change = changes[auditDoc.name]
    if (!match || !change) return

    setSaving(auditDoc.name)
    try {
      await fetch("/api/registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: match.id,
          status: change.status || match.status,
          department: change.department || match.department,
          validatedBy: "Yasser"
        })
      })
      setSaveSuccess(auditDoc.name)
      setTimeout(() => setSaveSuccess(null), 2000)
      // Refresh registry
      const res = await fetch("/api/registry").then(r => r.json())
      if (res.success) setRegistryDocs(res.documents)
      const newChanges = { ...changes }
      delete newChanges[auditDoc.name]
      setChanges(newChanges)
    } catch {}
    setSaving(null)
  }

  if (loading || !auditData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
          <p className="text-muted-foreground text-lg">Loading audit data &amp; document registry...</p>
        </div>
      </div>
    )
  }

  // Compute stats from effective statuses
  const docs = auditData.documents
  const effectiveStats: Record<string, number> = {}
  docs.forEach(d => {
    const s = getEffectiveStatus(d)
    effectiveStats[s] = (effectiveStats[s] || 0) + 1
  })

  const totalDocs = docs.length
  const approvedCount = effectiveStats["Approved"] || 0
  const healthScore = totalDocs > 0 ? Math.round((approvedCount / totalDocs) * 100) : 0

  // Filter
  const filteredDocs = docs.filter(d => {
    const matchSearch = !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.relativePath?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (findRegistryMatch(d)?.systemNotes || "").toLowerCase().includes(searchQuery.toLowerCase())
    const effStatus = getEffectiveStatus(d)
    const matchStatus = !statusFilter || effStatus === statusFilter
    return matchSearch && matchStatus
  })

  // Group by folder
  const folderGroups: Record<string, AuditDocument[]> = {}
  filteredDocs.forEach(d => {
    const parts = d.relativePath?.split("\\") || []
    const folder = parts.length > 1 ? parts[0] : "(root)"
    if (!folderGroups[folder]) folderGroups[folder] = []
    folderGroups[folder].push(d)
  })

  const toggleFolder = (f: string) => {
    const next = new Set(expandedFolders)
    next.has(f) ? next.delete(f) : next.add(f)
    setExpandedFolders(next)
  }

  const pendingCount = Object.keys(changes).length

  // Encode path for Nextcloud
  const getNextcloudUrl = (doc: AuditDocument) => {
    // Local file path for viewing
    const basePath = "C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures"
    const fullPath = doc.relativePath ? `${basePath}\\${doc.relativePath}` : `${basePath}\\${doc.name}`
    return fullPath
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Document Audit &amp; Validation</h1>
          <p className="text-muted-foreground mt-1">
            Scanned {auditData.scanDate} • {totalDocs} documents • {registryDocs.length} in registry
          </p>
        </div>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={async () => {
              for (const docName of Object.keys(changes)) {
                const doc = docs.find(d => d.name === docName)
                if (doc) await saveDocStatus(doc)
              }
            }}>
              <Save className="h-4 w-4" /> Save All ({pendingCount})
            </Button>
          )}
        </div>
      </div>

      {/* Health Score + Status Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        {/* Health Score */}
        <Card className="shadow-sm border-none bg-gradient-to-br from-white to-slate-50">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 mb-3">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke={healthScore >= 80 ? "#22c55e" : healthScore >= 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="8" strokeDasharray={`${healthScore * 2.64} 264`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{healthScore}</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-700">Health Score</p>
            <p className="text-xs text-muted-foreground">
              {healthScore >= 80 ? "Good" : healthScore >= 50 ? "Needs Work" : "Critical"}
            </p>
          </CardContent>
        </Card>

        {/* Status Cards */}
        {["Approved", "Draft", "Under Review", "Enhancement Needed"].map(s => {
          const cfg = statusConfig[s]
          const count = effectiveStats[s] || 0
          const pct = totalDocs > 0 ? Math.round((count / totalDocs) * 100) : 0
          const Icon = cfg.icon
          const isActive = statusFilter === s
          return (
            <Card key={s}
              className={`shadow-sm border cursor-pointer transition-all hover:shadow-md ${isActive ? "ring-2 ring-blue-500" : ""} ${cfg.bg}`}
              onClick={() => setStatusFilter(isActive ? null : s)}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${cfg.color}`} />
                  <Badge variant="outline" className={`text-xs ${cfg.bg}`}>{pct}%</Badge>
                </div>
                <div className="text-2xl font-bold text-slate-800">{count}</div>
                <p className="text-xs text-muted-foreground">{cfg.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search by filename, path, or notes..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Document Folders */}
      {Object.entries(folderGroups).sort(([, a], [, b]) => b.length - a.length).map(([folder, folderDocs]) => {
        const isExpanded = expandedFolders.has(folder) || Object.keys(folderGroups).length <= 3
        const folderApproved = folderDocs.filter(d => getEffectiveStatus(d) === "Approved").length
        const folderDraft = folderDocs.filter(d => getEffectiveStatus(d) === "Draft").length
        const folderPct = Math.round((folderApproved / folderDocs.length) * 100)

        return (
          <Card key={folder} className="shadow-sm">
            {/* Folder Header */}
            <div
              className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleFolder(folder)}
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-slate-800">{folder}</h3>
                  <p className="text-xs text-muted-foreground">{folderDocs.length} documents • {folderPct}% approved</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {folderApproved > 0 && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">{folderApproved} ✓</Badge>}
                {folderDraft > 0 && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">{folderDraft} ✎</Badge>}
                {/* Progress bar */}
                <div className="w-24 bg-slate-200 rounded-full h-2 hidden md:block">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all" style={{ width: `${folderPct}%` }} />
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>

            {/* Expanded Document List */}
            {isExpanded && (
              <CardContent className="p-0 border-t">
                <div className="divide-y">
                  {folderDocs.map((doc, idx) => {
                    const match = findRegistryMatch(doc)
                    const effStatus = getEffectiveStatus(doc)
                    const effDept = getEffectiveDept(doc)
                    const cfg = statusConfig[effStatus] || statusConfig["Unknown"]
                    const hasChange = !!changes[doc.name]
                    const isSaving = saving === doc.name
                    const isSuccess = saveSuccess === doc.name
                    const isViewing = viewingDoc === doc.name

                    return (
                      <div key={idx}>
                        <div className={`px-6 py-3 flex items-center gap-3 ${hasChange ? "bg-blue-50/50" : "hover:bg-slate-50"} transition-all`}>
                          {/* Status Icon */}
                          <cfg.icon className={`h-4 w-4 flex-shrink-0 ${cfg.color}`} />

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-800 truncate" title={doc.name}>{doc.name}</p>
                              <Badge variant="outline" className="text-[9px] px-1 py-0">{doc.extension}</Badge>
                              <span className="text-[10px] text-muted-foreground">{doc.sizeKB.toFixed(0)} KB</span>
                            </div>
                            {match && (
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">{match.id}</Badge>
                                <span className="text-[10px] text-muted-foreground truncate">{match.systemNotes}</span>
                              </div>
                            )}
                            {match?.frameworks && match.frameworks.length > 0 && (
                              <div className="flex gap-1 mt-0.5">
                                {match.frameworks.map(f => (
                                  <Badge key={f} variant="outline" className="text-[8px] px-1 py-0 bg-purple-50 border-purple-200 text-purple-600">{f}</Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Department Select */}
                          {match && (
                            <select
                              title="Department"
                              className="px-2 py-1.5 rounded border text-xs bg-white focus:ring-2 focus:ring-blue-500 w-20"
                              value={effDept}
                              onChange={e => handleDeptChange(doc.name, e.target.value)}
                            >
                              {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          )}

                          {/* Status Select */}
                          <select
                            title="Status"
                            className={`px-2 py-1.5 rounded border text-xs font-medium focus:ring-2 focus:ring-blue-500 w-40 ${cfg.bg}`}
                            value={effStatus}
                            onChange={e => handleStatusChange(doc.name, e.target.value)}
                          >
                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>

                          {/* Action Buttons */}
                          <div className="flex gap-1 flex-shrink-0">
                            {/* View Document */}
                            <Button size="sm" variant="ghost" title="View document"
                              onClick={() => setViewingDoc(isViewing ? null : doc.name)}
                              className="text-blue-600 hover:bg-blue-50">
                              <Eye className="h-4 w-4" />
                            </Button>

                            {/* Save */}
                            {hasChange && match && (
                              <Button size="sm" variant="ghost" onClick={() => saveDocStatus(doc)} disabled={isSaving}
                                className={isSuccess ? "text-green-600" : "text-blue-600"}>
                                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                              </Button>
                            )}

                            {/* Validated info */}
                            {!hasChange && match?.validatedAt && (
                              <span className="text-[9px] text-muted-foreground px-1 flex items-center">
                                ✓ {match.validatedBy} {match.validatedAt}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Document Preview Panel */}
                        {isViewing && (
                          <div className="px-6 py-4 bg-slate-50 border-t border-dashed">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-blue-500" /> Document Details
                                </h4>
                                <div className="text-xs space-y-1.5 bg-white rounded-lg p-3 border">
                                  <div className="flex justify-between"><span className="text-muted-foreground">Filename</span><span className="font-medium">{doc.name}</span></div>
                                  <div className="flex justify-between"><span className="text-muted-foreground">Extension</span><span className="font-medium">{doc.extension}</span></div>
                                  <div className="flex justify-between"><span className="text-muted-foreground">Size</span><span className="font-medium">{doc.sizeKB.toFixed(1)} KB</span></div>
                                  <div className="flex justify-between"><span className="text-muted-foreground">Last Modified</span><span className="font-medium">{doc.lastModified}</span></div>
                                  <div className="flex justify-between"><span className="text-muted-foreground">Path</span><span className="font-medium truncate max-w-[200px]" title={doc.relativePath}>{doc.relativePath || doc.name}</span></div>
                                  {match && (
                                    <>
                                      <div className="border-t pt-1.5 mt-1.5"></div>
                                      <div className="flex justify-between"><span className="text-muted-foreground">Registry ID</span><span className="font-mono font-medium">{match.id}</span></div>
                                      <div className="flex justify-between"><span className="text-muted-foreground">Department</span><span className="font-medium">{deptNames[match.department] || match.department}</span></div>
                                      <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium capitalize">{match.type}</span></div>
                                      <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                                        <Badge variant="outline" className={`text-[10px] ${statusConfig[match.status]?.bg || ""}`}>{match.status}</Badge>
                                      </div>
                                      {match.validatedBy && (
                                        <div className="flex justify-between"><span className="text-muted-foreground">Validated</span><span className="font-medium">{match.validatedBy} ({match.validatedAt})</span></div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-purple-500" /> System Analysis
                                </h4>
                                <div className="bg-white rounded-lg p-3 border space-y-2">
                                  {match ? (
                                    <>
                                      <p className="text-xs text-slate-600">{match.systemNotes}</p>
                                      {match.frameworks.length > 0 && (
                                        <div>
                                          <p className="text-[10px] text-muted-foreground mb-1">Framework Alignment</p>
                                          <div className="flex gap-1 flex-wrap">
                                            {match.frameworks.map(f => (
                                              <Badge key={f} variant="outline" className="text-[10px] bg-purple-50 border-purple-200 text-purple-600">{f}</Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">Not yet mapped in registry. Set status and department to add.</p>
                                  )}
                                </div>

                                <Button size="sm" variant="outline" className="w-full gap-2 text-xs"
                                  onClick={() => {
                                    const filePath = getNextcloudUrl(doc)
                                    window.open(`file:///${filePath.replace(/\\/g, '/')}`, '_blank')
                                  }}>
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  Open Document in Nextcloud
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
