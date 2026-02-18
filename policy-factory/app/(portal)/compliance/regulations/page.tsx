"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BookOpen,
  Search,
  Shield,
  Users,
  Globe,
  Building,
  Scale,
  FileText,
  CheckCircle2,
  AlertCircle,
  Landmark,
  Smartphone
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from 'next/link'

export default function RegulatoryGuidePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetch('/api/registry')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to load registry data", err)
        setLoading(false)
      })
  }, [])

  if (loading || !data?.regulatoryCompliance) {
    return <div className="p-8 text-center">Loading regulatory universe...</div>
  }

  const { overall, regulatoryCompliance } = data
  const laws = regulatoryCompliance.laws || []

  // Metric Cards Data
  const metrics = [
    {
      title: "Regulatory Coverage",
      value: `${overall.regulatoryCoveragePct}%`,
      description: "Of tracked articles implemented",
      icon: Scale,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      title: "Tracked Laws",
      value: regulatoryCompliance.totalLaws,
      description: "Across 5 key domains",
      icon: BookOpen,
      color: "text-indigo-600",
      bg: "bg-indigo-100"
    },
    {
      title: "Key Articles",
      value: regulatoryCompliance.totalArticles,
      description: "Clauses mapped to policies",
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-100"
    },
    {
      title: "Implementation Gaps",
      value: regulatoryCompliance.totalArticles - regulatoryCompliance.totalImplemented,
      description: "Articles pending policy coverage",
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-100"
    }
  ]

  // Filter Logic
  const filteredLaws = laws.filter((law: any) => {
    const matchesSearch = law.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          law.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          law.articles.some((a: any) => a.text.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (activeTab === "all") return matchesSearch
    
    // Map tabs to categories
    const categoryMap: Record<string, string[]> = {
      "microfinance": ["Core Business"],
      "governance": ["Governance"],
      "hr": ["Human Resources"],
      "digital": ["Digital & Tech"],
      "finance": ["Finance", "Risk & Finance"]
    }
    
    const relevantCategories = categoryMap[activeTab] || []
    return matchesSearch && relevantCategories.some(c => law.category.includes(c))
  })

  return (
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Regulatory Guide & Digital Standards</h1>
        <p className="text-slate-500 mt-2">
          Comprehensive mapping of Egyptian laws (FRA, Labor, Tax, Tech) to internal policies and procedures.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {metric.title}
              </CardTitle>
              <div className={cn("p-2 rounded-full", metric.bg)}>
                <metric.icon className={cn("h-4 w-4", metric.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <Tabs defaultValue="all" className="space-y-6" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="h-10 p-1 bg-slate-100/80">
            <TabsTrigger value="all" className="gap-2">
              <Globe className="w-4 h-4" /> All
            </TabsTrigger>
            <TabsTrigger value="microfinance" className="gap-2">
              <Building className="w-4 h-4" /> Microfinance
            </TabsTrigger>
            <TabsTrigger value="governance" className="gap-2">
              <Shield className="w-4 h-4" /> Governance
            </TabsTrigger>
            <TabsTrigger value="hr" className="gap-2">
              <Users className="w-4 h-4" /> HR & Labor
            </TabsTrigger>
            <TabsTrigger value="digital" className="gap-2">
              <Smartphone className="w-4 h-4" /> Digital & Fintech
            </TabsTrigger>
            <TabsTrigger value="finance" className="gap-2">
              <Landmark className="w-4 h-4" /> Finance & Risk
            </TabsTrigger>
          </TabsList>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search laws, articles..."
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="space-y-6 mt-0">
          {filteredLaws.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
              No laws found matching your criteria.
            </div>
          ) : (
            filteredLaws.map((law: any) => (
              <Card key={law.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                          {law.title}
                        </CardTitle>
                        <Badge variant="outline" className="bg-white text-slate-600 font-normal">
                          {law.category}
                        </Badge>
                      </div>
                      <CardDescription className="text-base">
                        {law.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                      <span className="text-sm font-medium text-slate-500">Coverage:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all", 
                              law.coveragePct >= 80 ? "bg-emerald-500" : 
                              law.coveragePct >= 50 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${law.coveragePct}%` }}
                          />
                        </div>
                        <span className={cn("text-sm font-bold",
                           law.coveragePct >= 80 ? "text-emerald-700" : 
                           law.coveragePct >= 50 ? "text-amber-700" : "text-red-700"
                        )}>
                          {law.coveragePct}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-[100px]">Article</TableHead>
                        <TableHead>Clause / Requirement</TableHead>
                        <TableHead className="w-[150px]">Status</TableHead>
                        <TableHead className="w-[250px]">Related Policies</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {law.articles.map((article: any, idx: number) => (
                        <TableRow key={idx} className="hover:bg-slate-50/30">
                          <TableCell className="font-medium align-top py-4">
                             Art. {article.article}
                          </TableCell>
                          <TableCell className="align-top py-4">
                            <p className="text-slate-700 leading-relaxed max-w-3xl">
                              {article.text}
                            </p>
                          </TableCell>
                          <TableCell className="align-top py-4">
                            {article.complianceStatus === "Implemented" ? (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 gap-1 pl-1 pr-2">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Implemented
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 gap-1 pl-1 pr-2">
                                <AlertCircle className="w-3.5 h-3.5" /> Gap
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="align-top py-4">
                             {article.implementedDocs && article.implementedDocs.length > 0 ? (
                               <div className="flex flex-col gap-2">
                                 {article.implementedDocs.map((docId: string) => {
                                    // Try to find the doc in the full list if possible, but here we only have ID
                                    // In a real app we'd map this ID to a title. For now showing ID.
                                    return (
                                      <Link 
                                        key={docId} 
                                        href={`/library?q=${docId}`}
                                        className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition-colors inline-flex items-center gap-1 w-fit"
                                      >
                                        <FileText className="w-3 h-3" />
                                        {docId}
                                      </Link>
                                    )
                                 })}
                               </div>
                             ) : (
                               <span className="text-xs text-muted-foreground italic">
                                 Pending: {article.relatedDocIds?.join(", ")}
                               </span>
                             )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
