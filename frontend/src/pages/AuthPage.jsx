import { useState } from 'react';
import { request } from '../services/api.js';

export function AuthPage({ onAuthenticated, onClose }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', token: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (mode === 'forgot') {
        const result = await request('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: form.email })
        });
        setMessage(result.message);
        if (result.resetToken) {
          setForm({ ...form, token: result.resetToken });
          setMode('reset');
        }
        return;
      }

      if (mode === 'reset') {
        const result = await request('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ token: form.token, password: form.password })
        });
        setMessage(result.message);
        setForm({ ...form, password: '', token: '' });
        setMode('login');
        return;
      }

      const result = await request(`/auth/${mode === 'register' ? 'register' : 'login'}`, {
        method: 'POST',
        body: JSON.stringify(form)
      });
      localStorage.setItem('todo_token', result.token);
      onAuthenticated(result.user);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <main className="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">×</button>
        <span className="auth-kicker">{mode === 'register' ? 'GET STARTED' : mode === 'reset' ? 'NEW PASSWORD' : mode === 'forgot' ? 'ACCOUNT RECOVERY' : 'WELCOME BACK'}</span>
        <h1 id="auth-title">{mode === 'register' ? 'Create your workspace account' : mode === 'reset' ? 'Choose a new password' : mode === 'forgot' ? 'Forgot your password?' : 'Sign in to continue'}</h1>
        <p>{mode === 'register' ? 'Keep your team and tasks organized in one place.' : mode === 'reset' ? 'Enter your new password below.' : mode === 'forgot' ? 'Enter your account email and we will help you reset it.' : 'Your tasks are waiting for you.'}</p>
      <form onSubmit={submit}>
        {mode === 'register' && <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
        {mode !== 'reset' && <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />}
        {mode === 'reset' && <input required placeholder="Reset token" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} />}
        {mode !== 'forgot' && <input required minLength="6" type="password" placeholder={mode === 'reset' ? 'New password' : 'Password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />}
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        <button type="submit">{mode === 'register' ? 'Register' : mode === 'forgot' ? 'Send reset instructions' : mode === 'reset' ? 'Update password' : 'Login'}</button>
        </form>
        {mode === 'login' && <button className="link-button" type="button" onClick={() => { setError(''); setMessage(''); setMode('forgot'); }}>Forgot password?</button>}
        {mode !== 'reset' && <button className="link-button" type="button" onClick={() => { setError(''); setMessage(''); setMode(mode === 'register' ? 'login' : 'register'); }}>
          {mode === 'register' ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>}
        {(mode === 'forgot' || mode === 'reset') && <button className="link-button" type="button" onClick={() => { setError(''); setMessage(''); setMode('login'); }}>Back to login</button>}
      </main>
    </div>
  );
}
