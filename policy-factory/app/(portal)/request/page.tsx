"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Send,
  Sparkles,
  FileText,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Copy,
  Download
} from "lucide-react"

interface Message {
  role: "user" | "system"
  content: string
  type?: "text" | "form" | "result"
  formData?: PolicyForm
  resultData?: PolicyResult
}

interface PolicyForm {
  title: string
  type: "Policy" | "Procedure" | "SOP"
  department: string
  purpose: string
  frameworks: string[]
  scope: string
}

interface PolicyResult {
  id: string
  markdown: string
  metadata: {
    title: string
    type: string
    department: string
    frameworks: string[]
  }
}

const departments = [
  { code: "IT", name: "Information Technology" },
  { code: "HR", name: "Human Resources" },
  { code: "OPS", name: "Operations" },
  { code: "COM", name: "Commercial" },
  { code: "RISK", name: "Risk Management" },
  { code: "AUDIT", name: "Internal Audit" },
  { code: "BOD", name: "Board of Directors" },
  { code: "ADMIN", name: "Administration" }
]

const frameworkOptions = ["ISO27001", "NIST800", "NISTCSF", "COBIT", "FRA"]

const docTypes = ["Policy", "Procedure", "SOP"] as const

export default function RequestPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Hello! I'm the Policy Factory assistant. Tell me what policy, procedure, or SOP you need — in plain English. I'll help structure it.\n\nFor example:\n• \"I need an IT change management policy\"\n• \"Create a procedure for employee onboarding\"\n• \"We need a data backup SOP aligned with ISO27001\"",
      type: "text"
    }
  ])
  const [input, setInput] = useState("")
  const [step, setStep] = useState<"chat" | "form" | "generating" | "done">("chat")
  const [form, setForm] = useState<PolicyForm>({
    title: "",
    type: "Policy",
    department: "",
    purpose: "",
    frameworks: [],
    scope: ""
  })
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg])
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg = input.trim()
    addMessage({ role: "user", content: userMsg, type: "text" })
    setInput("")

    // Parse the user's request to pre-fill form
    const lower = userMsg.toLowerCase()
    const newForm: PolicyForm = { ...form }

    // Detect type
    if (lower.includes("sop") || lower.includes("standard operating")) newForm.type = "SOP"
    else if (lower.includes("procedure")) newForm.type = "Procedure"
    else newForm.type = "Policy"

    // Detect department
    if (lower.includes("it ") || lower.includes("information tech") || lower.includes("security") || lower.includes("cyber") || lower.includes("data")) newForm.department = "IT"
    else if (lower.includes("hr") || lower.includes("human resource") || lower.includes("employee") || lower.includes("onboarding") || lower.includes("hiring")) newForm.department = "HR"
    else if (lower.includes("operation") || lower.includes("process")) newForm.department = "OPS"
    else if (lower.includes("credit") || lower.includes("commercial") || lower.includes("sales")) newForm.department = "COM"
    else if (lower.includes("risk")) newForm.department = "RISK"
    else if (lower.includes("audit")) newForm.department = "AUDIT"
    else if (lower.includes("board") || lower.includes("governance")) newForm.department = "BOD"
    else if (lower.includes("admin") || lower.includes("procurement") || lower.includes("facility")) newForm.department = "ADMIN"

    // Detect frameworks
    const detectedFrameworks: string[] = []
    if (lower.includes("iso") || lower.includes("27001")) detectedFrameworks.push("ISO27001")
    if (lower.includes("nist 800") || lower.includes("nist800") || lower.includes("800-53")) detectedFrameworks.push("NIST800")
    if (lower.includes("nist csf") || lower.includes("nistcsf") || lower.includes("cybersecurity framework")) detectedFrameworks.push("NISTCSF")
    if (lower.includes("cobit")) detectedFrameworks.push("COBIT")
    if (lower.includes("fra") || lower.includes("regulatory") || lower.includes("central bank")) detectedFrameworks.push("FRA")
    // Default: add FRA since it's always relevant for Shari
    if (detectedFrameworks.length === 0) detectedFrameworks.push("FRA")
    newForm.frameworks = detectedFrameworks

    // Extract title-like content
    newForm.title = userMsg
      .replace(/^(i need|create|we need|build|make|write|draft|please)\s+(a|an|the)?\s*/i, "")
      .replace(/\s+(aligned|based|following|per|according)\s+.*/i, "")
      .trim()
    if (newForm.title.length > 80) newForm.title = newForm.title.substring(0, 80)
    newForm.title = newForm.title.charAt(0).toUpperCase() + newForm.title.slice(1)

    newForm.purpose = userMsg

    setForm(newForm)

    // Ask clarifying questions
    setTimeout(() => {
      addMessage({
        role: "system",
        content: `Great! I've identified this as a **${newForm.type}** request${newForm.department ? ` for the **${departments.find(d => d.code === newForm.department)?.name}** department` : ""}.\n\nPlease review and adjust the details below, then click **Generate** to create the draft.`,
        type: "text"
      })
      setStep("form")
    }, 500)
  }

  const handleGenerate = async () => {
    setStep("generating")
    addMessage({
      role: "system",
      content: `Generating your **${form.type}**: *${form.title}*\n\nAligning with: ${form.frameworks.join(", ")}...`,
      type: "text"
    })

    // Generate policy content locally (deterministic builder)
    const now = new Date().toISOString().slice(0, 10)
    const deptName = departments.find(d => d.code === form.department)?.name || form.department

    const markdown = generatePolicyMarkdown(form, deptName, now)

    setTimeout(() => {
      setGeneratedContent(markdown)
      addMessage({
        role: "system",
        content: `✅ Your **${form.type}** has been generated!\n\nTitle: **${form.title}**\nDepartment: ${deptName}\nFrameworks: ${form.frameworks.join(", ")}\n\nYou can copy the content or download it. The document will be added to the registry as a **Draft** for validation.`,
        type: "text"
      })
      setStep("done")
    }, 1500)
  }

  const copyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50/50">
      {/* Header */}
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Policy Request</h1>
        <p className="text-sm text-muted-foreground mt-1">Describe what you need in plain English</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-blue-600 text-white rounded-br-md"
                : "bg-white border shadow-sm rounded-bl-md text-slate-700"
            }`}>
              {msg.content.split("\n").map((line, j) => {
                // Basic markdown bold
                const parts = line.split(/(\*\*[^*]+\*\*)/g)
                return (
                  <p key={j} className={j > 0 ? "mt-1" : ""}>
                    {parts.map((part, k) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={k}>{part.slice(2, -2)}</strong>
                      }
                      if (part.startsWith("*") && part.endsWith("*")) {
                        return <em key={k}>{part.slice(1, -1)}</em>
                      }
                      return part
                    })}
                  </p>
                )
              })}
            </div>
          </div>
        ))}

        {/* Form Card */}
        {step === "form" && (
          <div className="flex justify-start">
            <Card className="max-w-[80%] shadow-md border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Policy Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Title</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. IT Change Management Policy"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Document Type</label>
                  <div className="flex gap-2">
                    {docTypes.map(t => (
                      <button key={t}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${form.type === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 hover:bg-blue-50"}`}
                        onClick={() => setForm(f => ({ ...f, type: t }))}
                      >{t}</button>
                    ))}
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Department Owner</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.department}
                    onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  >
                    <option value="">Select department...</option>
                    {departments.map(d => <option key={d.code} value={d.code}>{d.name} ({d.code})</option>)}
                  </select>
                </div>

                {/* Purpose */}
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Purpose &amp; Scope</label>
                  <textarea
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y"
                    value={form.purpose}
                    onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                    placeholder="Describe the purpose of this document..."
                  />
                </div>

                {/* Frameworks */}
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Framework Alignment</label>
                  <div className="flex flex-wrap gap-2">
                    {frameworkOptions.map(fw => (
                      <button key={fw}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.frameworks.includes(fw) ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-600 hover:bg-purple-50"}`}
                        onClick={() => setForm(f => ({
                          ...f,
                          frameworks: f.frameworks.includes(fw)
                            ? f.frameworks.filter(x => x !== fw)
                            : [...f.frameworks, fw]
                        }))}
                      >{fw}</button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleGenerate} className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                  disabled={!form.title || !form.department || !form.type}>
                  <Sparkles className="h-4 w-4" />
                  Generate {form.type}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Generating State */}
        {step === "generating" && (
          <div className="flex justify-start">
            <div className="bg-white border shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
              <RefreshCw className="h-5 w-5 text-purple-500 animate-spin inline mr-2" />
              <span className="text-sm text-slate-600">Generating document...</span>
            </div>
          </div>
        )}

        {/* Generated Content */}
        {step === "done" && generatedContent && (
          <div className="flex justify-start">
            <Card className="max-w-[90%] shadow-md border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    Generated Document
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={copyToClipboard} className="text-xs gap-1">
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">{generatedContent}</pre>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setStep("chat"); setGeneratedContent(null); setForm({ title: "", type: "Policy", department: "", purpose: "", frameworks: [], scope: "" }) }} className="gap-1">
                    <ArrowRight className="h-3.5 w-3.5" /> Request Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {(step === "chat" || step === "done") && (
        <div className="border-t bg-white p-4">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input
              className="flex-1 px-4 py-3 rounded-xl border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the policy, procedure, or SOP you need..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button onClick={handleSend} disabled={!input.trim()} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-4">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Deterministic policy markdown generator
function generatePolicyMarkdown(form: PolicyForm, deptName: string, date: string): string {
  const lines: string[] = []
  const divider = "---"

  lines.push(`# ${form.title}`)
  lines.push("")
  lines.push(`| Field | Value |`)
  lines.push(`|-------|-------|`)
  lines.push(`| Document Type | ${form.type} |`)
  lines.push(`| Department | ${deptName} |`)
  lines.push(`| Frameworks | ${form.frameworks.join(", ")} |`)
  lines.push(`| Status | Draft |`)
  lines.push(`| Created | ${date} |`)
  lines.push(`| Version | 1.0 |`)
  lines.push(`| Author | Policy Factory |`)
  lines.push("")
  lines.push(divider)
  lines.push("")

  // Purpose
  lines.push("## 1. Purpose")
  lines.push("")
  lines.push(form.purpose || `This ${form.type.toLowerCase()} establishes the requirements and guidelines for ${form.title.toLowerCase()} within ${deptName}.`)
  lines.push("")

  // Scope
  lines.push("## 2. Scope")
  lines.push("")
  lines.push(`This ${form.type.toLowerCase()} applies to all employees, contractors, and third parties within the ${deptName} department and any personnel interacting with related processes.`)
  lines.push("")

  // Definitions
  lines.push("## 3. Definitions")
  lines.push("")
  lines.push("| Term | Definition |")
  lines.push("|------|-----------|")
  lines.push(`| ${form.type} Owner | The designated individual responsible for maintaining this ${form.type.toLowerCase()} |`)
  lines.push(`| Stakeholders | All parties affected by or involved in the implementation of this ${form.type.toLowerCase()} |`)
  lines.push("")

  // Responsibilities
  lines.push("## 4. Roles and Responsibilities")
  lines.push("")
  lines.push(`| Role | Responsibility |`)
  lines.push(`|------|---------------|`)
  lines.push(`| Department Head (${deptName}) | Approve and enforce this ${form.type.toLowerCase()} |`)
  lines.push(`| ${form.type} Owner | Maintain, review, and update this document |`)
  lines.push(`| All Staff | Comply with the requirements outlined herein |`)
  lines.push(`| Internal Audit | Verify compliance during periodic audits |`)
  lines.push("")

  // Policy/Procedure Statements
  if (form.type === "Policy") {
    lines.push("## 5. Policy Statements")
    lines.push("")
    lines.push(`### 5.1 General Requirements`)
    lines.push("")
    lines.push(`- All activities covered by this policy must follow the established guidelines.`)
    lines.push(`- Exceptions require written approval from the Department Head.`)
    lines.push(`- Annual review and update of this policy is mandatory.`)
    lines.push("")
    lines.push(`### 5.2 Specific Requirements`)
    lines.push("")
    lines.push(`- [TODO: Detail specific policy requirements]`)
    lines.push(`- [TODO: Add measurable controls and standards]`)
    lines.push("")
  } else if (form.type === "Procedure") {
    lines.push("## 5. Procedure Steps")
    lines.push("")
    lines.push(`### Step 1: Initiation`)
    lines.push(`- [TODO: Describe the trigger or starting condition]`)
    lines.push("")
    lines.push(`### Step 2: Execution`)
    lines.push(`- [TODO: Detail the main steps]`)
    lines.push("")
    lines.push(`### Step 3: Review & Approval`)
    lines.push(`- [TODO: Describe the review process]`)
    lines.push("")
    lines.push(`### Step 4: Closure`)
    lines.push(`- [TODO: Describe completion criteria]`)
    lines.push("")
  } else {
    lines.push("## 5. Standard Operating Procedure")
    lines.push("")
    lines.push("### 5.1 Pre-requisites")
    lines.push("- [TODO: List required tools, access, or conditions]")
    lines.push("")
    lines.push("### 5.2 Step-by-Step Instructions")
    lines.push("1. [TODO: Step 1]")
    lines.push("2. [TODO: Step 2]")
    lines.push("3. [TODO: Step 3]")
    lines.push("")
    lines.push("### 5.3 Expected Output")
    lines.push("- [TODO: Describe expected results]")
    lines.push("")
  }

  // Framework Alignment
  if (form.frameworks.length > 0) {
    lines.push("## 6. Framework Alignment")
    lines.push("")
    lines.push("| Framework | Control Reference | Status |")
    lines.push("|-----------|------------------|--------|")
    form.frameworks.forEach(fw => {
      const refs: Record<string, string> = {
        "ISO27001": "A.5-A.18 (applicable controls)",
        "NIST800": "NIST 800-53 (applicable families)",
        "NISTCSF": "NIST CSF (applicable functions)",
        "COBIT": "COBIT 2019 (applicable objectives)",
        "FRA": "FRA Regulatory Requirements"
      }
      lines.push(`| ${fw} | ${refs[fw] || "TBD"} | To be mapped |`)
    })
    lines.push("")
  }

  // Compliance & Enforcement
  lines.push("## 7. Compliance & Enforcement")
  lines.push("")
  lines.push("- Non-compliance with this document may result in disciplinary action.")
  lines.push("- Compliance will be monitored through periodic audits and reviews.")
  lines.push("- Violations should be reported to the Department Head and Internal Audit.")
  lines.push("")

  // Review
  lines.push("## 8. Review & Revision History")
  lines.push("")
  lines.push("| Version | Date | Author | Changes |")
  lines.push("|---------|------|--------|---------|")
  lines.push(`| 1.0 | ${date} | Policy Factory | Initial draft |`)
  lines.push("")

  lines.push(divider)
  lines.push(`*Generated by Enterprise Policy Factory — ${date}*`)

  return lines.join("\n")
}
