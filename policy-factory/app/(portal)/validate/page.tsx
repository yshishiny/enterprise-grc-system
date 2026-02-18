"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Save,
  Filter,
  FileText,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Wand2,
  MapPin
} from "lucide-react"

interface Document {
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

interface RegistryData {
  success: boolean
  documents: Document[]
}

const statusOptions = ["Approved", "Draft", "Under Review", "Enhancement Needed", "Pending Mapping"]
const deptOptions = ["IT", "HR", "OPS", "COM", "RISK", "AUDIT", "BOD", "ADMIN", "AML", "FINANCE", "OPERATIONS"]
const MAPPING_KEYWORDS: Record<string, string[]> = {
  HR: ["hr", "human", "employee", "onboard", "hiring", "payroll", "leave", "performance", "training", "personnel", "labor", "labour", "عمل", "موظف", "تعيين", "أداء"],
  IT: ["it", "cyber", "security", "access", "network", "data", "backup", "incident", "patch", "vulnerability", "password", "encryption", "firewall", "media", "asset", "information"],
  AML: ["aml", "cft", "kyc", "sanction", "screening", "suspicious", "transaction", "monitoring", "pep", "terrorism", "laundering", "غسل"],
  RISK: ["risk", "bcm", "bcp", "disaster", "continuity", "assessment", "appetite", "مخاطر"],
  AUDIT: ["audit", "internal", "finding", "recommendation", "capa", "universe", "تدقيق", "مراجعة"],
  FINANCE: ["finance", "budget", "tax", "accounting", "treasury", "payment", "procurement", "مالية", "ضريب"],
  OPERATIONS: ["operation", "process", "procedure", "sop", "workflow", "quality", "complaint", "إجراء", "عملية"],
  COM: ["credit", "loan", "customer", "product", "commercial", "collection", "ائتمان", "تمويل"],
}
const statusColors: Record<string, string> = {
  "Approved": "bg-green-50 text-green-700 border-green-200",
  "Draft": "bg-amber-50 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
  "Enhancement Needed": "bg-purple-50 text-purple-700 border-purple-200"
}

export default function ValidatePage() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deptFilter, setDeptFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [changes, setChanges] = useState<Record<string, { status?: string; department?: string }>>({})
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [autoMapping, setAutoMapping] = useState<string | null>(null)

  // Auto-map a document to its best-match department based on filename/notes keywords
  const autoMapOne = (doc: Document) => {
    setAutoMapping(doc.id)
    const text = `${doc.filename} ${doc.systemNotes} ${doc.id}`.toLowerCase()
    let bestDept = doc.department
    let bestScore = 0

    for (const [dept, keywords] of Object.entries(MAPPING_KEYWORDS)) {
      const score = keywords.filter(kw => text.includes(kw)).length
      if (score > bestScore) {
        bestScore = score
        bestDept = dept
      }
    }

    // Apply mapping
    const newStatus = bestScore > 0 ? "Draft" : "Enhancement Needed"
    setChanges(prev => ({
      ...prev,
      [doc.id]: { ...prev[doc.id], department: bestDept, status: newStatus }
    }))
    setTimeout(() => setAutoMapping(null), 500)
  }

  const autoMapAll = () => {
    const pending = docs.filter(d =>
      d.filename.toLowerCase().includes("pending") ||
      d.systemNotes.toLowerCase().includes("pending") ||
      d.status === "Pending Mapping"
    )
    for (const doc of pending) {
      autoMapOne(doc)
    }
  }

  const fetchDocs = () => {
    setLoading(true)
    fetch("/api/registry")
      .then(r => r.json())
      .then(d => { if (d.success) setDocs(d.documents) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchDocs() }, [])

  const filteredDocs = docs.filter(d => {
    const matchSearch = !searchQuery ||
      d.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.systemNotes.toLowerCase().includes(searchQuery.toLowerCase())
    const matchDept = !deptFilter || d.department === deptFilter
    const matchStatus = !statusFilter || d.status === statusFilter
    return matchSearch && matchDept && matchStatus
  })

  // Group by department
  const grouped: Record<string, Document[]> = {}
  filteredDocs.forEach(d => {
    const dept = changes[d.id]?.department || d.department
    if (!grouped[dept]) grouped[dept] = []
    grouped[dept].push(d)
  })

  const deptNames: Record<string, string> = {
    IT: "Information Technology", HR: "Human Resources", OPS: "Operations",
    COM: "Commercial", RISK: "Risk Management", AUDIT: "Internal Audit",
    BOD: "Board of Directors", ADMIN: "Administration"
  }

  const handleStatusChange = (docId: string, newStatus: string) => {
    setChanges(prev => ({ ...prev, [docId]: { ...prev[docId], status: newStatus } }))
  }

  const handleDeptChange = (docId: string, newDept: string) => {
    setChanges(prev => ({ ...prev, [docId]: { ...prev[docId], department: newDept } }))
  }

  const saveOne = async (docId: string) => {
    const change = changes[docId]
    if (!change) return

    setSaving(docId)
    try {
      const doc = docs.find(d => d.id === docId)
      await fetch("/api/registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: docId,
          status: change.status || doc?.status,
          department: change.department,
          validatedBy: "Yasser"
        })
      })
      setSaveSuccess(docId)
      setTimeout(() => setSaveSuccess(null), 2000)
      // Refresh
      const newChanges = { ...changes }
      delete newChanges[docId]
      setChanges(newChanges)
      fetchDocs()
    } catch { }
    setSaving(null)
  }

  const saveAll = async () => {
    const ids = Object.keys(changes)
    for (const id of ids) {
      await saveOne(id)
    }
  }

  const pendingCount = Object.keys(changes).length
  const pendingMappingCount = docs.filter(d =>
    d.filename.toLowerCase().includes("pending") ||
    d.systemNotes.toLowerCase().includes("pending") ||
    d.status === "Pending Mapping"
  ).length

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
          <p className="text-muted-foreground text-lg">Loading document registry...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Document Validation</h1>
          <p className="text-muted-foreground mt-1">Set the official status of each policy and procedure</p>
        </div>
        <div className="flex gap-2">
          {pendingMappingCount > 0 && (
            <Button onClick={autoMapAll} variant="outline" className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50">
              <Wand2 className="h-4 w-4" />
              Auto Map All ({pendingMappingCount})
            </Button>
          )}
          {pendingCount > 0 && (
            <Button onClick={saveAll} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Save className="h-4 w-4" />
              Save All ({pendingCount} changes)
            </Button>
          )}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid gap-3 md:grid-cols-4">
        {statusOptions.map(s => {
          const count = docs.filter(d => d.status === s).length
          return (
            <Card key={s} className={`shadow-sm border-none cursor-pointer transition-all ${statusFilter === s ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setStatusFilter(statusFilter === s ? null : s)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s}</p>
                  <p className="text-2xl font-bold text-slate-800">{count}</p>
                </div>
                <Badge variant="outline" className={statusColors[s]}>{Math.round((count / docs.length) * 100)}%</Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search documents by name, ID, or notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter by department"
          className="px-4 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={deptFilter || ""}
          onChange={e => setDeptFilter(e.target.value || null)}
        >
          <option value="">All Departments</option>
          {deptOptions.map(d => <option key={d} value={d}>{deptNames[d] || d}</option>)}
        </select>
      </div>

      {/* Document Groups */}
      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([dept, groupDocs]) => (
        <Card key={dept} className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {deptNames[dept] || dept}
                <Badge variant="outline" className="text-xs">{groupDocs.length} docs</Badge>
              </CardTitle>
              <div className="flex gap-1">
                {["Approved", "Draft", "Under Review", "Enhancement Needed"].map(s => {
                  const c = groupDocs.filter(d => (changes[d.id]?.status || d.status) === s).length
                  return c > 0 ? <Badge key={s} variant="outline" className={`text-[10px] ${statusColors[s]}`}>{c} {s.split(" ")[0]}</Badge> : null
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {groupDocs.map(doc => {
                const currentStatus = changes[doc.id]?.status || doc.status
                const currentDept = changes[doc.id]?.department || doc.department
                const hasChange = !!changes[doc.id]
                const isSaving = saving === doc.id
                const isSuccess = saveSuccess === doc.id

                return (
                  <div key={doc.id} className={`px-6 py-3 flex items-center gap-4 ${hasChange ? "bg-blue-50/50" : "hover:bg-slate-50"} transition-all`}>
                    {/* ID & Type */}
                    <div className="w-24 flex-shrink-0">
                      <Badge variant="outline" className="text-[10px] font-mono">{doc.id}</Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{doc.type}</p>
                    </div>

                    {/* Filename & Notes */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate" title={doc.filename}>{doc.filename}</p>
                      <p className="text-xs text-muted-foreground truncate" title={doc.systemNotes}>
                        <Sparkles className="inline h-3 w-3 mr-1 text-purple-400" />
                        {doc.systemNotes}
                      </p>
                      {doc.frameworks.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {doc.frameworks.map(f => <Badge key={f} variant="outline" className="text-[9px] px-1 py-0">{f}</Badge>)}
                        </div>
                      )}
                    </div>

                    {/* Department Select */}
                    <select
                      aria-label="Change department"
                      className="px-2 py-1.5 rounded border text-xs bg-white focus:ring-2 focus:ring-blue-500 w-20"
                      value={currentDept}
                      onChange={e => handleDeptChange(doc.id, e.target.value)}
                    >
                      {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    {/* Status Select */}
                    <select
                      aria-label="Change status"
                      className={`px-2 py-1.5 rounded border text-xs font-medium focus:ring-2 focus:ring-blue-500 w-36 ${statusColors[currentStatus] || ""}`}
                      value={currentStatus}
                      onChange={e => handleStatusChange(doc.id, e.target.value)}
                    >
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {/* Auto Map Button (for pending-mapping docs) */}
                    {(doc.filename.toLowerCase().includes("pending") ||
                      doc.systemNotes.toLowerCase().includes("pending") ||
                      doc.status === "Pending Mapping") && !hasChange && (
                      <Button size="sm" variant="ghost" onClick={() => autoMapOne(doc)}
                        disabled={autoMapping === doc.id}
                        className="text-purple-600 hover:bg-purple-50" title="Auto-map to department">
                        {autoMapping === doc.id
                          ? <RefreshCw className="h-4 w-4 animate-spin" />
                          : <><Wand2 className="h-3.5 w-3.5 mr-1" /><span className="text-xs">Map</span></>}
                      </Button>
                    )}

                    {/* Save Button */}
                    {hasChange && (
                      <Button size="sm" variant="ghost" onClick={() => saveOne(doc.id)} disabled={isSaving}
                        className={isSuccess ? "text-green-600" : "text-blue-600"}>
                        {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                      </Button>
                    )}

                    {/* Validated info */}
                    {!hasChange && doc.validatedAt && (
                      <p className="text-[10px] text-muted-foreground w-20 text-right">
                        ✓ {doc.validatedBy}<br />{doc.validatedAt}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
