import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { Avatar } from '../utils/avatars';
import PasswordField from '../components/PasswordField';
import { User, Mail, AlertCircle, Loader2, Lock as Padlock } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { click, correct, incorrect } = useSound();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('warrior_m');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [characters, setCharacters] = useState([]);
  const [loadingChars, setLoadingChars] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch available characters for preview
  useEffect(() => {
    async function loadCharacters() {
      try {
        // Since we are not logged in yet, we can fetch all characters statically or define initial ones.
        // To prevent CORS/Auth errors, let's fall back to a hardcoded representation if the api fails
        // because we don't have a token yet (the /characters endpoint requires auth).
        // Let's list them statically to avoid unauthorized API calls!
        const initialCharacters = [
          { name: 'Knight Valorous', gender: 'male', avatarId: 'warrior_m', unlockXp: 0, isUnlocked: true },
          { name: 'Shieldmaiden Freya', gender: 'female', avatarId: 'warrior_f', unlockXp: 0, isUnlocked: true },
          { name: 'Archmage Zephyr', gender: 'male', avatarId: 'mage_m', unlockXp: 500, isUnlocked: false },
          { name: 'Sorceress Lyra', gender: 'female', avatarId: 'mage_f', unlockXp: 500, isUnlocked: false },
          { name: 'Shadow Thief', gender: 'male', avatarId: 'rogue_m', unlockXp: 1000, isUnlocked: false },
          { name: 'Whisper Assassin', gender: 'female', avatarId: 'rogue_f', unlockXp: 1000, isUnlocked: false },
          { name: 'Grid Hacker', gender: 'male', avatarId: 'cyber_m', unlockXp: 2500, isUnlocked: false },
          { name: 'Neon Runner', gender: 'female', avatarId: 'cyber_f', unlockXp: 2500, isUnlocked: false }
        ];
        setCharacters(initialCharacters);
      } catch (err) {
        console.error('Failed to load characters:', err);
      } finally {
        setLoadingChars(false);
      }
    }
    loadCharacters();
  }, []);

  const handleAvatarSelect = (char) => {
    if (char.unlockXp > 0) {
      incorrect();
      setError(`"${char.name}" is locked. Earn ${char.unlockXp} XP to unlock this character!`);
      return;
    }
    click();
    setSelectedAvatar(char.avatarId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      incorrect();
      setError('Please fill in all fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      incorrect();
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      incorrect();
      setError('Password must be at least 8 characters, include an uppercase letter, a number, and a special character.');
      return;
    }

    if (password !== confirmPassword) {
      incorrect();
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    click();

    try {
      await register(username, email, password, selectedAvatar);
      correct();
      navigate('/dashboard');
    } catch (err) {
      incorrect();
      setError(err.message || 'Registration failed. Try a different username or email.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-dark-bg min-h-[calc(100vh-73px)] relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-brand-purple/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-brand-cyan/10 blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-8 border border-white/5 shadow-2xl relative z-10 animate-sparkle">
        <div className="text-center mb-6">
          <h1 className="font-display font-extrabold text-3xl text-white">Create Your Character</h1>
          <p className="text-sm text-gray-400 mt-1">Select your starting class avatar and fill in your details below.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-game-error/10 border border-game-error/25 flex items-start gap-2.5 text-sm text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Column 1: Avatar Selection */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Choose Avatar</label>
            {loadingChars ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 bg-dark-bg/40 p-4 rounded-2xl border border-white/5">
                {characters.map((char) => {
                  const isSelected = selectedAvatar === char.avatarId;
                  const isLocked = char.unlockXp > 0;
                  return (
                    <div 
                      key={char.avatarId}
                      onClick={() => handleAvatarSelect(char)}
                      className={`relative flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-brand-purple/10 border-brand-purple shadow-md shadow-brand-purple/20' 
                          : isLocked
                            ? 'bg-black/20 border-white/5 opacity-40 hover:opacity-50'
                            : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10'
                      }`}
                      title={isLocked ? `Requires ${char.unlockXp} XP to unlock` : char.name}
                    >
                      <Avatar avatarId={char.avatarId} className="w-12 h-12" />
                      <span className="text-[9px] text-gray-400 mt-1.5 text-center font-semibold truncate w-full">
                        {char.name.split(' ')[0]}
                      </span>
                      
                      {/* Padlock Icon overlay for locked items */}
                      {isLocked && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center text-orange-400">
                          <Padlock className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-gray-400 leading-relaxed">
              ⭐ <span className="font-bold text-brand-cyan">Gamification Tip:</span> Choosing a class gives you a starting visual archetype. Leveling up your overall XP unlocks Mages, Rogues, and Cyberpunks!
            </div>
          </div>

          {/* Column 2: User details */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="KnightValorous"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-dark-bg/60 border border-white/10 rounded-2xl text-gray-200 placeholder-gray-600 outline-none focus:border-brand-purple/60 focus:ring-2 focus:ring-brand-purple/10 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                  <input
                    type="email"
                    placeholder="hero@eduquest.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-dark-bg/60 border border-white/10 rounded-2xl text-gray-200 placeholder-gray-600 outline-none focus:border-brand-purple/60 focus:ring-2 focus:ring-brand-purple/10 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <PasswordField
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                name="password"
                autoComplete="new-password"
                required
              />

              <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                name="confirmPassword"
                autoComplete="new-password"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 text-white font-bold rounded-2xl shadow-lg shadow-brand-purple/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Forging Character...
                </>
              ) : (
                'Forge Account & Play'
              )}
            </button>
          </div>

        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6 text-sm text-gray-400">
          Already registered?{' '}
          <Link
            to="/login"
            onClick={() => click()}
            className="font-bold text-brand-purple hover:underline"
          >
            Enter the portal
          </Link>
        </div>
      </div>
    </div>
  );
}
