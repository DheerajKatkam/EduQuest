import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { api } from '../utils/api';
import { Avatar, getAvatarBg, getAvatarName } from '../utils/avatars';
import { 
  Award, 
  Flame, 
  Sparkles, 
  ChevronRight, 
  ShieldAlert, 
  User, 
  Check, 
  Lock, 
  Loader2, 
  Trophy 
} from 'lucide-react';

export default function Profile() {
  const { user, updateAvatarInState, refreshProfile } = useAuth();
  const { click, correct, incorrect, levelUp } = useSound();

  const [avatarsList, setAvatarsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    async function loadCharacters() {
      try {
        const data = await api.auth.getCharacters();
        setAvatarsList(data);
      } catch (err) {
        console.error('Failed to load avatars list:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadCharacters();
    }
  }, [user]);

  const handleSelectAvatar = async (char) => {
    if (!char.isUnlocked || updating) {
      incorrect();
      setFeedbackMsg({
        text: `Avatar "${char.name}" is locked! Reach ${char.unlockXp} XP to unlock.`,
        type: 'error'
      });
      return;
    }

    if (user.character === char.avatarId) return;

    setUpdating(true);
    click();
    setFeedbackMsg({ text: '', type: '' });

    try {
      await api.auth.updateAvatar(char.avatarId);
      updateAvatarInState(char.avatarId);
      correct();
      setFeedbackMsg({
        text: `Avatar changed to ${char.name}!`,
        type: 'success'
      });
      // Refresh user context details
      await refreshProfile();
    } catch (err) {
      incorrect();
      setFeedbackMsg({ text: err.message, type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-bg p-6 min-h-[calc(100vh-73px)]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-purple mb-4" />
        <p className="text-gray-400 font-display font-medium">Entering Wardrobe Vault...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-dark-bg p-6 md:p-12 text-gray-200 min-h-[calc(100vh-73px)] relative">
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-purple/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto z-10 relative grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Player Card / Stats Overview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-white/5 text-center relative overflow-hidden">
            {/* Gradient background strip */}
            <div 
              className="absolute top-0 left-0 right-0 h-24 opacity-60"
              style={{ background: getAvatarBg(user.character) }}
            />
            
            {/* Player Avatar */}
            <div className="relative mt-8 mb-4 inline-block z-10">
              <Avatar avatarId={user.character} className="w-24 h-24 ring-4 ring-white/10" />
            </div>

            <div className="space-y-1 relative z-10">
              <h3 className="font-display font-black text-xl text-white tracking-tight">{user.username}</h3>
              <p className="text-xs text-gray-400 font-semibold">{getAvatarName(user.character)} Class</p>
              <p className="text-[11px] text-gray-500 font-mono mt-0.5">UID: #{user.id}</p>
            </div>

            {/* Micro details stats bar */}
            <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-white/5 bg-black/20 -mx-6 -mb-6 p-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-orange-400 font-display font-extrabold text-lg">
                  <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                  <span>{user.streak}d</span>
                </div>
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Active Streak</span>
              </div>
              <div className="text-center border-l border-white/5">
                <div className="flex items-center justify-center gap-1 text-brand-cyan font-display font-extrabold text-lg">
                  <Award className="w-4 h-4" />
                  <span>LVL {user.level}</span>
                </div>
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Realm Level</span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-5 border border-white/5 space-y-4">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Campaign XP Record</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Total Gathered XP</span>
                <span className="font-bold text-brand-purple font-mono">{user.totalXP} XP</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">XP until Level Up</span>
                <span className="font-bold text-brand-cyan font-mono">{500 - (user.totalXP % 500)} XP</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                  style={{ width: `${(user.totalXP % 500) / 5}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 & 3: Avatar Wardrobe Vault */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="font-display font-extrabold text-2xl text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-brand-purple" />
              Cosmetics Wardrobe
            </h3>
            <span className="text-xs text-gray-400 font-medium">Equip unlocked class avatars</span>
          </div>

          {feedbackMsg.text && (
            <div className={`p-4 rounded-2xl border flex items-start gap-2.5 text-sm animate-sparkle ${
              feedbackMsg.type === 'success'
                ? 'bg-game-success/10 border-game-success/20 text-green-300'
                : 'bg-game-error/10 border-game-error/25 text-red-300'
            }`}>
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {avatarsList.map((char) => {
              const isActiveAvatar = user.character === char.avatarId;
              const isLocked = !char.isUnlocked;
              const progressPercentage = Math.min((user.totalXP / char.unlockXp) * 100, 100);

              return (
                <div
                  key={char.avatarId}
                  onClick={() => handleSelectAvatar(char)}
                  className={`glass-panel rounded-2xl p-4 border flex flex-col items-center justify-between text-center transition-all duration-300 relative select-none ${
                    isActiveAvatar
                      ? 'border-brand-purple bg-brand-purple/5 shadow-md shadow-brand-purple/10'
                      : isLocked
                        ? 'opacity-40 border-white/5 hover:opacity-50 cursor-pointer'
                        : 'border-white/5 hover:border-white/10 hover:bg-white/5 cursor-pointer'
                  }`}
                >
                  <Avatar avatarId={char.avatarId} className="w-16 h-16" />
                  
                  <div className="mt-3 space-y-1">
                    <span className="font-display font-bold text-sm text-white block leading-snug">
                      {char.name}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold block">
                      {char.gender}
                    </span>
                  </div>

                  {/* Dynamic Locker indicator */}
                  <div className="w-full mt-4">
                    {isActiveAvatar ? (
                      <span className="py-1 px-3 bg-brand-purple/20 text-brand-purple border border-brand-purple/25 rounded-full text-[10px] font-black inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    ) : isLocked ? (
                      <div className="space-y-1">
                        <span className="py-1 px-2.5 bg-black/40 text-orange-400 border border-orange-400/20 rounded-full text-[9px] font-bold inline-flex items-center gap-1 leading-none">
                          <Lock className="w-2.5 h-2.5" /> Lock: {char.unlockXp} XP
                        </span>
                        {/* mini unlock progress bar */}
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1.5" title={`${user.totalXP}/${char.unlockXp} XP`}>
                          <div 
                            className="h-full bg-orange-400"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="py-1 px-3 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5 rounded-full text-[10px] font-bold inline-flex">
                        Equip Class
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
