"use client"

import { useState, useEffect, useMemo } from "react"
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
  MapPin,
  Eye,
  X,
  CheckSquare,
  Square,
  MinusSquare,
  FileSpreadsheet,
  File,
  Trash2
} from "lucide-react"

interface Document {
  id: string
  title: string
  filename: string
  folder: string
  department: string
  type: string
  status: string
  validatedBy: string | null
  validatedAt: string | null
  frameworks: string[]
  systemNotes: string
  version?: string
  lastUpdated?: string
  requiredDocId?: string
  controls?: string[]
}

interface RegistryData {
  success: boolean
  documents: Document[]
}

const statusOptions = ["Approved", "Draft", "Under Review", "Enhancement Needed", "Missing", "Pending Mapping", "DRAFT (Template)"]
const deptOptions = ["IT", "HR", "OPS", "COM", "RISK", "AUDIT", "BOD", "ADMIN", "AML", "FINANCE", "OPERATIONS", "GEN"]
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
  "Enhancement Needed": "bg-purple-50 text-purple-700 border-purple-200",
  "Missing": "bg-red-50 text-red-700 border-red-200",
  "Pending Mapping": "bg-orange-50 text-orange-700 border-orange-200",
  "DRAFT (Template)": "bg-slate-50 text-slate-700 border-slate-200",
  "DRAFT": "bg-amber-50 text-amber-700 border-amber-200"
}

const deptNames: Record<string, string> = {
  IT: "Information Technology", HR: "Human Resources", OPS: "Operations",
  COM: "Commercial", RISK: "Risk Management", AUDIT: "Internal Audit",
  BOD: "Board of Directors", ADMIN: "Administration", AML: "AML/CFT",
  FINANCE: "Finance", OPERATIONS: "Operations", GEN: "General"
}

function getFileIcon(filename: string) {
  if (!filename) return <FileText className="h-5 w-5 text-slate-400" />
  const ext = filename.split(".").pop()?.toLowerCase()
  if (ext === "pdf") return <FileText className="h-5 w-5 text-red-500" />
  if (ext === "xlsx" || ext === "xls") return <FileSpreadsheet className="h-5 w-5 text-green-600" />
  if (ext === "md") return <FileText className="h-5 w-5 text-blue-500" />
  if (ext === "docx" || ext === "doc") return <FileText className="h-5 w-5 text-blue-700" />
  return <File className="h-5 w-5 text-slate-400" />
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

  // Checkbox selection state
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Preview modal state
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)

  // Auto-map a document to its best-match department based on filename/title/notes keywords
  const autoMapOne = (doc: Document) => {
    setAutoMapping(doc.id)
    const text = `${doc.filename || ""} ${doc.title || ""} ${doc.systemNotes || ""} ${doc.id || ""}`.toLowerCase()
    let bestDept = doc.department
    let bestScore = 0

    for (const [dept, keywords] of Object.entries(MAPPING_KEYWORDS)) {
      const score = keywords.filter(kw => text.includes(kw)).length
      if (score > bestScore) {
        bestScore = score
        bestDept = dept
      }
    }

    // Also check ID prefix pattern
    const idParts = (doc.id || "").toUpperCase().split("-")
    if (idParts.length >= 2) {
      const knownDepts = ["IT","HR","COM","RISK","AUDIT","AUD","BOD","OPS","AML","FIN","FINANCE","OPERATIONS","ADMIN","GEN"]
      if (knownDepts.includes(idParts[0])) bestDept = idParts[0] === "AUD" ? "AUDIT" : idParts[0] === "FIN" ? "FINANCE" : idParts[0]
      else if (knownDepts.includes(idParts[1])) bestDept = idParts[1] === "AUD" ? "AUDIT" : idParts[1] === "FIN" ? "FINANCE" : idParts[1]
    }

    const newStatus = bestScore > 0 || bestDept !== doc.department ? "Draft" : "Enhancement Needed"
    setChanges(prev => ({
      ...prev,
      [doc.id]: { ...prev[doc.id], department: bestDept, status: newStatus }
    }))
    setTimeout(() => setAutoMapping(null), 500)
  }

  const autoMapAll = () => {
    const unmapped = docs.filter(d =>
      d.status === "Pending Mapping" ||
      d.status === "Missing" ||
      (d.filename || "").toLowerCase().includes("pending") ||
      (d.systemNotes || "").toLowerCase().includes("pending") ||
      (d.systemNotes || "").toLowerCase().includes("missing")
    )
    for (const doc of unmapped) {
      autoMapOne(doc)
    }
  }

  // Bulk actions on selected
  const bulkSetStatus = (status: string) => {
    const newChanges = { ...changes }
    selected.forEach(id => {
      newChanges[id] = { ...newChanges[id], status }
    })
    setChanges(newChanges)
  }

  const bulkSetDept = (dept: string) => {
    const newChanges = { ...changes }
    selected.forEach(id => {
      newChanges[id] = { ...newChanges[id], department: dept }
    })
    setChanges(newChanges)
  }

  const bulkAutoMap = () => {
    selected.forEach(id => {
      const doc = docs.find(d => d.id === id)
      if (doc) autoMapOne(doc)
    })
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
    const fn = (d.filename || "").toLowerCase()
    const sn = (d.systemNotes || "").toLowerCase()
    const tt = (d.title || "").toLowerCase()
    const matchSearch = !searchQuery ||
      fn.includes(searchQuery.toLowerCase()) ||
      (d.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      sn.includes(searchQuery.toLowerCase()) ||
      tt.includes(searchQuery.toLowerCase())
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

  const handleStatusChange = (docId: string, newStatus: string) => {
    setChanges(prev => ({ ...prev, [docId]: { ...prev[docId], status: newStatus } }))
  }

  const handleDeptChange = (docId: string, newDept: string) => {
    setChanges(prev => ({ ...prev, [docId]: { ...prev[docId], department: newDept } }))
  }

  const saveOne = async (docId: string, skipRefresh = false) => {
    const change = changes[docId]
    if (!change) return

    setSaving(docId)
    try {
      const doc = docs.find(d => d.id === docId)
      const res = await fetch("/api/registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: docId,
          status: change.status || doc?.status || "Draft",
          department: change.department || doc?.department,
          validatedBy: "Yasser"
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error(`Save failed for ${docId}:`, err)
      }
      if (!skipRefresh) {
        setSaveSuccess(docId)
        setTimeout(() => setSaveSuccess(null), 2000)
        const newChanges = { ...changes }
        delete newChanges[docId]
        setChanges(newChanges)
        fetchDocs()
      }
    } catch (e) { console.error(`Save error for ${docId}:`, e) }
    setSaving(null)
  }

  const saveAll = async () => {
    const ids = Object.keys(changes)
    if (ids.length === 0) return
    setSaving("all")
    const promises = ids.map(id => {
      const change = changes[id]
      const doc = docs.find(d => d.id === id)
      return fetch("/api/registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: id,
          status: change?.status || doc?.status || "Draft",
          department: change?.department || doc?.department,
          validatedBy: "Yasser"
        })
      }).catch(e => console.error(`Batch save error for ${id}:`, e))
    })
    await Promise.all(promises)
    setChanges({})
    setSelected(new Set())
    setSaveSuccess("all")
    setTimeout(() => setSaveSuccess(null), 2000)
    fetchDocs()
    setSaving(null)
  }

  // Bulk save selected
  const saveSelected = async () => {
    const ids = Array.from(selected).filter(id => changes[id])
    if (ids.length === 0) return
    setSaving("selected")
    const promises = ids.map(id => {
      const change = changes[id]
      const doc = docs.find(d => d.id === id)
      return fetch("/api/registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: id,
          status: change?.status || doc?.status || "Draft",
          department: change?.department || doc?.department,
          validatedBy: "Yasser"
        })
      }).catch(e => console.error(`Batch save error for ${id}:`, e))
    })
    await Promise.all(promises)
    const newChanges = { ...changes }
    ids.forEach(id => delete newChanges[id])
    setChanges(newChanges)
    setSelected(new Set())
    setSaveSuccess("all")
    setTimeout(() => setSaveSuccess(null), 2000)
    fetchDocs()
    setSaving(null)
  }

  const pendingCount = Object.keys(changes).length
  const pendingMappingCount = docs.filter(d =>
    d.status === "Pending Mapping" ||
    d.status === "Missing" ||
    (d.filename || "").toLowerCase().includes("pending") ||
    (d.systemNotes || "").toLowerCase().includes("missing")
  ).length

  // Select helpers
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = (deptDocs: Document[]) => {
    const allSelected = deptDocs.every(d => selected.has(d.id))
    setSelected(prev => {
      const next = new Set(prev)
      if (allSelected) {
        deptDocs.forEach(d => next.delete(d.id))
      } else {
        deptDocs.forEach(d => next.add(d.id))
      }
      return next
    })
  }

  const selectAllFiltered = () => {
    const allSelected = filteredDocs.every(d => selected.has(d.id))
    setSelected(prev => {
      const next = new Set(prev)
      if (allSelected) {
        filteredDocs.forEach(d => next.delete(d.id))
      } else {
        filteredDocs.forEach(d => next.add(d.id))
      }
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())

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
            <Button onClick={saveAll} disabled={saving === "all"} className="bg-blue-600 hover:bg-blue-700 gap-2">
              {saving === "all" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save All ({pendingCount} changes)
            </Button>
          )}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid gap-3 md:grid-cols-4">
        {["Approved", "Draft", "Under Review", "Missing"].map(s => {
          const count = docs.filter(d => d.status === s).length
          return (
            <Card key={s} className={`shadow-sm border-none cursor-pointer transition-all ${statusFilter === s ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setStatusFilter(statusFilter === s ? null : s)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s}</p>
                  <p className="text-2xl font-bold text-slate-800">{count}</p>
                </div>
                <Badge variant="outline" className={statusColors[s]}>{docs.length > 0 ? Math.round((count / docs.length) * 100) : 0}%</Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters + Select All */}
      <div className="flex gap-3 items-center">
        <Button variant="outline" size="sm" onClick={selectAllFiltered} className="gap-2 shrink-0">
          {filteredDocs.length > 0 && filteredDocs.every(d => selected.has(d.id))
            ? <CheckSquare className="h-4 w-4 text-blue-600" />
            : filteredDocs.some(d => selected.has(d.id))
            ? <MinusSquare className="h-4 w-4 text-blue-400" />
            : <Square className="h-4 w-4" />}
          Select All
        </Button>
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
        <select
          aria-label="Filter by status"
          className="px-4 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter || ""}
          onChange={e => setStatusFilter(e.target.value || null)}
        >
          <option value="">All Statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Floating Bulk Action Bar */}
      {selected.size > 0 && (
        <div className="sticky top-4 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-xl p-4 flex items-center justify-between text-white animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-5 w-5" />
            <span className="font-semibold">{selected.size} document{selected.size > 1 ? "s" : ""} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              aria-label="Bulk set status"
              className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-sm border border-white/30 focus:outline-none"
              defaultValue=""
              onChange={e => { if (e.target.value) { bulkSetStatus(e.target.value); e.target.value = "" } }}
            >
              <option value="" disabled>Set Status...</option>
              {statusOptions.map(s => <option key={s} value={s} className="text-slate-800">{s}</option>)}
            </select>
            <select
              aria-label="Bulk set department"
              className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-sm border border-white/30 focus:outline-none"
              defaultValue=""
              onChange={e => { if (e.target.value) { bulkSetDept(e.target.value); e.target.value = "" } }}
            >
              <option value="" disabled>Set Dept...</option>
              {deptOptions.map(d => <option key={d} value={d} className="text-slate-800">{deptNames[d] || d}</option>)}
            </select>
            <Button size="sm" variant="secondary" onClick={bulkAutoMap} className="gap-1 bg-white/20 hover:bg-white/30 text-white border-0">
              <Wand2 className="h-3.5 w-3.5" /> Auto Map
            </Button>
            <Button size="sm" variant="secondary" onClick={saveSelected} disabled={saving === "selected"}
              className="gap-1 bg-white/20 hover:bg-white/30 text-white border-0">
              {saving === "selected" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save Selected
            </Button>
            <div className="w-px h-6 bg-white/30 mx-1" />
            <Button size="sm" variant="ghost" onClick={clearSelection} className="text-white/80 hover:text-white hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Success toast */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">{saveSuccess === "all" ? "All changes saved!" : `Saved ${saveSuccess}`}</span>
        </div>
      )}

      {/* Document Groups */}
      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([dept, groupDocs]) => {
        const allGroupSelected = groupDocs.every(d => selected.has(d.id))
        const someGroupSelected = groupDocs.some(d => selected.has(d.id))

        return (
          <Card key={dept} className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleSelectAll(groupDocs)} className="hover:scale-110 transition-transform">
                    {allGroupSelected
                      ? <CheckSquare className="h-5 w-5 text-blue-600" />
                      : someGroupSelected
                      ? <MinusSquare className="h-5 w-5 text-blue-400" />
                      : <Square className="h-5 w-5 text-slate-400" />}
                  </button>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {deptNames[dept] || dept}
                    <Badge variant="outline" className="text-xs">{groupDocs.length} docs</Badge>
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  {["Approved", "Draft", "Under Review", "Enhancement Needed", "Missing"].map(s => {
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
                  const isSelected = selected.has(doc.id)

                  return (
                    <div key={doc.id} className={`px-6 py-3 flex items-center gap-3 ${isSelected ? "bg-blue-50/80" : hasChange ? "bg-amber-50/50" : "hover:bg-slate-50"} transition-all`}>
                      {/* Checkbox */}
                      <button onClick={() => toggleSelect(doc.id)} className="shrink-0 hover:scale-110 transition-transform">
                        {isSelected
                          ? <CheckSquare className="h-4.5 w-4.5 text-blue-600" />
                          : <Square className="h-4.5 w-4.5 text-slate-400" />}
                      </button>

                      {/* File icon */}
                      <div className="shrink-0">
                        {getFileIcon(doc.filename)}
                      </div>

                      {/* ID & Type */}
                      <div className="w-24 flex-shrink-0">
                        <Badge variant="outline" className="text-[10px] font-mono">{doc.id}</Badge>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{doc.type}</p>
                      </div>

                      {/* Title, Filename & Notes */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate" title={doc.title || doc.filename}>{doc.title || doc.filename || doc.id}</p>
                        {doc.filename && doc.filename !== doc.title && doc.filename !== "(Pending Mapping)" && (
                          <p className="text-[11px] text-muted-foreground/70 truncate" title={doc.filename}>📄 {doc.filename}</p>
                        )}
                        {(doc.systemNotes || "") && (
                          <p className="text-xs text-muted-foreground truncate" title={doc.systemNotes || ""}>
                            <Sparkles className="inline h-3 w-3 mr-1 text-purple-400" />
                            {doc.systemNotes || ""}
                          </p>
                        )}
                        {(doc.frameworks?.length ?? 0) > 0 && (
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

                      {/* Preview Button */}
                      <Button size="sm" variant="ghost" onClick={() => setPreviewDoc(doc)}
                        className="text-slate-600 hover:bg-slate-100" title="Preview document">
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Auto Map Button (for unmapped/missing docs) */}
                      {(doc.status === "Pending Mapping" ||
                        doc.status === "Missing" ||
                        (doc.filename || "").toLowerCase().includes("pending") ||
                        (doc.systemNotes || "").toLowerCase().includes("missing")) && !hasChange && (
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
        )
      })}

      {/* =================== PREVIEW MODAL =================== */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewDoc(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="flex items-center gap-3">
                {getFileIcon(previewDoc.filename)}
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{previewDoc.title || previewDoc.filename || previewDoc.id}</h2>
                  <p className="text-xs text-muted-foreground">{previewDoc.id} · {previewDoc.type}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setPreviewDoc(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Department</p>
                  <Badge variant="outline" className="text-xs">{deptNames[previewDoc.department] || previewDoc.department}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                  <Badge variant="outline" className={`text-xs ${statusColors[previewDoc.status] || ""}`}>{previewDoc.status}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Version</p>
                  <p className="text-sm text-slate-800">{previewDoc.version || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Last Updated</p>
                  <p className="text-sm text-slate-800">{previewDoc.lastUpdated || "—"}</p>
                </div>
              </div>

              {/* File info */}
              <Card className="border-slate-200">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> File Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">Filename</p>
                      <p className="text-slate-800 truncate">{previewDoc.filename || "Not mapped"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">Folder</p>
                      <p className="text-slate-800 truncate">{previewDoc.folder || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">Document Type</p>
                      <p className="text-slate-800 capitalize">{previewDoc.type}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">Required Doc ID</p>
                      <p className="text-slate-800 font-mono text-xs">{previewDoc.requiredDocId || "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Validation info */}
              {previewDoc.validatedAt && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-green-800 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Validation Record
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      Validated by <strong>{previewDoc.validatedBy}</strong> on <strong>{previewDoc.validatedAt}</strong>
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* System Notes */}
              {previewDoc.systemNotes && (
                <Card className="border-purple-200 bg-purple-50/50">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> System Notes
                    </h3>
                    <p className="text-sm text-purple-700 mt-1">{previewDoc.systemNotes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Frameworks */}
              {(previewDoc.frameworks?.length ?? 0) > 0 && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">Mapped Frameworks</h3>
                    <div className="flex flex-wrap gap-2">
                      {previewDoc.frameworks.map(f => (
                        <Badge key={f} variant="outline" className="text-xs bg-white">{f}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Controls */}
              {(previewDoc.controls?.length ?? 0) > 0 && (
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Mapped Controls</h3>
                    <div className="flex flex-wrap gap-2">
                      {previewDoc.controls!.map(c => (
                        <Badge key={c} variant="outline" className="text-xs font-mono">{c}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Document Content Preview for markdown files */}
              {previewDoc.filename?.endsWith(".md") && (
                <DocumentContentPreview folder={previewDoc.folder} filename={previewDoc.filename} />
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {previewDoc.filename?.endsWith(".pdf") && "📄 PDF document — open externally to view content"}
                {previewDoc.filename?.endsWith(".xlsx") && "📊 Excel file — open externally to view content"}
                {previewDoc.filename?.endsWith(".md") && "📝 Markdown file — content shown above"}
                {!previewDoc.filename?.match(/\.(pdf|xlsx|xls|md|docx|doc)$/i) && "Document details shown above"}
              </p>
              <Button variant="outline" onClick={() => setPreviewDoc(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Markdown content preview sub-component
function DocumentContentPreview({ folder, filename }: { folder: string; filename: string }) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to fetch markdown content via a simple API
    setLoading(true)
    fetch(`/api/registry?action=preview&folder=${encodeURIComponent(folder)}&filename=${encodeURIComponent(filename)}`)
      .then(r => r.json())
      .then(d => {
        if (d.content) setContent(d.content)
        else setContent(null)
      })
      .catch(() => setContent(null))
      .finally(() => setLoading(false))
  }, [folder, filename])

  if (loading) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-400 mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Loading content...</p>
        </CardContent>
      </Card>
    )
  }

  if (!content) return null

  return (
    <Card className="border-slate-200">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4" /> Document Content
        </h3>
        <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-96">
          <pre className="text-sm text-slate-100 whitespace-pre-wrap font-mono leading-relaxed">{content}</pre>
        </div>
      </CardContent>
    </Card>
  )
}
