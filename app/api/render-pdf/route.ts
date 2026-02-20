import { documentToHTML } from '@/lib/pdf-utils'

// Create a basic PDF from HTML content using a simple text-based approach
// For production, consider using puppeteer or a dedicated PDF library
function createPDFFromHTML(title: string, htmlContent: string): Buffer {
  // Remove HTML tags and create a simple PDF-like text document
  const textContent = htmlContent
    .replace(/<[^>]*>/g, '\n')
    .replace(/\n\n+/g, '\n')
    .trim()

  // Create a simple PDF structure with the content
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${textContent.length + 100} >>
stream
BT
/F1 16 Tf
50 750 Td
(${title.substring(0, 50)}) Tj
0 -25 Td
/F1 11 Tf
(${textContent.substring(0, 500).replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
0000000400 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
520
%%EOF`

  return Buffer.from(pdfContent)
}

export async function POST(req: Request) {
  try {
    const { document } = await req.json()

    if (!document || typeof document !== 'object') {
      return new Response('Invalid document', { status: 400 })
    }

    const title = document.title || 'Document'

    // Convert document spec to HTML
    const htmlContent = documentToHTML(document)

    // Generate PDF from HTML
    const pdfBuffer = createPDFFromHTML(title, htmlContent)

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('PDF render error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to generate PDF',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
