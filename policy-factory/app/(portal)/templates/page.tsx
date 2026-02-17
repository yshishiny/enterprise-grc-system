"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Search, 
  Clock, 
  Download,
  Eye,
  Plus
} from "lucide-react"
import Link from "next/link"
import templateCatalog from "@/config/template_catalog.json"

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const templates = templateCatalog

  const filteredTemplates = templates.filter((template: any) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(templates.map((t: any) => t.category)))

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header with Shari Logo */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-shari-purple-600 rounded-full flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Policy Templates</h1>
            <p className="text-muted-foreground mt-1">Professional templates for quick policy creation</p>
          </div>
        </div>
        <Link href="/library">
          <Button variant="outline">
            Document Library
          </Button>
        </Link>
      </div>

      {/* Summary Card */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-shari-purple-50 to-white border-l-4 border-l-shari-purple-600">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Template Library</CardTitle>
              <CardDescription>8 professional templates to accelerate document creation</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-shari-purple-600">{templates.length}</p>
              <p className="text-sm text-muted-foreground">Templates</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={categoryFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("all")}
                className={categoryFilter === "all" ? "bg-shari-purple-600 hover:bg-shari-purple-700" : ""}
              >
                All
              </Button>
              {categories.slice(0, 5).map((category) => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(category)}
                  className={categoryFilter === category ? "bg-shari-purple-600 hover:bg-shari-purple-700" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredTemplates.map((template: any) => (
          <Card key={template.id} className="border-2 hover:border-shari-teal-500 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-shari-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-shari-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline" className="font-mono text-xs mt-1">
                        {template.code}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Badge className={
                  template.type === "Policy" 
                    ? "bg-shari-purple-600 hover:bg-shari-purple-700" 
                    : "bg-shari-teal-500 hover:bg-shari-teal-600"
                }>
                  {template.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{template.description}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{template.sections} sections</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{template.estimatedTime}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs bg-shari-purple-50 border-shari-purple-200">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Category:</p>
                <Badge variant="outline" className="bg-shari-teal-50 border-shari-teal-200">
                  {template.category}
                </Badge>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1 bg-shari-purple-600 hover:bg-shari-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No templates found matching your search</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
