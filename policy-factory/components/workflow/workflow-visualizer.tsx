"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Circle, Clock, AlertCircle, FileText, Archive } from "lucide-react"

interface WorkflowStep {
  id: string
  name: string
  order: number
  color: string
  description: string
}

interface WorkflowVisualizerProps {
  currentStage: string
  stages: WorkflowStep[]
  history?: Array<{
    stage: string
    date: string
    user: string
    action: string
    comment?: string
  }>
}

export default function WorkflowVisualizer({ currentStage, stages, history = [] }: WorkflowVisualizerProps) {
  const getStageIcon = (stageId: string, isCurrent: boolean, isCompleted: boolean) => {
    const className = `h-5 w-5 ${
      isCurrent ? 'text-white' : isCompleted ? 'text-green-600' : 'text-slate-400'
    }`
    
    switch (stageId) {
      case "draft": return <FileText className={className} />
      case "review": return <Clock className={className} />
      case "approval": return <AlertCircle className={className} />
      case "published": return <CheckCircle2 className={className} />
      case "archived": return <Archive className={className} />
      default: return <Circle className={className} />
    }
  }

  const currentStageOrder = stages.find(s => s.id === currentStage)?.order || 1

  return (
    <div className="space-y-6">
      {/* Progress Stepper */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {stages.slice(0, 4).map((stage, index) => {
            const isCurrent = stage.id === currentStage
            const isCompleted = stage.order < currentStageOrder
            const isNext = stage.order === currentStageOrder + 1
            
            return (
              <div key={stage.id} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  {/* Circle/Icon */}
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${isCurrent ? `bg-${stage.color}-600` : ''}
                      ${isCompleted ? 'bg-green-100 border-2 border-green-600' : ''}
                      ${!isCurrent && !isCompleted ? 'bg-slate-100 border-2 border-slate-300' : ''}
                      transition-all duration-300
                    `}
                  >
                    {getStageIcon(stage.id, isCurrent, isCompleted)}
                  </div>
                  
                  {/* Label */}
                  <div className="mt-2 text-center">
                    <p className={`
                      text-sm font-semibold
                      ${isCurrent ? `text-${stage.color}-600` : ''}
                      ${isCompleted ? 'text-green-600' : ''}
                      ${!isCurrent && !isCompleted ? 'text-slate-400' : ''}
                    `}>
                      {stage.name}
                    </p>
                    {isCurrent && (
                      <Badge className={`bg-${stage.color}-600 mt-1 text-xs`}>
                        Current
                      </Badge>
                    )}
                    {isNext && !isCurrent && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Next
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Connector Line */}
                {index < stages.slice(0, 4).length - 1 && (
                  <div className="absolute top-6 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-0.5">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-600' : 'bg-slate-300'
                      }`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stage Description */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-${stages.find(s => s.id === currentStage)?.color}-600`}>
              {getStageIcon(currentStage, true, false)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {stages.find(s => s.id === currentStage)?.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {stages.find(s => s.id === currentStage)?.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Timeline */}
      {history  && history.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3">Workflow History</h4>
          <div className="space-y-2">
            {history.map((entry, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  </div>
                  {index < history.length - 1 && (
                    <div className="w-0.5 h-full bg-blue-200 flex-grow mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs capitalize">{entry.stage}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">{entry.user}</span>
                    {" "}{entry.action.toLowerCase()}
                  </p>
                  {entry.comment && (
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      "{entry.comment}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
