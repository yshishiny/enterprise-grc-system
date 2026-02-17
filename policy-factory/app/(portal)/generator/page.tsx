"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge} from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Sparkles,
  FileText,
  Loader2,
  Download,
  Copy,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"

const categories = [
  { value: "Governance & Board", label: "Governance & Board", code: "GOV" },
  { value: "Risk Management", label: "Risk Management", code: "RISK" },
  { value: "Compliance & Regulatory", label: "Compliance & Regulatory", code: "COMP" },
  { value: "Information Security", label: "Information Security", code: "INFOSEC" },
  { value: "IT Governance", label: "IT Governance", code: "ITG" },
  { value: "Human Resources", label: "Human Resources", code: "HR" },
  { value: "Operations", label: "Operations", code: "OPS" },
  { value: "Finance", label: "Finance", code: "FIN" },
  { value: "Internal Audit", label: "Internal Audit", code: "AUDIT" },
  { value: "Administration", label: "Administration", code: "ADMIN" },
]

const frameworks = [
  { id: "FRA", name: "FRA (Egyptian Financial Regulatory)", icon: "🇪🇬" },
  { id: "COBIT", name: "COBIT 2019", icon: "📊" },
  { id: "NIST 800-53", name: "NIST 800-53", icon: "🔒" },
  { id: "NIST CSF", name: "NIST Cybersecurity Framework", icon: "🛡️" },
  { id: "ISO 27001", name: "ISO 27001:2022", icon: "📋" }
]

export default function GeneratorPage() {
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([])
  const [department, setDepartment] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPolicy, setGeneratedPolicy] = useState("")
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/generate-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category,
          title,
          description,
          frameworks: selectedFrameworks,
          department
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setGeneratedPolicy(data.policy)
        setStep(3)
      }
    } catch (error) {
      console.error('Error generating policy:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPolicy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([generatedPolicy], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_')}.md`
    a.click()
  }

  const toggleFramework = (frameworkId: string) => {
    setSelectedFrameworks(prev =>
      prev.includes(frameworkId)
        ? prev.filter(f => f !== frameworkId)
        : [...prev, frameworkId]
    )
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-shari-purple-600 to-shari-teal-500 rounded-full flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Policy Generator</h1>
            <p className="text-muted-foreground mt-1">Generate professional policies in minutes</p>
          </div>
        </div>
        <Link href="/templates">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Browse Templates
          </Button>
        </Link>
      </div>

      {/* Progress Steps */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between relative">
            {[1, 2, 3].map((s, idx) => (
              <div key={s} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${step >= s ? 'bg-shari-purple-600 text-white' : 'bg-slate-200 text-slate-500'}
                    transition-all duration-300
                  `}>
                    {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                  </div>
                  <p className={`mt-2 text-sm font-medium ${step >= s ? 'text-shari-purple-600' : 'text-muted-foreground'}`}>
                    {s === 1 ? 'Configure' : s === 2 ? 'Generate' : 'Review'}
                  </p>
                </div>
                {idx < 2 && (
                  <div className={`absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 ${
                    step > s ? 'bg-shari-purple-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Configuration */}
      {step === 1 && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Policy Configuration</CardTitle>
            <CardDescription>Define your policy parameters and requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select policy category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{cat.code}</Badge>
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Policy Title *</Label>
              <Input
                placeholder="e.g., Data Privacy and Protection Policy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Policy Purpose / Description *</Label>
              <Textarea
                placeholder="Describe what this policy aims to achieve, why it's needed, and its main objectives..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label>Responsible Department</Label>
              <Input
                placeholder="e.g., IT Department, HR Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            {/* Frameworks */}
            <div className="space-y-3">
              <Label>Applicable Frameworks</Label>
              <p className="text-sm text-muted-foreground">Select frameworks this policy must comply with</p>
              <div className="grid gap-3 md:grid-cols-2">
                {frameworks.map(framework => (
                  <div
                    key={framework.id}
                    onClick={() => toggleFramework(framework.id)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedFrameworks.includes(framework.id)
                        ? 'border-shari-purple-600 bg-shari-purple-50'
                        : 'border-slate-200 hover:border-shari-purple-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedFrameworks.includes(framework.id)}
                        onCheckedChange={() => toggleFramework(framework.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{framework.icon}</span>
                          <p className="font-semibold">{framework.id}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{framework.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                onClick={() => setStep(2)}
                disabled={!category || !title || !description}
                className="bg-shari-purple-600 hover:bg-shari-purple-700"
              >
                Continue to Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Generate */}
      {step === 2 && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Generate Policy</CardTitle>
            <CardDescription>Review configuration and generate your policy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Category</p>
                <p className="text-lg">{category}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Title</p>
                <p className="text-lg font-semibold">{title}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Description</p>
                <p className="text-sm">{description}</p>
              </div>
              {department && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Department</p>
                  <p className="text-sm">{department}</p>
                </div>
              )}
              {selectedFrameworks.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Frameworks</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFrameworks.map(fw => (
                      <Badge key={fw} className="bg-shari-teal-500">{fw}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-gradient-to-r from-shari-purple-600 to-shari-teal-500 hover:from-shari-purple-700 hover:to-shari-teal-600"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Policy
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 3 && generatedPolicy && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Generated Policy</CardTitle>
                <CardDescription>Review and refine your AI-generated policy</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 rounded-lg p-6 border-2 border-shari-purple-200">
              <pre className="whitespace-pre-wrap font-mono text-sm">{generatedPolicy}</pre>
            </div>

            <div className="flex justify-between gap-3 pt-6 border-t mt-6">
              <Button variant="outline" onClick={() => {
                setStep(1)
                setGeneratedPolicy("")
              }}>
                Generate New Policy
              </Button>
              <div className="flex gap-2">
                <Link href="/library">
                  <Button variant="outline">View Library</Button>
                </Link>
                <Link href="/approvals">
                  <Button className="bg-shari-purple-600 hover:bg-shari-purple-700">
                    Submit for Approval
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
