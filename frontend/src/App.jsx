import { useState } from 'react';
import Navbar from './components/Navbar';
import ConceptInput from './components/ConceptInput';
import ScenePlayer from './components/ScenePlayer';
import History from './components/History';
import AuthModal from './components/AuthModal';
import PricingPage from './components/PricingPage';
import { useAuth } from './hooks/useAuth';
import { useHistory } from './hooks/useHistory';

export default function App() {
  const [page, setPage]         = useState('home');
  const [authMode, setAuthMode] = useState(null); // 'login' | 'signup' | null
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [data, setData]         = useState(null);

  const { user, login, signup, logout } = useAuth();
  const { history, addEntry, removeEntry, clearHistory } = useHistory();

  const openAuth = (mode) => setAuthMode(mode);
  const closeAuth = () => setAuthMode(null);

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
      const result = await res.json();
      addEntry(concept, result);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar
        user={user}
        onNavigate={setPage}
        onOpenAuth={openAuth}
        onLogout={logout}
      />

      {page === 'pricing' ? (
        <PricingPage onNavigate={setPage} onOpenAuth={openAuth} />
      ) : (
        <div className="app">
          <header className="header">
            <h1>ConceptFlow</h1>
            <p>Type any concept. Watch it explained on a whiteboard — with voice.</p>
          </header>

          <ConceptInput onGenerate={handleGenerate} disabled={loading} />

          <History
            history={history}
            onSelect={setData}
            onRemove={removeEntry}
            onClear={clearHistory}
          />

          {error && <div className="error-msg">{error}</div>}

          {loading && (
            <div className="loading">
              <div className="spinner" />
              <p>Generating your explainer video…</p>
            </div>
          )}

          {data && <ScenePlayer key={data.title} data={data} />}
        </div>
      )}

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={closeAuth}
          onLogin={login}
          onSignup={signup}
        />
      )}
    </>
  );
}
