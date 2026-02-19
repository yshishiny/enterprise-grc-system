
"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, CheckCircle2, AlertTriangle, MessageSquare, 
  Sparkles, Globe, Shield, RefreshCw, Send, FileText 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

export const dynamic = "force-dynamic";

function ValidatorContent() {
  const params = useParams()
  const router = useRouter()
  
  // Safe extraction of docId
  const rawId = params?.id;
  const docId = Array.isArray(rawId) ? rawId[0] : rawId || "";
  
  const [doc, setDoc] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<"en" | "ar">("en")
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [comment, setComment] = useState("")

  useEffect(() => {
    if (!docId) return;
    
    fetch("/api/registry")
      .then(r => r.json())
      .then(data => {
        const d = data.documents?.find((x: any) => x.id === decodeURIComponent(docId))
        if(d) setDoc(d)
      })
      .catch(err => console.error("Failed to load doc", err))
      .finally(() => setLoading(false))
  }, [docId])

  const [currentAnalysisType, setCurrentAnalysisType] = useState<string | null>(null)

  const runAiAnalysis = async (type: "proof" | "trans" | "check" | "content" | "def" | "struct") => {
    setAnalyzing(true)
    setAiAnalysis(null)
    setCurrentAnalysisType(type)
    
    let prompt = "";
    if (type === "proof") prompt = `Suggest concrete evidence proofs for the policy: "${doc.title}". List 3 items.`
    if (type === "trans") prompt = `Translate this policy title to Arabic: "${doc.title}"`
    if (type === "check") prompt = `Does the policy "${doc.title}" generally align with ISO 27001 controls? Briefly explain.`
    if (type === "def") prompt = `Provide a clear, standard definition and purpose for a "${doc.title}". Explain why it is important for the ${doc.department} department.`
    if (type === "struct") prompt = `Outline the standard mandatory structure/table of contents for a "${doc.type}" document named "${doc.title}". Include all standard sections (e.g., Purpose, Scope, Definitions, Policy Statements, Roles, etc.) and a brief template.`
    if (type === "content") prompt = `Write a comprehensive content simulation for the "${doc.title}" (${doc.type}) for ${doc.department}. IMPORTANT: You MUST follow this standard structure: 1. Purpose 2. Scope 3. Definitions 4. Core Policy Statements 5. Roles & Responsibilities 6. Compliance/References. Content should be professional, standard-aligned, and ready for review.`

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      })
      const json = await res.json()
      if (json.success) setAiAnalysis(json.content)
      else setAiAnalysis("Error: " + json.error)
    } catch {
      setAiAnalysis("Failed to contact AI service.")
    }
    setAnalyzing(false)
  }

  if (loading) return <div className="p-8"><RefreshCw className="animate-spin" /></div>
  if (!doc) return <div className="p-8">Document not found</div>

  const isAr = lang === "ar"

  return (
    <div className={`min-h-screen bg-slate-50 p-6 ${isAr ? "rtl" : "ltr"}`} dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className={`h-4 w-4 ${isAr ? "ml-2" : "mr-2"}`} />
            {isAr ? "عودة" : "Back"}
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {doc.title}
              <Badge variant="outline">{doc.id}</Badge>
            </h1>
            <p className="text-slate-500">{doc.filename} • {doc.department}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setLang(l => l === "en" ? "ar" : "en")}>
            <Globe className="h-4 w-4 mr-2" />
            {isAr ? "English" : "العربية"}
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {isAr ? "اعتماد" : "Approve"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "تفاصيل الوثيقة" : "Document Details"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 bg-slate-50 rounded border">
                    <span className="text-xs text-muted-foreground block">Status / {isAr ? "الحالة" : "Status"}</span>
                    <Badge className={doc.status === "Approved" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                      {doc.status}
                    </Badge>
                 </div>
                 <div className="p-3 bg-slate-50 rounded border">
                    <span className="text-xs text-muted-foreground block">Version / {isAr ? "الإصدار" : "Version"}</span>
                    <span className="font-mono">{doc.version || "v1.0"}</span>
                 </div>
              </div>
              
              {doc.obligations && doc.obligations.length > 0 && (
                <div className="p-4 border border-purple-100 bg-purple-50/50 rounded-lg">
                  <h3 className="text-sm font-semibold text-purple-800 flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" /> 
                    {isAr ? "الالتزامات التنظيمية" : "Regulatory Obligations"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {doc.obligations.map((ob: string) => (
                      <Badge key={ob} variant="outline" className="bg-white border-purple-200">
                        {ob}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="guide" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="guide">{isAr ? "الدليل والمعايير" : "Guidance & Standards"}</TabsTrigger>
              <TabsTrigger value="content">{isAr ? "محتوى الوثيقة" : "Document Content"}</TabsTrigger>
              <TabsTrigger value="comments">{isAr ? "الملاحظات" : "Comments & Feedback"}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="guide">
              <Card>
                <CardHeader>
                  <CardTitle>{isAr ? "دليل المعايير القياسية" : "Standardization Guide"}</CardTitle>
                  <CardDescription>{isAr ? "افهم الغرض والهيكل المطلوب لهذا النوع من الوثائق." : "Understand the purpose and required structure for this document type."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => runAiAnalysis('def')} disabled={analyzing}>
                      <Globe className="h-4 w-4 mr-2 text-blue-500" />
                      {isAr ? "التعريف والغرض" : "Definition & Purpose"}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => runAiAnalysis('struct')} disabled={analyzing}>
                      <FileText className="h-4 w-4 mr-2 text-green-500" />
                      {isAr ? "الهيكل القياسي" : "Standard Structure"}
                    </Button>
                  </div>

                  {aiAnalysis && (currentAnalysisType === 'def' || currentAnalysisType === 'struct') ? (
                    <div className="p-4 bg-slate-50 rounded-lg border text-sm text-slate-700 whitespace-pre-wrap font-serif leading-relaxed animate-in fade-in">
                       {aiAnalysis}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                      <Shield className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">{isAr ? "اضغط لإنشاء دليل." : "Select an option above to generate guidance."}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{isAr ? "معاينة المحتوى" : "Content Preview"}</span>
                    <Button variant="outline" size="sm" onClick={() => runAiAnalysis('content')} disabled={analyzing}>
                       <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                       {isAr ? "توليد المحتوى بالذكاء الاصطناعي" : "Generate Simulation"}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {isAr ? "لا يمكن عرض الملف الأصلي. يمكنك استخدام الذكاء الاصطناعي لمحاكاة المحتوى بناءً على العنوان." : "Original file not accessible in this view. Use AI to simulate content based on title for review."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {aiAnalysis && currentAnalysisType === 'content' ? (
                       <div className="p-4 bg-slate-50 rounded-lg border text-sm text-slate-700 whitespace-pre-wrap font-serif leading-relaxed">
                         {aiAnalysis}
                       </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>{isAr ? "لم يتم توليد أي محتوى عرض." : "No content preview available."}</p>
                      <Button variant="link" onClick={() => runAiAnalysis('content')}>{isAr ? "اضغط هنا للمحاكاة" : "Click to simulate content"}</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {isAr ? "الملاحظات والتعليقات" : "Comments & Feedback"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Textarea 
                      placeholder={isAr ? "أضف ملاحظة للمراجع..." : "Add a note for the reviewer..."} 
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => setComment("")}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="col-span-1 space-y-6">
           <Card className="border-blue-100 bg-blue-50/30">
             <CardHeader className="pb-3">
               <CardTitle className="flex items-center gap-2 text-blue-700">
                 <Sparkles className="h-4 w-4" />
                 AI Assistant
               </CardTitle>
               <CardDescription>Powered by Local LM Studio</CardDescription>
             </CardHeader>
             <CardContent className="space-y-3">
               <p className="text-xs text-muted-foreground">
                 Ask the AI to validate this document against standards.
               </p>
               <div className="flex flex-col gap-2">
                 <Button variant="outline" className="justify-start bg-white" onClick={() => runAiAnalysis('proof')} disabled={analyzing}>
                   🔎 Suggest Proof
                 </Button>
                 <Button variant="outline" className="justify-start bg-white" onClick={() => runAiAnalysis('trans')} disabled={analyzing}>
                   🌐 Translate Title
                 </Button>
                 <Button variant="outline" className="justify-start bg-white" onClick={() => runAiAnalysis('check')} disabled={analyzing}>
                   🛡️ ISO 27001 Check
                 </Button>
               </div>

               {analyzing && (
                 <div className="flex items-center gap-2 text-xs text-blue-600 mt-2">
                   <RefreshCw className="h-3 w-3 animate-spin" />
                   Thinking...
                 </div>
               )}

               {aiAnalysis && (
                 <div className="mt-3 p-3 bg-white rounded border text-sm text-slate-700 animate-in fade-in slide-in-from-bottom-2">
                   {aiAnalysis}
                 </div>
               )}
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}

export default function DocumentValidatorPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ValidatorContent />
    </Suspense>
  )
}
