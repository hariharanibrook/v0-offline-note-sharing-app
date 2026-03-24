import { generateText } from 'ai'

export async function POST(req: Request) {
  try {
    const { content, title } = await req.json()

    if (!content || content.trim().length === 0) {
      return Response.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      system: 'You are a helpful assistant that creates concise, meaningful summaries of notes. Keep summaries to 1-2 sentences and focus on the key points.',
      prompt: `Summarize this note titled "${title}" in 1-2 sentences:\n\n${content.substring(0, 2000)}`,
      temperature: 0.7,
      maxTokens: 100,
    })

    return Response.json({
      summary: result.text,
      usage: result.usage,
    })
  } catch (error) {
    console.error('Error generating summary:', error)
    return Response.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
