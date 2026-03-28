import express from 'express';
import { generateScenes } from '../services/claude.js';
import { generateSpeech } from '../services/elevenlabs.js';

const router = express.Router();

// Generate scene breakdown for a concept
router.post('/explain', async (req, res) => {
  const { concept } = req.body;
  if (!concept?.trim()) return res.status(400).json({ error: 'concept is required' });

  try {
    const data = await generateScenes(concept.trim());
    res.json(data);
  } catch (err) {
    console.error('[explain]', err.message);
    res.status(500).json({ error: 'Failed to generate explanation. Check your ANTHROPIC_API_KEY.' });
  }
});

// Generate ElevenLabs narration for a single scene
router.post('/narrate', async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'text is required' });

  try {
    const audio = await generateSpeech(text.trim());
    res.json({ audio });
  } catch (err) {
    console.error('[narrate]', err.message);
    res.status(500).json({ error: 'Failed to generate narration. Check your ELEVENLABS_API_KEY.' });
  }
});

export default router;
