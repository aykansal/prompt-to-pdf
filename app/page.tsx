'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { Document, ContentElement } from '@/lib/catalog'
import { SpecViewer } from '@/components/SpecViewer'
import { PdfPreview } from '@/components/PdfPreview'

export default function Home() {
  const [spec, setSpec] = useState<Document | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string>()
  const [prompt, setPrompt] = useState('')

  const handleGeneratePDF = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(undefined)
    setSpec(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt }),
      })

      if (!response.ok) throw new Error('Failed to generate PDF spec')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim()
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'text-delta' && parsed.delta) {
                accumulatedText += parsed.delta
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Try to extract and parse JSON from accumulated text
      const jsonMatch = accumulatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]) as Document
          setSpec(parsed)
        } catch (parseError) {
          console.error('Failed to parse JSON:', parseError)
          setError('Failed to parse generated PDF specification')
        }
      } else {
        setError('No valid JSON found in response')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!spec) return

    setIsDownloading(true)
    setError(undefined)

    try {
      const response = await fetch('/api/render-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document: spec }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${spec.title || 'document'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  const contentElements: ContentElement[] = spec?.pages[0]?.content || []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-input bg-muted/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">PDF Generator</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generate PDF documents with AI
            </p>
          </div>
          <Button
            onClick={handleDownloadPDF}
            disabled={!spec || isDownloading}
            size="lg"
            className="gap-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto p-6 grid grid-cols-3 gap-6">
          {/* Left panel - Form */}
          <div className="col-span-1 flex flex-col">
            <div className="bg-card border border-input rounded-lg p-6 h-full flex flex-col">
              <form onSubmit={(e) => { e.preventDefault(); handleGeneratePDF(); }} className="space-y-4 flex flex-col flex-1">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Describe your PDF document
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., Create an invoice for a software company with company details, itemized charges, and payment terms"
                    className="w-full h-32 p-3 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    disabled={isGenerating}
                  />
                </div>

                {error && <div className="text-sm text-destructive">{error}</div>}

                <Button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate PDF'
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Right panels - Spec and Preview */}
          <div className="col-span-2 grid grid-cols-2 gap-6 overflow-hidden">
            <div>
              <SpecViewer spec={spec} isLoading={isGenerating} />
            </div>
            <div>
              <PdfPreview
                title={spec?.pages[0]?.title}
                content={contentElements}
                isLoading={isGenerating}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
