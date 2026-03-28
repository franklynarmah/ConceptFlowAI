import { useState, useEffect, useRef, useCallback } from 'react';
import WhiteboardCanvas from './WhiteboardCanvas';

function base64ToBlob(b64) {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: 'audio/mpeg' });
}

export default function ScenePlayer({ data }) {
  const { title, summary, scenes } = data;

  const [sceneIdx, setSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [animDone, setAnimDone] = useState(false);

  const audioRefs = useRef([]);      // Audio objects per scene
  const audioUrlsRef = useRef([]);   // Object URLs to revoke on cleanup
  const activeAudioRef = useRef(null);
  const canvasRef = useRef(null);

  const totalScenes = scenes.length;
  const scene = scenes[sceneIdx];

  // ── Fetch all narrations upfront ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingAudio(true);
      const results = await Promise.all(
        scenes.map(async (s) => {
          try {
            const res = await fetch('/api/narrate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: s.narration }),
            });
            const { audio } = await res.json();
            const url = URL.createObjectURL(base64ToBlob(audio));
            audioUrlsRef.current.push(url);
            return new Audio(url);
          } catch {
            return null; // narration failed gracefully
          }
        })
      );
      if (!cancelled) {
        audioRefs.current = results;
        setLoadingAudio(false);
        // Auto-play once audio is ready
        setIsPlaying(true);
      }
    };

    load();
    return () => {
      cancelled = true;
      activeAudioRef.current?.pause();
      audioUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Scene advancement ─────────────────────────────────────────────────────
  const advanceTo = useCallback((idx) => {
    activeAudioRef.current?.pause();
    activeAudioRef.current = null;
    setAnimDone(false);
    setSceneIdx(idx);
  }, []);

  const handleNext = useCallback(() => {
    if (sceneIdx < totalScenes - 1) advanceTo(sceneIdx + 1);
    else setIsPlaying(false);
  }, [sceneIdx, totalScenes, advanceTo]);

  // ── Start audio when scene changes (while playing) ────────────────────────
  useEffect(() => {
    if (!isPlaying || loadingAudio) return;

    const audio = audioRefs.current[sceneIdx];
    if (!audio) return;

    activeAudioRef.current = audio;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    audio.onended = () => {
      // Advance only after animation is also done (or wait a beat)
      setTimeout(handleNext, 400);
    };
  }, [sceneIdx, isPlaying, loadingAudio, handleNext]);

  // ── Play / Pause ──────────────────────────────────────────────────────────
  const handlePlayPause = () => {
    if (isPlaying) {
      activeAudioRef.current?.pause();
      setIsPlaying(false);
    } else {
      const audio = audioRefs.current[sceneIdx];
      if (audio) {
        activeAudioRef.current = audio;
        audio.play().catch(() => {});
        audio.onended = () => setTimeout(handleNext, 400);
      }
      setIsPlaying(true);
    }
  };

  const goTo = (idx) => {
    advanceTo(idx);
    setIsPlaying(false);
  };

  // ── Canvas export (MediaRecorder) ─────────────────────────────────────────
  const handleExport = async () => {
    if (isExporting || loadingAudio) return;
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    setIsExporting(true);

    try {
      const videoStream = canvas.captureStream(30);
      const audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();

      const combined = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);

      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(combined, { mimeType: mime });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.webm`;
        a.click();
        setIsExporting(false);
      };

      recorder.start(100);

      // Play all scenes sequentially for recording
      const playForExport = (idx) => {
        if (idx >= scenes.length) {
          setTimeout(() => recorder.stop(), 600);
          return;
        }
        setSceneIdx(idx);
        setIsPlaying(true);

        const audio = audioRefs.current[idx];
        if (audio) {
          const src = audioCtx.createMediaElementSource(audio);
          src.connect(dest);
          src.connect(audioCtx.destination);
          audio.currentTime = 0;
          audio.play().catch(() => {});
          audio.onended = () => setTimeout(() => playForExport(idx + 1), 500);
        } else {
          setTimeout(() => playForExport(idx + 1), 4000);
        }
      };

      playForExport(0);
    } catch (err) {
      console.error('Export failed:', err);
      setIsExporting(false);
    }
  };

  const progress = ((sceneIdx + 1) / totalScenes) * 100;

  return (
    <div className="player">
      {/* Header */}
      <div className="player-meta">
        <div className="player-meta-left">
          <h2>{title}</h2>
          <p>{summary}</p>
        </div>
        <div className="meta-badge">
          <span className="badge">{totalScenes} scenes</span>
          <span className="badge">{data.totalDuration || '~45'}s</span>
          <span className="badge green">ElevenLabs voice</span>
        </div>
      </div>

      {/* Whiteboard */}
      <div className="whiteboard-section">
        <div className="canvas-wrapper" ref={canvasRef}>
          <WhiteboardCanvas
            key={sceneIdx}
            scene={scene}
            isPlaying={isPlaying}
            onAnimationComplete={() => setAnimDone(true)}
          />
          <div className="scene-badge">
            Scene {sceneIdx + 1}: {scene.title}
          </div>
          {loadingAudio && (
            <div className="audio-loading-overlay">
              <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
              Generating narration…
            </div>
          )}
        </div>

        {/* Narration text */}
        <div className={`narration ${isPlaying ? 'active' : ''}`}>
          "{scene.narration}"
        </div>

        {/* Controls */}
        <div className="controls">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="controls-row">
            <div className="playback-btns">
              <button
                className="ctrl-btn"
                onClick={() => goTo(Math.max(0, sceneIdx - 1))}
                disabled={sceneIdx === 0}
                title="Previous"
              >⏮</button>
              <button
                className="ctrl-btn play-btn"
                onClick={handlePlayPause}
                disabled={loadingAudio}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {loadingAudio ? '⏳' : isPlaying ? '⏸' : '▶'}
              </button>
              <button
                className="ctrl-btn"
                onClick={() => goTo(Math.min(totalScenes - 1, sceneIdx + 1))}
                disabled={sceneIdx === totalScenes - 1}
                title="Next"
              >⏭</button>
            </div>

            <span className="scene-counter">Scene {sceneIdx + 1} / {totalScenes}</span>

            <button
              className="export-btn"
              onClick={handleExport}
              disabled={loadingAudio || isExporting}
              title="Download as video"
            >
              {isExporting ? '⏳ Recording…' : '⬇ Export Video'}
            </button>
          </div>
        </div>

        {/* Scene tabs */}
        <div className="scene-tabs" style={{ padding: '0 1.25rem 1rem' }}>
          {scenes.map((s, i) => (
            <button
              key={s.id}
              className={`scene-tab ${i === sceneIdx ? 'active' : ''}`}
              onClick={() => goTo(i)}
            >
              {i + 1}. {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Script panel — full breakdown */}
      <div className="script-panel">
        <div className="script-panel-header">Full Script & Drawing Instructions</div>
        <div className="scene-cards">
          {scenes.map((s, i) => (
            <div
              key={s.id}
              className={`scene-card ${i === sceneIdx ? 'active' : ''}`}
              onClick={() => goTo(i)}
            >
              <div className="scene-num">{i + 1}</div>
              <div>
                <div className="scene-card-title">{s.title}</div>
                <div className="scene-card-narration">"{s.narration}"</div>
                {s.drawingInstructions?.length > 0 && (
                  <div className="drawing-steps">
                    {s.drawingInstructions.map((step, j) => (
                      <div key={j} className="drawing-step">{step}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
