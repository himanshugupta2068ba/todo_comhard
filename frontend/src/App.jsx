import { useEffect, useState } from 'react';
import { Dashboard } from './pages/Dashboard.jsx';
import { request } from './services/api.js';
import './styles.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('todo_token')));

  useEffect(() => {
    if (!loading) return;
    request('/auth/me').then((result) => setUser(result.user)).catch(() => localStorage.removeItem('todo_token')).finally(() => setLoading(false));
  }, [loading]);

  if (loading) return <p className="loading">Loading...</p>;
  return (
    <Dashboard
      user={user}
      onLogin={() => setAuthOpen(true)}
      onLogout={() => { localStorage.removeItem('todo_token'); setUser(null); }}
      authOpen={authOpen}
      onCloseAuth={() => setAuthOpen(false)}
      onAuthenticated={(authenticatedUser) => {
        setUser(authenticatedUser);
        setAuthOpen(false);
      }}
    />
  );
}
