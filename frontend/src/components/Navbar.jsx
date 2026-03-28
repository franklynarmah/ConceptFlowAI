import { useState, useRef, useEffect } from 'react';

export default function Navbar({ user, onNavigate, onOpenAuth, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!dropRef.current?.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <nav className="navbar">
      <button className="nav-logo" onClick={() => onNavigate('home')}>
        ConceptFlow
      </button>

      <div className="nav-links">
        <button className="nav-link" onClick={() => onNavigate('pricing')}>Pricing</button>
      </div>

      <div className="nav-actions">
        {user ? (
          <div className="user-menu" ref={dropRef}>
            <button className="user-avatar" onClick={() => setDropdownOpen((v) => !v)}>
              {initials}
            </button>
            {dropdownOpen && (
              <div className="user-dropdown">
                <div className="dropdown-info">
                  <span className="dropdown-name">{user.name}</span>
                  <span className="dropdown-email">{user.email}</span>
                  <span className={`dropdown-plan plan-${user.plan}`}>{user.plan}</span>
                </div>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => { onNavigate('pricing'); setDropdownOpen(false); }}>
                  Upgrade plan
                </button>
                <button className="dropdown-item danger" onClick={() => { onLogout(); setDropdownOpen(false); }}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button className="nav-btn-ghost" onClick={() => onOpenAuth('login')}>Log in</button>
            <button className="nav-btn-solid" onClick={() => onOpenAuth('signup')}>Sign up free</button>
          </>
        )}
      </div>
    </nav>
  );
}
