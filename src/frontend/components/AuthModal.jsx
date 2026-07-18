import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const TABS = [
  { key: 'signup', label: 'Create account' },
  { key: 'login', label: 'Sign in' },
];

function SignupForm({ onVerify, onError }) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!validateEmail(email)) { setError('Please enter a valid email'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setSubmitting(true);
    try {
      await signup(name.trim(), email, password);
      onVerify(email.trim().toLowerCase());
    } catch (err) {
      const msg = err.message || 'Signup failed';
      setError(msg);
      onError?.(msg);
    } finally {
      setSubmitting(false);
    }
  }, [name, email, password, confirm, signup, onVerify, onError]);

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form__field">
        <label htmlFor="signup-name" className="auth-form__label">Name</label>
        <input
          id="signup-name"
          className="auth-form__input"
          type="text"
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
          autoComplete="name"
        />
      </div>
      <div className="auth-form__field">
        <label htmlFor="signup-email" className="auth-form__label">Email</label>
        <input
          id="signup-email"
          className="auth-form__input"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          autoComplete="email"
        />
      </div>
      <div className="auth-form__field">
        <label htmlFor="signup-password" className="auth-form__label">Password</label>
        <input
          id="signup-password"
          className="auth-form__input"
          type="password"
          required
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
          autoComplete="new-password"
        />
      </div>
      <div className="auth-form__field">
        <label htmlFor="signup-confirm" className="auth-form__label">Confirm password</label>
        <input
          id="signup-confirm"
          className="auth-form__input"
          type="password"
          required
          placeholder="Re-enter password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={submitting}
          autoComplete="new-password"
        />
      </div>

      {error && <p className="auth-form__error" role="alert">{error}</p>}

      <button className="auth-form__submit btn btn--primary" type="submit" disabled={submitting}>
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}

function VerifyEmail({ email, onSuccess, onBack }) {
  const { confirmSignUp, resendCode } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) { setError('Please enter the verification code'); return; }

    setSubmitting(true);
    try {
      await confirmSignUp(code.trim());
      onSuccess();
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  }, [code, confirmSignUp, onSuccess]);

  const handleResend = useCallback(async () => {
    try {
      await resendCode();
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    }
  }, [resendCode]);

  return (
    <div className="auth-verify">
      <p className="auth-verify__text">
        We sent a verification code to <strong>{email}</strong>
      </p>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-form__field">
          <label htmlFor="verify-code" className="auth-form__label">Verification code</label>
          <input
            id="verify-code"
            className="auth-form__input"
            type="text"
            required
            placeholder="Enter code from email"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={submitting}
            autoComplete="one-time-code"
          />
        </div>

        {error && <p className="auth-form__error" role="alert">{error}</p>}

        <button className="auth-form__submit btn btn--primary" type="submit" disabled={submitting}>
          {submitting ? 'Verifying…' : 'Verify email'}
        </button>
      </form>

      <div className="auth-verify__footer">
        <button className="auth-verify__link" onClick={handleResend} disabled={submitting}>
          {resent ? 'Code sent!' : 'Resend code'}
        </button>
        <button className="auth-verify__link" onClick={onBack} disabled={submitting}>
          Use a different email
        </button>
      </div>
    </div>
  );
}

function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) { setError('Please enter a valid email'); return; }
    if (!password) { setError('Please enter your password'); return; }

    setSubmitting(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }, [email, password, login, onSuccess]);

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form__field">
        <label htmlFor="login-email" className="auth-form__label">Email</label>
        <input
          id="login-email"
          className="auth-form__input"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          autoComplete="email"
        />
      </div>
      <div className="auth-form__field">
        <label htmlFor="login-password" className="auth-form__label">Password</label>
        <input
          id="login-password"
          className="auth-form__input"
          type="password"
          required
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
          autoComplete="current-password"
        />
      </div>

      {error && <p className="auth-form__error" role="alert">{error}</p>}

      <button className="auth-form__submit btn btn--primary" type="submit" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

export default function AuthModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('signup');
  const [verifyEmail, setVerifyEmail] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) { setTab('signup'); setVerifyEmail(null); }
  }, [isOpen]);

  const handleOverlay = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  const isVerifyStep = tab === 'signup' && verifyEmail;

  return (
    <div className="auth-overlay" ref={overlayRef} onClick={handleOverlay} role="dialog" aria-modal="true" aria-label={isVerifyStep ? 'Verify email' : tab === 'signup' ? 'Create account' : 'Sign in'}>
      <div className="auth-modal">
        <button className="auth-modal__close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {!isVerifyStep && (
          <div className="auth-modal__tabs" role="tablist">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                className={`auth-modal__tab${tab === key ? ' auth-modal__tab--active' : ''}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="auth-modal__panel" role="tabpanel">
          {isVerifyStep ? (
            <VerifyEmail
              email={verifyEmail}
              onSuccess={onClose}
              onBack={() => setVerifyEmail(null)}
            />
          ) : tab === 'signup' ? (
            <SignupForm
              onVerify={(email) => setVerifyEmail(email)}
              onError={() => {}}
            />
          ) : (
            <LoginForm onSuccess={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
