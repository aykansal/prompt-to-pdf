'use client'

import { ContentElement } from '@/lib/catalog'

interface ContentRendererProps {
  element: ContentElement
}

function ContentRenderer({ element }: ContentRendererProps) {
  switch (element.type) {
    case 'heading': {
      const Tag = (element.level || 'h2') as keyof JSX.IntrinsicElements
      const sizeClass = {
        h1: 'text-2xl',
        h2: 'text-xl',
        h3: 'text-lg',
        h4: 'text-base',
      }[element.level || 'h2']

      return (
        <Tag className={`${sizeClass} font-bold mb-3 text-foreground`}>
          {element.text}
        </Tag>
      )
    }

    case 'paragraph':
      return <p className="text-sm text-foreground mb-3 leading-relaxed">{element.text}</p>

    case 'table':
      return (
        <div className="mb-3 overflow-x-auto">
          <table className="w-full text-sm border border-input">
            <thead>
              <tr className="bg-muted">
                {element.headers.map((header, i) => (
                  <th key={i} className="border border-input p-2 text-left font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {element.rows.map((row, i) => (
                <tr key={i} className="border-b border-input">
                  {row.map((cell, j) => (
                    <td key={j} className="border border-input p-2 text-xs">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'list':
      return (
        <div className="mb-3">
          {element.ordered ? (
            <ol className="list-decimal list-inside space-y-1 text-sm text-foreground">
              {element.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          ) : (
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
              {element.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )

    case 'divider':
      return <div className="border-t border-input my-4" />

    case 'image':
      return (
        <div className="mb-3">
          <img
            src={element.url}
            alt="Document image"
            className="max-w-full h-auto rounded border border-input"
            style={{
              maxWidth: element.width ? `${element.width}px` : undefined,
              maxHeight: element.height ? `${element.height}px` : undefined,
            }}
          />
        </div>
      )

    case 'section':
      return (
        <div className="mb-4 p-3 border border-muted rounded-md bg-muted/30">
          {element.title && <h3 className="font-semibold text-foreground mb-3">{element.title}</h3>}
          <div className="space-y-2">
            {element.content.map((child, i) => (
              <ContentRenderer key={i} element={child} />
            ))}
          </div>
        </div>
      )

    default:
      return null
  }
}

interface PdfPreviewProps {
  title?: string
  content: ContentElement[]
  isLoading: boolean
}

export function PdfPreview({ title, content, isLoading }: PdfPreviewProps) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-semibold text-foreground mb-3">Preview</h2>

      <div className="flex-1 overflow-auto bg-background border border-input rounded-md p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground text-sm">Generating preview...</div>
          </div>
        ) : content.length > 0 ? (
          <>
            {title && <h1 className="text-2xl font-bold mb-6 text-foreground text-center">{title}</h1>}
            <div className="space-y-2">
              {content.map((element, i) => (
                <ContentRenderer key={i} element={element} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground text-sm">
              Generate a spec to see the preview
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
