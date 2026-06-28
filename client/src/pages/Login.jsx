import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import PasswordField from '../components/PasswordField';
import { Mail, User, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { click, correct, incorrect } = useSound();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      incorrect();
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setSubmitting(true);
    click();

    try {
      await login(usernameOrEmail, password);
      correct();
      navigate('/dashboard');
    } catch (err) {
      incorrect();
      setError(err.message || 'Invalid credentials. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-dark-bg min-h-[calc(100vh-73px)]">
      {/* Decorative backdrop glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-brand-purple/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-brand-cyan/10 blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-white/5 shadow-2xl relative z-10 animate-sparkle">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-cyan items-center justify-center font-display font-extrabold text-2xl shadow-xl shadow-brand-purple/20 mb-4 animate-float">
            EQ
          </div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-white mb-2">
            Welcome Back, Hero!
          </h1>
          <p className="text-sm text-gray-400">
            Log in to continue your learning quest and earn XP rewards.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-game-error/10 border border-game-error/20 flex items-start gap-2.5 text-sm text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username or Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Username or Email</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Enter username or email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-dark-bg/60 border border-white/10 rounded-2xl text-gray-200 placeholder-gray-500 outline-none focus:border-brand-purple/60 focus:ring-2 focus:ring-brand-purple/10 transition-all font-medium"
              />
            </div>
          </div>

          <PasswordField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            name="password"
            autoComplete="current-password"
            required
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-95 text-white font-bold rounded-2xl shadow-lg shadow-brand-purple/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-base mt-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Entering Quest...
              </>
            ) : (
              'Enter EduQuest'
            )}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-2 border-t border-white/5 pt-6 text-sm text-gray-400">
          <Link to="/forgot-password" className="font-semibold text-brand-cyan hover:underline">Forgot Password?</Link>
          New to the realm?{' '}
          <Link
            to="/register"
            onClick={() => click()}
            className="font-bold text-brand-cyan hover:underline"
          >
            Create your character
          </Link>
        </div>
      </div>
    </div>
  );
}
