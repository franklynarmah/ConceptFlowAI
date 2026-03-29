# ConceptFlow

ConceptFlow is an AI-powered educational tool that transforms any concept into an animated whiteboard explanation with voice narration. Type in a topic, and ConceptFlow breaks it down into a 5-scene animated video — complete with hand-drawn visuals, narration scripts, and background music.

Built for the Claude Hackathon.

## Demo

Enter any concept (e.g. "How does DNS work?", "Explain machine learning") and get back an animated whiteboard explainer in seconds.

## Features

- **AI Scene Generation** — Uses Claude to break down any concept into 5 structured, animated scenes
- **Whiteboard Animation Engine** — Draws stick figures, boxes, arrows, databases, clouds, and more on an 800x450 canvas
- **Voice Narration** — Web Speech API (free) or ElevenLabs TTS (Pro)
- **Background Music** — Ambient audio plays during explanations
- **User Auth & History** — Sign up, log in, and revisit past explanations (stored in localStorage)
- **Pricing Tiers** — Starter (free), Pro ($12/mo), Team ($49/mo)

## Tech Stack

**Frontend**
- React 18 + Vite
- Canvas API for animations
- Web Speech API for narration

**Backend**
- Node.js + Express
- Anthropic Claude API (`claude-opus-4-6`)
- ElevenLabs API (optional, for premium voice)

## Getting Started

### Prerequisites

- Node.js
- An [Anthropic API key](https://console.anthropic.com/)
- (Optional) An [ElevenLabs API key](https://elevenlabs.io/) for premium voice

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key   # optional
ELEVENLABS_VOICE_ID=your_voice_id            # optional
PORT=3001
```

Start the server:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`.

> The frontend proxies `/api` requests to `http://localhost:3001`.

### Production Build

```bash
cd frontend
npm run build
```

## Project Structure

```
ConceptFlow/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server entry point
│   │   ├── routes/explain.js     # POST /api/explain
│   │   └── services/
│   │       ├── claude.js         # Scene generation via Claude API
│   │       └── elevenlabs.js     # Premium TTS integration
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── LandingPage.jsx
    │   │   ├── ScenePlayer.jsx
    │   │   ├── WhiteboardCanvas.jsx
    │   │   ├── ConceptInput.jsx
    │   │   ├── History.jsx
    │   │   ├── AuthModal.jsx
    │   │   ├── Navbar.jsx
    │   │   └── PricingPage.jsx
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   └── useHistory.js
    │   └── utils/canvasDrawings.js
    └── package.json
```

## Notes

- Authentication is handled client-side via `localStorage` — suitable for a hackathon demo, not for production.
- The backend is stateless; no database is required.

## License

MIT
