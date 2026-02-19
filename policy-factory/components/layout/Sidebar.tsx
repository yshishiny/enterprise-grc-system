"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { 
  LayoutDashboard, 
  Library, 
  GitPullRequest, 
  ShieldCheck, 
  Settings, 
  FileSearch,
  BookOpen,
  PieChart,
  ClipboardCheck,
  Sparkles,
  Map,
  CheckSquare,
  MessageSquare,
  Scale,
  Building2,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Document Library", href: "/library", icon: Library },
  { name: "Validate Docs", href: "/validate", icon: CheckSquare },
  { name: "Policy Request", href: "/request", icon: MessageSquare },
  { name: "Workflow Inbox", href: "/workflow", icon: GitPullRequest },
  { name: "Controls & KPIs", href: "/controls", icon: ShieldCheck },
  { name: "Gap Analysis", href: "/analysis", icon: FileSearch },
  { name: "Maturity Dashboard", href: "/maturity", icon: PieChart },
  { name: "Regulatory Guide", href: "/compliance/regulations", icon: Scale },
  { name: "Document Audit", href: "/audit", icon: ClipboardCheck },
  { name: "AI Generator", href: "/generator", icon: Sparkles },
  { name: "2026 Roadmap", href: "/roadmap", icon: Map },
  { name: "Administration", href: "/admin", icon: Settings },
]

const departments = [
  { code: "HR",         name: "Human Resources",       nameAr: "الموارد البشرية",      color: "bg-green-500" },
  { code: "IT",         name: "Information Technology", nameAr: "تقنية المعلومات",      color: "bg-blue-500" },
  { code: "COM",        name: "Commercial",             nameAr: "الإدارة التجارية",     color: "bg-teal-500" },
  { code: "BOD",        name: "Board of Directors",     nameAr: "مجلس الإدارة",         color: "bg-purple-500" },
  { code: "RISK",       name: "Risk Management",        nameAr: "إدارة المخاطر",        color: "bg-red-500" },
  { code: "AUDIT",      name: "Internal Audit",         nameAr: "التدقيق الداخلي",      color: "bg-indigo-500" },
  { code: "AML",        name: "AML / CFT",              nameAr: "مكافحة غسل الأموال",   color: "bg-amber-500" },
  { code: "FINANCE",    name: "Finance",                nameAr: "الشؤون المالية",       color: "bg-emerald-500" },
  { code: "OPERATIONS", name: "Operations",             nameAr: "العمليات",             color: "bg-orange-500" },
  { code: "OPS",        name: "Admin & Support",        nameAr: "الدعم والإدارة",       color: "bg-slate-500" },
  { code: "GEN",        name: "General / Cross-Dept",   nameAr: "عام / متعدد الإدارات", color: "bg-gray-500" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [deptsOpen, setDeptsOpen] = useState(false)

  return (
    <div className="flex flex-col w-64 border-r bg-card text-card-foreground h-screen sticky top-0 shadow-sm">
      <div className="flex items-center h-16 px-6 border-b">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <BookOpen className="w-8 h-8" />
          <span>SHARI <span className="text-muted-foreground font-light">FACTORY</span></span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-primary")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Departments Section */}
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={() => setDeptsOpen(!deptsOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Departments · الإدارات
            </span>
            {deptsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {deptsOpen && (
            <div className="mt-1 space-y-0.5 ml-2">
              {departments.map((dept) => {
                const href = `/departments/${dept.code}`
                const isActive = pathname === href
                return (
                  <Link
                    key={dept.code}
                    href={href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full flex-shrink-0", dept.color)} />
                    <span className="truncate">{dept.name}</span>
                    <span className="text-[10px] text-muted-foreground/70 mr-0 truncate" dir="rtl">{dept.nameAr}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            YA
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">Yasser Admin</span>
            <span className="text-xs text-muted-foreground truncate">System Admin</span>
          </div>
        </div>
      </div>
    </div>
  )
}
