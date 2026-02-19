"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft, Building2, FileText, CheckCircle2,
  TrendingUp, Eye, Edit3, Clock, Sparkles, Shield,
  ExternalLink, AlertTriangle, RefreshCw, Save
} from "lucide-react"

interface Doc {
  id: string
  filename: string
  folder: string
  department: string
  type: string
  status: string
  validatedBy: string | null
  validatedAt: string | null
  frameworks: string[]
  obligations: string[]
  systemNotes: string
}

interface DeptData {
  code: string
  totalPolicies: number
  completedPolicies: number
  totalProcedures: number
  completedProcedures: number
  completionPct: number
  approved: number
  draft: number
  review: number
  enhancement: number
  frameworks: string[]
  documents: Doc[]
}

const deptMeta: Record<string, { name: string; nameAr: string; description: string; descriptionAr: string; color: string; gradient: string }> = {
  IT:         { name: "Information Technology", nameAr: "تقنية المعلومات",      description: "IT operations, security, and digital services governance", descriptionAr: "عمليات تقنية المعلومات والأمن وحوكمة الخدمات الرقمية", color: "blue",    gradient: "from-blue-50 to-white" },
  HR:         { name: "Human Resources",       nameAr: "الموارد البشرية",      description: "Employee management, recruitment, and labor compliance", descriptionAr: "إدارة الموظفين والتوظيف والامتثال لقانون العمل", color: "green",   gradient: "from-green-50 to-white" },
  OPS:        { name: "Admin & Support",       nameAr: "الدعم والإدارة",       description: "Administrative services and facility management", descriptionAr: "الخدمات الإدارية وإدارة المرافق", color: "slate",   gradient: "from-slate-100 to-white" },
  COM:        { name: "Commercial",            nameAr: "الإدارة التجارية",     description: "Sales, credit, pricing, customer management and commercial policies", descriptionAr: "المبيعات والائتمان والتسعير وإدارة العملاء والسياسات التجارية", color: "teal",    gradient: "from-teal-50 to-white" },
  RISK:       { name: "Risk Management",       nameAr: "إدارة المخاطر",        description: "Enterprise risk assessment and mitigation", descriptionAr: "تقييم المخاطر المؤسسية والتخفيف من حدتها", color: "red",     gradient: "from-red-50 to-white" },
  AUDIT:      { name: "Internal Audit",        nameAr: "التدقيق الداخلي",      description: "Audit programs and compliance monitoring", descriptionAr: "برامج التدقيق ومراقبة الامتثال", color: "indigo",  gradient: "from-indigo-50 to-white" },
  BOD:        { name: "Board of Directors",     nameAr: "مجلس الإدارة",         description: "Board governance, charters, committees, and strategic decisions", descriptionAr: "حوكمة مجلس الإدارة والمواثيق واللجان والقرارات الاستراتيجية", color: "purple",  gradient: "from-purple-50 to-white" },
  AML:        { name: "AML / CFT",             nameAr: "مكافحة غسل الأموال",   description: "Anti-money laundering and counter-terrorism financing compliance", descriptionAr: "الامتثال لمكافحة غسل الأموال وتمويل الإرهاب", color: "amber",   gradient: "from-amber-50 to-white" },
  FINANCE:    { name: "Finance",               nameAr: "الشؤون المالية",       description: "Financial reporting, treasury, tax, and accounting standards", descriptionAr: "التقارير المالية والخزينة والضرائب ومعايير المحاسبة", color: "emerald", gradient: "from-emerald-50 to-white" },
  OPERATIONS: { name: "Operations",            nameAr: "العمليات",             description: "Operational processes, SOPs, and service delivery", descriptionAr: "العمليات التشغيلية وإجراءات التشغيل الموحدة وتقديم الخدمات", color: "orange",  gradient: "from-orange-50 to-white" },
  GEN:        { name: "General / Cross-Dept",   nameAr: "عام / متعدد الإدارات", description: "Cross-departmental policies and general governance", descriptionAr: "السياسات المشتركة بين الإدارات والحوكمة العامة", color: "gray",    gradient: "from-gray-50 to-white" },
  ADMIN:      { name: "Administration",         nameAr: "الشؤون الإدارية",      description: "Administrative services and facility management", descriptionAr: "الخدمات الإدارية وإدارة المرافق", color: "slate",   gradient: "from-slate-100 to-white" },
}

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  "Approved":           { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  "Draft":              { color: "text-amber-600",   bg: "bg-amber-50 border-amber-200",     icon: Edit3 },
  "Under Review":       { color: "text-blue-600",    bg: "bg-blue-50 border-blue-200",       icon: Clock },
  "Enhancement Needed": { color: "text-purple-600",  bg: "bg-purple-50 border-purple-200",   icon: Sparkles },
}

const statusOptions = ["Approved", "Draft", "Under Review", "Enhancement Needed"]

export default function DepartmentPage() {
  const params = useParams()
  const code = (params.code as string)?.toUpperCase()

  const [dept, setDept] = useState<DeptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewingDoc, setViewingDoc] = useState<string | null>(null)
  const [changes, setChanges] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saveOk, setSaveOk] = useState<string | null>(null)
  const [lang, setLang] = useState<"en" | "ar">("en") // Language State

  const fetchData = () => {
    fetch("/api/registry")
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const found = data.departments?.find((d: any) => d.code === code)
          if (found) setDept(found)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [code])

  const meta = deptMeta[code] || { name: code, nameAr: "", description: "", descriptionAr: "", color: "slate", gradient: "from-slate-50 to-white" }

  const saveStatus = async (docId: string) => {
    const newStatus = changes[docId]
    if (!newStatus) return
    setSaving(docId)
    try {
      await fetch("/api/registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId, status: newStatus, validatedBy: "Yasser" })
      })
      setSaveOk(docId)
      setTimeout(() => setSaveOk(null), 2000)
      const newChanges = { ...changes }; delete newChanges[docId]; setChanges(newChanges)
      fetchData()
    } catch {}
    setSaving(null)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  const policies = dept?.documents?.filter(d => d.type === "policy") || []
  const procedures = dept?.documents?.filter(d => d.type === "procedure") || []
  const allDocs = dept?.documents || []

  const renderDocRow = (doc: Doc) => {
    const currentStatus = changes[doc.id] || doc.status
    const cfg = statusConfig[currentStatus] || statusConfig["Draft"]
    const Icon = cfg.icon
    const hasChange = !!changes[doc.id]
    const isViewing = viewingDoc === doc.id

    return (
      <div key={doc.id}>
        <div className={`px-4 py-3 flex items-center gap-3 ${hasChange ? "bg-blue-50/50" : "hover:bg-slate-50"} transition-all`}>
          <Icon className={`h-4 w-4 flex-shrink-0 ${cfg.color}`} />
          <div className="flex-1 min-w-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <p className="text-sm font-medium text-slate-800 truncate" title={doc.filename}>{doc.filename}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">{doc.id}</Badge>
              <span className="text-[10px] text-muted-foreground truncate">{doc.systemNotes}</span>
            </div>
            {doc.frameworks.length > 0 && (
              <div className="flex gap-1 mt-0.5">
                {doc.frameworks.map(f => <Badge key={f} variant="outline" className="text-[8px] px-1 py-0 bg-purple-50 border-purple-200 text-purple-600">{f}</Badge>)}
              </div>
            )}
          </div>

          <select title="Document Status"
            className={`px-2 py-1.5 rounded border text-xs font-medium focus:ring-2 focus:ring-blue-500 w-40 ${cfg.bg}`}
            value={currentStatus}
            onChange={e => setChanges(prev => ({ ...prev, [doc.id]: e.target.value }))}>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

            <Button size="sm" variant="ghost" onClick={() => setViewingDoc(isViewing ? null : doc.id)}
            className="text-blue-600 hover:bg-blue-50" title="View details">
            <Eye className="h-4 w-4" />
          </Button>

          <Link href={`/documents/${encodeURIComponent(doc.id)}`}>
            <Button size="sm" variant="ghost" className="text-purple-600 hover:bg-purple-50" title="Open Workbench">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>

          {hasChange && (
            <Button size="sm" variant="ghost" onClick={() => saveStatus(doc.id)} disabled={saving === doc.id}
              className={saveOk === doc.id ? "text-green-600" : "text-blue-600"}>
              {saving === doc.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : saveOk === doc.id ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            </Button>
          )}

          {!hasChange && doc.validatedAt && (
            <span className="text-[9px] text-muted-foreground">✓ {doc.validatedBy} {doc.validatedAt}</span>
          )}
        </div>

        {isViewing && (
          <div className="px-6 py-4 bg-slate-50 border-t border-dashed" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-500" /> {lang === 'ar' ? 'معلومات الوثيقة' : 'Document Info'}
                </h4>
                <div className="text-xs space-y-1.5 bg-white rounded-lg p-3 border">
                  <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'المعرف' : 'ID'}</span><span className="font-mono font-medium">{doc.id}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'اسم الملف' : 'Filename'}</span><span className="font-medium truncate max-w-[200px]">{doc.filename}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'المجلد' : 'Folder'}</span><span className="font-medium">{doc.folder}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'النوع' : 'Type'}</span><span className="font-medium capitalize">{doc.type}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'الحالة' : 'Status'}</span><Badge variant="outline" className={`text-[10px] ${cfg.bg}`}>{currentStatus}</Badge></div>
                  {doc.validatedBy && <div className="flex justify-between"><span className="text-muted-foreground">{lang === 'ar' ? 'تم التحقق' : 'Validated'}</span><span className="font-medium">{doc.validatedBy} ({doc.validatedAt})</span></div>}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-purple-500" /> {lang === 'ar' ? 'الأطر والتحليل' : 'Analysis & Frameworks'}
                </h4>
                <div className="bg-white rounded-lg p-3 border space-y-2">
                  <p className="text-xs text-slate-600">{doc.systemNotes}</p>
                  {doc.frameworks.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.frameworks.map(f => (
                        <Link key={f} href={`/frameworks/${f.toLowerCase().replace("nist800", "nist-800").replace("nistcsf", "nist-csf")}`}>
                          <Badge variant="outline" className="text-[10px] bg-purple-50 border-purple-200 text-purple-600 cursor-pointer hover:bg-purple-100">{f}</Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <Button size="sm" variant="outline" className="w-full gap-2 text-xs mt-2"
                  onClick={() => {
                    const base = "C:/Users/YasserElshishiny/Nextcloud/Policies & Procedures"
                    const path = doc.folder === "(root)" ? `${base}/${doc.filename}` : `${base}/${doc.folder}/${doc.filename}`
                    window.open(`file:///${path}`, '_blank')
                  }}>
                  <ExternalLink className="h-3.5 w-3.5" /> {lang === 'ar' ? 'فتح في Nextcloud' : 'Open in Nextcloud'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header and Controls */}
      <div className="flex justify-between items-center">
        <Link href="/dashboard">
            <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
        </Link>
        <div className="flex gap-2">
             <Button 
                variant={lang === 'en' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setLang('en')}
                className={lang === 'en' ? 'bg-blue-600 text-white' : ''}
            >
                English
            </Button>
            <Button 
                variant={lang === 'ar' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setLang('ar')}
                className={lang === 'ar' ? 'bg-blue-600 text-white' : ''}
            >
                عربي
            </Button>
        </div>
      </div>

      {/* Department Header */}
      <Card className={`border-none shadow-sm bg-gradient-to-br ${meta.gradient}`}>
        <CardHeader>
          <div className="flex justify-between items-start" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div>
              <CardTitle className="text-3xl">{lang === 'ar' ? meta.nameAr : meta.name}</CardTitle>
              <CardDescription className="mt-2 text-base">{lang === 'ar' ? meta.descriptionAr : meta.description}</CardDescription>
            </div>
            <Badge className="bg-blue-600 hover:bg-blue-700 text-lg px-4 py-2">{code}</Badge>
          </div>

          {/* Metrics from real registry */}
          <div className="grid gap-4 md:grid-cols-4 mt-6">
            <Link href="#documents" className="block">
              <div className="bg-white rounded-lg p-4 border hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'نسبة الامتثال' : 'Approval Rate'}</p>
                    <p className="text-2xl font-bold text-blue-600">{dept?.completionPct || 0}%</p>
                    <p className="text-[10px] text-muted-foreground">Source: Document Registry</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600 opacity-50" />
                </div>
              </div>
            </Link>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'السياسات' : 'Policies'}</p>
                  <p className="text-2xl font-bold text-green-600">{dept?.completedPolicies || 0}/{dept?.totalPolicies || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Approved / Total</p>
                </div>
                <FileText className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'الإجراءات' : 'Procedures'}</p>
                  <p className="text-2xl font-bold text-orange-600">{dept?.completedProcedures || 0}/{dept?.totalProcedures || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Approved / Total</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-orange-600 opacity-50" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'توزيع الحالات' : 'Status Breakdown'}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {(dept?.approved || 0) > 0 && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">{dept?.approved} ✓</Badge>}
                    {(dept?.draft || 0) > 0 && <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">{dept?.draft} ✎</Badge>}
                    {(dept?.review || 0) > 0 && <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">{dept?.review} ⟳</Badge>}
                    {(dept?.enhancement || 0) > 0 && <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">{dept?.enhancement} ✦</Badge>}
                  </div>
                </div>
                <Building2 className="h-8 w-8 text-slate-400 opacity-50" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="documents" className="w-full" id="documents" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <TabsList className="w-full justify-start bg-white border">
          <TabsTrigger value="documents">📄 {lang === 'ar' ? `كل الوثائق (${allDocs.length})` : `All Documents (${allDocs.length})`}</TabsTrigger>
          <TabsTrigger value="policies">📋 {lang === 'ar' ? `السياسات (${policies.length})` : `Policies (${policies.length})`}</TabsTrigger>
          <TabsTrigger value="procedures">📝 {lang === 'ar' ? `الإجراءات (${procedures.length})` : `Procedures (${procedures.length})`}</TabsTrigger>
          <TabsTrigger value="obligations">⚖️ {lang === 'ar' ? 'الالتزامات' : 'Obligations'}</TabsTrigger>
        </TabsList>

        {/* All Documents */}
        <TabsContent value="documents">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{lang === 'ar' ? 'كل الوثائق' : 'All Documents'}</CardTitle>
              <CardDescription>{lang === 'ar' ? 'قائمة بجميع السياسات والإجراءات - اضغط 👁 لعرض التفاصيل' : 'Every policy and procedure from real Nextcloud scan — click 👁 to view details, change status inline'}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {allDocs.length > 0 ? (
                <div className="divide-y">{allDocs.map(renderDocRow)}</div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>{lang === 'ar' ? 'لا توجد وثائق معينة لهذا القسم بعد' : 'No documents mapped for this department yet'}</p>
                  <Link href="/validate"><Button variant="link" size="sm">{lang === 'ar' ? 'تعيين الوثائق →' : 'Map documents →'}</Button></Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{lang === 'ar' ? `السياسات (${policies.length})` : `Policies (${policies.length})`}</CardTitle>
              <CardDescription>{dept?.completedPolicies || 0} approved out of {dept?.totalPolicies || 0}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {policies.length > 0 ? (
                <div className="divide-y">{policies.map(renderDocRow)}</div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">{lang === 'ar' ? 'لا توجد سياسات' : 'No policies'}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Procedures Tab */}
        <TabsContent value="procedures">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{lang === 'ar' ? `الإجراءات (${procedures.length})` : `Procedures (${procedures.length})`}</CardTitle>
              <CardDescription>{dept?.completedProcedures || 0} approved out of {dept?.totalProcedures || 0}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {procedures.length > 0 ? (
                <div className="divide-y">{procedures.map(renderDocRow)}</div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">{lang === 'ar' ? 'لا توجد إجراءات' : 'No procedures'}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Obligations Tab */}
        <TabsContent value="obligations">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{lang === 'ar' ? `الالتزامات التنظيمية (${dept?.documents?.filter(d => d.obligations?.length)?.length || 0})` : `Regulatory Obligations ({dept?.documents?.filter(d => d.obligations?.length)?.length || 0})`}</CardTitle>
              <CardDescription>{lang === 'ar' ? 'المتطلبات القانونية والتنظيمية المرتبطة بسياسات القسم' : 'Mapped legal and regulatory requirements linked to department policies'}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               {allDocs.filter(d => d.obligations?.length > 0).length > 0 ? (
                 <div className="divide-y">
                   {allDocs.filter(d => d.obligations?.length > 0).map(doc => (
                     <div key={doc.id} className="p-4 hover:bg-slate-50">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-purple-600 mt-1" />
                          <div>
                            <h4 className="font-medium text-sm text-slate-800">{doc.filename}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{lang === 'ar' ? `مرتبط بـ ${doc.obligations?.length} التزام(ات)` : `Linked to ${doc.obligations?.length} obligation(s)`}</p>
                            <div className="flex flex-wrap gap-2">
                              {doc.obligations?.map((ob: string) => (
                                <Badge key={ob} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                  {ob}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="p-8 text-center text-muted-foreground">
                   <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
                   <p>{lang === 'ar' ? 'لا توجد التزامات معينة بعد.' : 'No obligations mapped yet. Update the "Obligations Mapping Template" in `_SYSTEM_BASELINE`.'}</p>
                 </div>
               )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
