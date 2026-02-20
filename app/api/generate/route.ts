import { streamText } from 'ai'
import { openrouter } from '@openrouter/ai-sdk-provider'
import { z } from 'zod'

const DocumentSchema = z.object({
  type: z.literal('document'),
  title: z.string(),
  pages: z.array(
    z.object({
      title: z.string().optional(),
      content: z.array(z.any()),
      pageSize: z.enum(['A4', 'Letter']).optional(),
      orientation: z.enum(['portrait', 'landscape']).optional(),
      margin: z.number().optional(),
      style: z.any().optional(),
    })
  ),
})

export async function POST(req: Request) {
  const { text } = await req.json()

  if (!text || typeof text !== 'string') {
    return new Response('Missing or invalid prompt', { status: 400 })
  }

  const result = streamText({
    model: openrouter('minimax/minimax-m2.5'),
    system: `You are a PDF document generator. Generate a valid JSON document specification based on the user's prompt.
The JSON must conform to this structure:
{
  "type": "document",
  "title": "string",
  "pages": [
    {
      "title": "optional string",
      "content": [
        { "type": "heading", "text": "string", "level": "h1|h2|h3|h4" },
        { "type": "paragraph", "text": "string" },
        { "type": "table", "headers": ["col1", "col2"], "rows": [["cell1", "cell2"]] },
        { "type": "list", "items": ["item1", "item2"], "ordered": true|false },
        { "type": "divider" },
        { "type": "image", "url": "https://...", "width": 200, "height": 150 },
        { "type": "section", "title": "optional", "content": [...nested elements...] }
      ],
      "pageSize": "A4|Letter",
      "orientation": "portrait|landscape",
      "margin": 40
    }
  ]
}

Requirements:
- Generate realistic, well-structured content based on the prompt
- Use appropriate element types for the content
- Ensure valid JSON syntax
- Always return exactly one JSON object that starts with "{" and ends with "}"
- Use double-quoted keys/strings and include all required commas/brackets
- Omit image elements if you don't have real URLs
- Return ONLY valid JSON, no markdown, no explanations, and no reasoning text`,
    prompt: `Generate a PDF document for: ${text}`,
  })

  return result.toUIMessageStreamResponse()
}
