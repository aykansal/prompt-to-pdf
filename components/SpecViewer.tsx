'use client'

import { Document } from '@/lib/catalog'

interface SpecViewerProps {
  spec: Document | null
  isLoading: boolean
}

export function SpecViewer({ spec, isLoading }: SpecViewerProps) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-semibold text-foreground mb-3">Generated Spec</h2>

      <div className="flex-1 overflow-auto bg-muted/50 rounded-md border border-input p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground text-sm">
              Generating specification...
            </div>
          </div>
        ) : spec ? (
          <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words">
            {JSON.stringify(spec, null, 2)}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground text-sm">
              Enter a prompt and generate a spec to see it here
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
