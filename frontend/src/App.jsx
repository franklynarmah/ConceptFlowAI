import { useState } from 'react';
import ConceptInput from './components/ConceptInput';
import ScenePlayer from './components/ScenePlayer';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const handleGenerate = async (concept) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept }),
      });
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({}));
        throw new Error(msg || `Server error ${res.status}`);
      }
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>ConceptFlow</h1>
        <p>Type any concept. Watch it explained on a whiteboard — with voice.</p>
      </header>

      <ConceptInput onGenerate={handleGenerate} disabled={loading} />

      {error && <div className="error-msg">{error}</div>}

      {loading && (
        <div className="loading">
          <div className="spinner" />
          <p>Generating your explainer video…</p>
        </div>
      )}

      {data && <ScenePlayer key={data.title} data={data} />}
    </div>
  );
}
