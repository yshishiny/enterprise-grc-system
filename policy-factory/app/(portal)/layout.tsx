import { Sidebar } from "@/components/layout/Sidebar"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  )
}
