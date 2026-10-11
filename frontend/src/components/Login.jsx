import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    if (isRegistering && form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setSaving(false);
      return;
    }
    try {
      if (isRegistering) await register(form);
      else await login(form);
    } catch (requestError) { setError(requestError.response?.data?.message || (isRegistering ? 'Unable to create account' : 'Unable to sign in')); }
    finally { setSaving(false); }
  };

  const toggleMode = () => {
    setIsRegistering((current) => !current);
    setForm({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const updateField = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const passwordField = (field, visible, setVisible, label) => (
    <label className="form-field">{label}<span className="password-input-wrap"><input type={visible ? 'text' : 'password'} required minLength="8" value={form[field]} onChange={updateField(field)} /><button type="button" className="password-toggle" onClick={() => setVisible((current) => !current)} aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}><span className="password-eye" aria-hidden="true" /></button></span></label>
  );

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-intro">
          <div className="auth-brand"><span className="auth-brand-mark">S</span><span>School ERP</span></div>
          <div className="auth-intro-copy">
            <span className="eyebrow">One connected campus</span>
            <h1>Keep every school day moving forward.</h1>
            <p>Bring students, staff, attendance, and operations into one clear workspace.</p>
          </div>
          <div className="auth-feature-line"><span className="auth-feature-number">01</span><span>Built for the people who keep school running.</span></div>
        </section>
        <form className="auth-panel" onSubmit={submit}>
          <div className="auth-panel-heading"><span className="eyebrow">{isRegistering ? 'Get started' : 'Welcome back'}</span><h2>{isRegistering ? 'Create your account' : 'Sign in to continue'}</h2><p>{isRegistering ? 'Create your account to access school operations.' : 'Use your authorized account to access school operations.'}</p></div>
          {error && <div className="form-error" role="alert">{error}</div>}
          {isRegistering && <label className="form-field">Full name<input type="text" required minLength="2" maxLength="100" value={form.name} onChange={updateField('name')} /></label>}
          <label className="form-field">Email<input type="email" required value={form.email} onChange={updateField('email')} /></label>
          {passwordField('password', showPassword, setShowPassword, 'Password')}
          {isRegistering && passwordField('confirmPassword', showConfirmPassword, setShowConfirmPassword, 'Confirm password')}
          <button className="primary-button" type="submit" disabled={saving}>{saving ? (isRegistering ? 'Creating account...' : 'Signing in...') : (isRegistering ? 'Create account' : 'Sign in')}</button>
          <p className="auth-mode-switch">{isRegistering ? 'Already have an account?' : 'First time here?'} <button className="auth-mode-toggle" type="button" onClick={toggleMode}>{isRegistering ? 'Sign in' : 'Create an account'}</button></p>
          <p className="auth-panel-footnote">Authorized access only</p>
        </form>
      </div>
    </main>
  );
}
