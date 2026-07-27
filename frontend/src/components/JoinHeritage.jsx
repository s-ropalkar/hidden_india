import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, MapPin, Landmark, Shield, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import BrandLogo from './BrandLogo';

export default function JoinHeritage({ onNextScreen }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('register'); // register | login | forgot | reset
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const isRegister = mode === 'register';
  const isAuthForm = mode === 'register' || mode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setResetMessage('');

    try {
      if (mode === 'forgot') {
        if (!email) return;
        const res = await api.forgotPassword(email);
        setResetMessage(res.message);
        if (res.resetToken) {
          setResetToken(res.resetToken);
          setMode('reset');
        }
        setIsSubmitting(false);
        return;
      }

      if (mode === 'reset') {
        if (!resetToken || password.length < 6) return;
        await api.resetPassword(resetToken, password);
        setResetMessage('Password updated. You can sign in now.');
        setMode('login');
        setPassword('');
        setIsSubmitting(false);
        return;
      }

      if (!email || !password || (mode === 'register' && !fullName)) return;

      const nextScreen =
        mode === 'register'
          ? await register(fullName, email, password)
          : await login(email, password);

      setShowSuccess(true);
      setIsSubmitting(false);
      onNextScreen(nextScreen);
    } catch (err) {
      setError(err.message || 'Something went wrong. Is the backend running?');
      setIsSubmitting(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setResetMessage('');
  };

  return (
    <div className="auth-root">
      {/* Background */}
      <div className="auth-bg" style={{ backgroundImage: `url(${api.AUTH_HERO_SRC})` }} />
      <div className="auth-bg-overlay" />

      <div className="auth-container">
        {/* Logo */}
        <header className="auth-header">
          <BrandLogo size="hero" showTagline />
        </header>

        {/* Card */}
        <section className="auth-card-wrapper">
          <div className="auth-card">
            {isAuthForm && (
              <div className="auth-icon-ring">
                {isRegister ? <User size={22} strokeWidth={1.5} /> : <Lock size={22} strokeWidth={1.5} />}
              </div>
            )}

            {isAuthForm ? (
              <div className="auth-title-block">
                <h1 className="auth-title">
                  {isRegister ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p className="auth-subtitle">
                  {isRegister
                    ? 'Start your journey to explore Hidden India'
                    : 'Sign in to continue your adventure'}
                </p>
              </div>
            ) : (
              <div className="auth-title-block">
                <h1 className="auth-title">
                  {mode === 'forgot' ? 'Forgot Password' : 'Reset Password'}
                </h1>
                <button type="button" onClick={() => switchMode('login')} className="link-btn">
                  Back to sign in
                </button>
              </div>
            )}

            {error && <div className="alert alert-error">{error}</div>}
            {resetMessage && <div className="alert alert-success">{resetMessage}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === 'register' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-icon-wrap">
                    <input
                      type="text"
                      placeholder="E.g., Arjun Varma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="form-input"
                      required
                    />
                    <User size={18} className="input-icon" />
                  </div>
                </div>
              )}

              {mode !== 'reset' && (
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-icon-wrap">
                    <input
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                      required
                    />
                    <Mail size={18} className="input-icon" />
                  </div>
                </div>
              )}

              {(mode === 'register' || mode === 'login' || mode === 'reset') && (
                <div className="form-group">
                  <label className="form-label">
                    {mode === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  <div className="input-icon-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="input-icon input-btn"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {mode === 'register' && (
                    <p className="form-hint">
                      <CheckCircle size={12} className="hint-icon" />
                      Use at least 6 characters
                    </p>
                  )}
                </div>
              )}

              {mode === 'reset' && (
                <div className="form-group">
                  <label className="form-label">Reset Token</label>
                  <input
                    type="text"
                    placeholder="Paste token from email"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="form-row-end">
                  <button type="button" onClick={() => switchMode('forgot')} className="link-btn-small">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary btn-full"
              >
                {isSubmitting
                  ? 'Please wait...'
                  : isRegister
                    ? 'Create Account'
                    : mode === 'login'
                      ? 'Sign In'
                      : mode === 'forgot'
                        ? 'Send Reset Link'
                        : 'Update Password'}
                <ArrowRight size={16} />
              </button>
            </form>

            {isAuthForm && (
              <p className="auth-switch-text">
                {isRegister ? (
                  <>
                    Already have an account?{' '}
                    <button type="button" onClick={() => switchMode('login')} className="link-bold">
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{' '}
                    <button type="button" onClick={() => switchMode('register')} className="link-bold">
                      Sign up
                    </button>
                  </>
                )}
              </p>
            )}
          </div>
        </section>

        {/* Footer features */}
        {isAuthForm && (
          <footer className="auth-features">
            {isRegister ? (
              <>
                <Feature icon={<MapPin size={20} />} title="Discover Hidden Gems" text="Offbeat places and unique experiences." />
                <Feature icon={<Landmark size={20} />} title="Cultural Heritage" text="Explore India's rich history and traditions." />
              </>
            ) : (
              <>
                <Feature icon={<Shield size={20} />} title="Travel Safe & Smart" text="Curated tips for a safe and smooth journey." />
                <Feature icon={<Heart size={20} />} title="Support Local" text="Empower local communities and preserve heritage." />
              </>
            )}
          </footer>
        )}
      </div>

      {/* Success overlay */}
      <div className={`success-overlay ${showSuccess ? 'visible' : ''}`}>
        <div className="success-content">
          <div className="success-icon-ring">
            <CheckCircle size={40} />
          </div>
          <h2 className="success-title">Welcome, Explorer</h2>
          <p className="success-subtitle">Your heritage journey begins.</p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="feature-item">
      <div className="feature-icon">{icon}</div>
      <div>
        <p className="feature-title">{title}</p>
        <p className="feature-text">{text}</p>
      </div>
    </div>
  );
}
