import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert visual educator who explains concepts through animated whiteboard-style scenes.

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "title": "Short concept title (3-5 words)",
  "summary": "One clear sentence explaining the concept simply",
  "totalDuration": 45,
  "scenes": [
    {
      "id": 1,
      "title": "Scene title",
      "duration": 10,
      "narration": "2-3 sentence conversational narration. Speak directly to the viewer. Keep it engaging and simple.",
      "drawingInstructions": [
        "Draw a stick figure person on the left labeled 'You'",
        "Draw an arrow pointing right labeled 'Request'",
        "Draw a box on the right labeled 'API'"
      ],
      "drawings": [
        { "type": "stick_figure", "x": 130, "y": 260, "size": 55, "label": "You", "delay": 0 },
        { "type": "arrow", "x1": 195, "y1": 245, "x2": 340, "y2": 210, "label": "Request", "delay": 1.2 },
        { "type": "box", "x": 340, "y": 170, "width": 130, "height": 75, "label": "API", "delay": 2.2 }
      ]
    }
  ]
}

CANVAS: 800 x 450 pixels. Keep all elements within x: 60–740, y: 60–390.

DRAWING TYPES:
  stick_figure: { type, x, y, size (40-70), label, delay }
  box:          { type, x, y, width (80-160), height (50-100), label, delay }
  arrow:        { type, x1, y1, x2, y2, label (optional), delay }
  database:     { type, x, y, size (45-65), label, delay }
  cloud:        { type, x, y, size (55-85), label, delay }
  circle:       { type, x, y, radius (30-60), label, delay }
  text:         { type, x, y, text, delay }
  phone:        { type, x, y, size (40-60), label, delay }
  computer:     { type, x, y, size (55-75), label, delay }

RULES:
- Generate exactly 4 scenes
- Each scene: 3–6 drawing elements
- Stagger delays 0.8–1.2s apart so elements draw one at a time
- Spread elements across the canvas — no overlaps
- drawingInstructions: plain English description of what's being drawn (2-4 steps)
- narration: warm, conversational, 2-3 sentences max
- Return ONLY the JSON, nothing else`;

export async function generateScenes(concept) {
  const msg = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2500,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: `Explain this concept with whiteboard scenes: "${concept}"` }
    ],
  });

  let text = msg.content[0].text.trim();

  // Strip markdown code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) text = fenceMatch[1].trim();

  return JSON.parse(text);
}
