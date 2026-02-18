"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ShieldCheck, AlertCircle, CheckCircle2, FileText, 
  Search, ArrowLeft, Bot, ExternalLink, Lock 
} from "lucide-react"

interface Control {
  controlId: string
  name: string
  purpose: string
  statement: string
  owner: string
  implementationStatus: "Implemented" | "In Progress" | "Gap" | "Not Started"
  relatedPolicies: string[]
  relatedPolicyStatus: { status: string, department: string, tags: string[] }[]
}

export default function PciDssPage() {
  const [controls, setControls] = useState<Control[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetch("/api/controls?framework=PCI-DSS")
      .then(r => r.json())
      .then(d => {
        if (d.success) setControls(d.controls)
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredControls = controls.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.controlId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const implemented = controls.filter(c => c.implementationStatus === "Implemented").length
  const progress = controls.length > 0 ? Math.round((implemented / controls.length) * 100) : 0

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Lock className="h-8 w-8 text-blue-600" />
            PCI DSS v4.0 Compliance
          </h1>
          <p className="text-muted-foreground mt-1">Payment Card Industry Data Security Standard</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Compliance Score</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{progress}%</div>
            <div className="w-full bg-slate-100 h-2 mt-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Controls</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{controls.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Implemented</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-600">{implemented}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Gaps</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-red-500">{controls.length - implemented}</div></CardContent>
        </Card>
      </div>

      {/* Controls List */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Control Requirements</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search controls..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Controls</TabsTrigger>
              <TabsTrigger value="gaps">Gaps Only</TabsTrigger>
              <TabsTrigger value="implemented">Implemented</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4 mt-4">
              {filteredControls.map(c => <ControlCard key={c.controlId} control={c} />)}
            </TabsContent>
             <TabsContent value="gaps" className="space-y-4 mt-4">
              {filteredControls.filter(c => c.implementationStatus !== "Implemented").map(c => <ControlCard key={c.controlId} control={c} />)}
            </TabsContent>
             <TabsContent value="implemented" className="space-y-4 mt-4">
              {filteredControls.filter(c => c.implementationStatus === "Implemented").map(c => <ControlCard key={c.controlId} control={c} />)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function ControlCard({ control }: { control: Control }) {
  const isImplemented = control.implementationStatus === "Implemented"
  const isGap = control.implementationStatus === "Gap" || control.implementationStatus === "Not Started"

  return (
    <div className={`p-4 rounded-lg border flex gap-4 ${isGap ? "bg-red-50/50 border-red-100" : "bg-white border-slate-200"}`}>
      <div className="pt-1">
        {isImplemented ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <h3 className="font-semibold text-slate-900">{control.controlId}: {control.name}</h3>
          <Badge variant={isImplemented ? "default" : "destructive"} className={isImplemented ? "bg-green-600" : ""}>
            {control.implementationStatus}
          </Badge>
        </div>
        <p className="text-sm text-slate-600">{control.statement}</p>
        
        {/* Evidence / Policy Link */}
        <div className="flex items-center gap-2 pt-2">
           <span className="text-xs font-medium text-muted-foreground">Related Policy:</span>
           {control.relatedPolicies.length > 0 ? (
               control.relatedPolicies.map(pid => (
                 <Link key={pid} href={`/library/${pid}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <FileText className="h-3 w-3" /> {pid}
                 </Link>
               ))
           ) : (
               <span className="text-xs text-red-500">None defined</span>
           )}
        </div>
      </div>
      
      {/* Action Button */}
      <div className="flex items-center">
         {isGap && (
           <Link href={`/generator?template=${control.controlId}&focus=PCI`}>
             <Button size="sm" className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm">
                <Bot className="h-4 w-4" />
                Draft with AI
             </Button>
           </Link>
         )}
      </div>
    </div>
  )
}
