"use client"

import { useState, useEffect } from "react"
import { Cpu, Wifi, WifiOff, RefreshCw, Zap } from "lucide-react"

interface AiStatus {
  alive: boolean
  url?: string
  models?: string[]
  activeModel?: string | null
  error?: string
}

export function AiStatusBar() {
  const [status, setStatus] = useState<AiStatus | null>(null)
  const [checking, setChecking] = useState(false)

  const checkStatus = async () => {
    setChecking(true)
    try {
      const res = await fetch("/api/ai-status")
      const data = await res.json()
      setStatus(data)
    } catch {
      setStatus({ alive: false, error: "Network error" })
    }
    setChecking(false)
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 15000)
    return () => clearInterval(interval)
  }, [])

  if (!status) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-8 border-t bg-card/95 backdrop-blur-sm flex items-center px-4 text-xs gap-3">
      {/* AI Status Indicator */}
      <div className="flex items-center gap-2">
        <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-muted-foreground font-medium">LM Studio</span>
      </div>

      {status.alive ? (
        <>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-green-600 font-medium">Connected</span>
          </div>
          {status.activeModel && (
            <span className="text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md font-mono text-[10px]">
              {status.activeModel}
            </span>
          )}
          {status.models && status.models.length > 1 && (
            <span className="text-muted-foreground text-[10px]">
              +{status.models.length - 1} more
            </span>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
            </span>
            <span className="text-red-500 font-medium">Offline</span>
          </div>
          <span className="text-muted-foreground text-[10px]">
            {status.url || "http://172.28.16.1:1234"}
          </span>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Refresh / Connect Button */}
      <button
        onClick={checkStatus}
        disabled={checking}
        className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
      >
        {checking ? (
          <RefreshCw className="w-3 h-3 animate-spin" />
        ) : status.alive ? (
          <>
            <Zap className="w-3 h-3 text-green-500" />
            <span>Ready</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </>
        )}
      </button>

      {/* Timestamp */}
      <span className="text-[10px] text-muted-foreground/50">
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )
}
