import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import PasswordField from '../components/PasswordField';

const passwordRules = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'One number', test: (value) => /\d/.test(value) },
  { label: 'One special character', test: (value) => /[^A-Za-z0-9]/.test(value) }
];

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validatePassword = (value) => passwordRules.every((rule) => rule.test(value));

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setMessage('Reset instructions were sent to your inbox. Please use the demo reset form below to continue.');
      setStep('reset');
    }, 700);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      setError('Password must meet all strength requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setMessage('Password updated successfully. You can now return to login and continue your adventure.');
      setStep('done');
    }, 700);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-dark-bg min-h-[calc(100vh-73px)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(102,126,234,0.25),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(240,147,251,0.25),_transparent_45%)]" />
      <div className="w-full max-w-lg glass-panel rounded-3xl p-8 border border-white/5 shadow-2xl relative z-10">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-cyan mb-4 shadow-lg shadow-brand-purple/20">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-white">Recover Your Account</h1>
          <p className="text-sm text-gray-400 mt-2">Secure your quest with a stronger password and a quick recovery flow.</p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hero@eduquest.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-dark-bg/60 border border-white/10 rounded-2xl text-gray-200 placeholder-gray-500 outline-none focus:border-brand-purple/60 focus:ring-2 focus:ring-brand-purple/10 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-gradient-to-r from-brand-purple to-brand-cyan py-3.5 font-bold uppercase tracking-wide text-white shadow-lg shadow-brand-purple/20 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Sending Link</span> : 'Send Reset Link'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-5">
            <PasswordField
              label="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              name="newPassword"
              autoComplete="new-password"
              required
            />
            <PasswordField
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new password"
              name="confirmPassword"
              autoComplete="new-password"
              required
            />
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-400">
              <p className="font-semibold text-gray-200 mb-2">Password requirements</p>
              <ul className="space-y-1">
                {passwordRules.map((rule) => (
                  <li key={rule.label} className={`flex items-center gap-2 ${validatePassword(password) || !password ? 'text-gray-400' : rule.test(password) ? 'text-emerald-300' : 'text-red-300'}`}>
                    <span className={`h-2 w-2 rounded-full ${rule.test(password) ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-gradient-to-r from-brand-purple to-brand-cyan py-3.5 font-bold uppercase tracking-wide text-white shadow-lg shadow-brand-purple/20 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Updating Password</span> : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center text-emerald-300">
            <p className="font-semibold">Adventure secured.</p>
            <Link to="/login" className="mt-3 inline-flex text-sm font-semibold text-brand-cyan hover:underline">Return to login</Link>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-400">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-brand-cyan hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
