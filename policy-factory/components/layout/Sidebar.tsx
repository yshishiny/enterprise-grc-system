"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Library, 
  GitPullRequest, 
  ShieldCheck, 
  Users, 
  Settings, 
  FileSearch,
  BookOpen,
  PieChart,
  ClipboardCheck,
  Sparkles,
  Map,
  CheckSquare,
  MessageSquare,
  Scale
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

export function Sidebar() {
  const pathname = usePathname()

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
