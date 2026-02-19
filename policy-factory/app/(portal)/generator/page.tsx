"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sparkles, FileText, Download, Save, RefreshCw, Wand2, Copy, Check } from "lucide-react"

const departments = [
  { code: "HR", name: "Human Resources" },
  { code: "IT", name: "Information Technology" },
  { code: "COM", name: "Commercial" },
  { code: "RISK", name: "Risk Management" },
  { code: "AUDIT", name: "Internal Audit" },
  { code: "OPS", name: "Operations" },
  { code: "AML", name: "AML / CFT" },
  { code: "FINANCE", name: "Finance" },
  { code: "GEN", name: "General" },
]

export default function GeneratorPage() {
  const [topic, setTopic] = useState("")
  const [dept, setDept] = useState("")
  const [type, setType] = useState("policy")
  const [lang, setLang] = useState("en")
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState("")
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!topic || !dept) return
    setLoading(true)
    setContent("")

    const prompt = `Write a comprehensive ${type} for the ${dept} department on the topic of "${topic}".
    Language: ${lang === 'ar' ? 'Arabic' : 'English'}.
    Structure:
    1. Purpose
    2. Scope
    3. Definitions
    4. Policy Statement / Procedures
    5. Roles & Responsibilities
    6. Compliance & References
    
    Ensure professional GRC tone.`

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, system: "You are an expert policy writer for a Microfinance institution." })
      })

      const data = await res.json()
      if (data.success) {
        setContent(data.content)
      } else {
        setContent("Error: " + data.error)
      }
    } catch (e) {
      setContent("Failed to generate content. Please ensure local AI is running.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Wand2 className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Policy Generator</h1>
            <p className="text-slate-500">Draft comprehensive policies and procedures in seconds using local AI</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <Card className="lg:col-span-1 h-fit shadow-md border-purple-100">
            <CardHeader className="bg-purple-50/50">
              <CardTitle className="text-lg">Configuration</CardTitle>
              <CardDescription>Customize your document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select onValueChange={setDept}>
                  <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Document Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant={type === 'policy' ? 'default' : 'outline'} onClick={() => setType('policy')}>Policy</Button>
                  <Button variant={type === 'procedure' ? 'default' : 'outline'} onClick={() => setType('procedure')}>Procedure</Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Language</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant={lang === 'en' ? 'default' : 'outline'} onClick={() => setLang('en')}>English</Button>
                  <Button variant={lang === 'ar' ? 'default' : 'outline'} onClick={() => setLang('ar')}>Arabic</Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Topic / Keywords</label>
                <Textarea 
                  placeholder="e.g. Remote Work, Data Privacy, Petty Cash..." 
                  className="h-24 resize-none"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                />
              </div>

              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2 mt-2" 
                size="lg"
                onClick={handleGenerate}
                disabled={loading || !topic || !dept}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? "Generating..." : "Generate Draft"}
              </Button>
            </CardContent>
          </Card>

          {/* Editor / Preview */}
          <Card className="lg:col-span-2 min-h-[600px] shadow-sm flex flex-col">
            <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-slate-700">Generated Draft</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} disabled={!content}>
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" disabled={!content}>
                  <Save className="w-4 h-4 mr-2" /> Save to Registry
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
               {content ? (
                 <Textarea 
                    className="w-full h-full min-h-[550px] p-6 border-0 focus-visible:ring-0 resize-none font-mono text-sm leading-relaxed" 
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                 />
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 space-y-4">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                     <Sparkles className="w-8 h-8 text-slate-300" />
                   </div>
                   <div className="text-center">
                     <p className="text-lg font-medium text-slate-600">Ready to Generate</p>
                     <p className="text-sm">Select options and topics on the left to start.</p>
                   </div>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
