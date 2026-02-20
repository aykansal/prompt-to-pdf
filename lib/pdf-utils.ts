import { Document } from './catalog'

/**
 * Converts a Document spec to an HTML string for PDF rendering
 * This is a simple converter that creates readable HTML from the spec
 */
export function documentToHTML(doc: Document): string {
  const page = doc.pages[0]
  if (!page) return '<html><body></body></html>'

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${doc.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    h1 { font-size: 28px; margin-bottom: 20px; }
    h2 { font-size: 20px; margin: 20px 0 10px 0; }
    h3 { font-size: 16px; margin: 15px 0 8px 0; }
    h4 { font-size: 14px; margin: 10px 0 6px 0; }
    p { margin-bottom: 10px; }
    table { border-collapse: collapse; width: 100%; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    ul, ol { margin: 10px 0; padding-left: 20px; }
    li { margin-bottom: 4px; }
    img { max-width: 100%; height: auto; margin: 10px 0; }
    hr { margin: 20px 0; border: none; border-top: 1px solid #ddd; }
    section { margin: 20px 0; padding: 15px; border: 1px solid #eee; }
  </style>
</head>
<body>`

  if (page.title) {
    html += `<h1>${escapeHTML(page.title)}</h1>`
  }

  // Convert content elements to HTML
  page.content.forEach((element) => {
    html += elementToHTML(element)
  })

  html += `</body>
</html>`

  return html
}

function escapeHTML(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

function elementToHTML(element: any): string {
  switch (element.type) {
    case 'heading': {
      const level = element.level || 'h2'
      return `<${level}>${escapeHTML(element.text)}</${level}>\n`
    }

    case 'paragraph':
      return `<p>${escapeHTML(element.text)}</p>\n`

    case 'table': {
      let html = '<table>\n<thead>\n<tr>'
      element.headers.forEach((header: string) => {
        html += `<th>${escapeHTML(header)}</th>`
      })
      html += '</tr>\n</thead>\n<tbody>\n'

      element.rows.forEach((row: string[]) => {
        html += '<tr>'
        row.forEach((cell: string) => {
          html += `<td>${escapeHTML(cell)}</td>`
        })
        html += '</tr>\n'
      })

      html += '</tbody>\n</table>\n'
      return html
    }

    case 'list': {
      const tag = element.ordered ? 'ol' : 'ul'
      let html = `<${tag}>\n`
      element.items.forEach((item: string) => {
        html += `<li>${escapeHTML(item)}</li>\n`
      })
      html += `</${tag}>\n`
      return html
    }

    case 'divider':
      return '<hr>\n'

    case 'image':
      return `<img src="${escapeHTML(element.url)}" alt="Image" width="${element.width || 200}" height="${element.height || 150}"><br>\n`

    case 'section': {
      let html = '<section>\n'
      if (element.title) {
        html += `<h3>${escapeHTML(element.title)}</h3>\n`
      }
      element.content.forEach((child: any) => {
        html += elementToHTML(child)
      })
      html += '</section>\n'
      return html
    }

    default:
      return ''
  }
}

/**
 * Creates a simple PDF structure for basic PDF generation
 */
export function documentToPDFStructure(doc: Document) {
  return {
    title: doc.title,
    pageCount: doc.pages.length,
    elementCount: doc.pages[0]?.content.length || 0,
  }
}
