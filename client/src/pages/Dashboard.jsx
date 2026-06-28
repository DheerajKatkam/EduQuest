import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { api } from '../utils/api';
import { 
  BookOpen, 
  ChevronRight, 
  Lock, 
  Play, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  Award, 
  Trophy, 
  TrendingUp, 
  Loader2 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { click } = useSound();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Track selected level for detail sheet
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelsMap, setLevelsMap] = useState({}); // Stores levels by subjectId

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setError('');
        const subjectsData = await api.game.getSubjects();
        setSubjects(subjectsData);

        // Fetch levels for each subject to construct our maps
        const tempLevels = {};
        for (const sub of subjectsData) {
          const lvls = await api.game.getLevels(sub.id);
          tempLevels[sub.id] = lvls;
        }
        setLevelsMap(tempLevels);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Failed to load quest data. Please check if backend is running.');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const handleLevelClick = (lvl, subjectName) => {
    click();
    setSelectedLevel({
      ...lvl,
      subjectName
    });
  };

  const startLevel = (levelId) => {
    click();
    navigate(`/play/${levelId}`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-bg p-6 min-h-[calc(100vh-73px)]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-purple mb-4" />
        <p className="text-gray-400 font-display font-medium">Loading world map...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-dark-bg p-6 md:p-12 text-gray-200 relative min-h-[calc(100vh-73px)]">
      {/* Decorative glows */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-brand-purple/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />

      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-game-error/15 border border-game-error/20 flex flex-col items-center justify-center text-center gap-3">
          <p className="text-red-300 font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-semibold transition"
          >
            Retry Portal Connection
          </button>
        </div>
      )}

      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Welcome Card */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 md:p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-brand-purple/10 to-transparent blur-3xl pointer-events-none" />
          <div className="space-y-3 z-10 text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-xs font-extrabold text-brand-purple tracking-widest uppercase">
              Realm Explorer
            </span>
            <h2 className="font-display font-extrabold text-3xl text-white">
              Greetings, {user.username}!
            </h2>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Your quest awaits. Click on any unlocked level node below to answer questions, summon your Groq AI tutor, and conquer subjects.
            </p>
          </div>
          
          {/* Circular Level Ring */}
          <div className="relative shrink-0 flex items-center justify-center w-28 h-28 bg-white/5 rounded-full border border-white/5">
            <div className="text-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">Level</span>
              <span className="font-display font-black text-4xl text-brand-cyan">{user.level}</span>
            </div>
            {/* SVG circle track */}
            <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
              <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
              <circle 
                cx="56" 
                cy="56" 
                r="48" 
                stroke="url(#progressGrad)" 
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray="301.59" 
                strokeDashoffset={301.59 - (301.59 * ((user.totalXP % 500) / 500))} 
                strokeLinecap="round"
                className="transition-all duration-700"
              />
              <defs>
                <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="hsl(190, 90%, 50%)" />
                  <stop offset="1" stopColor="hsl(265, 85%, 60%)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Small stats list */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel rounded-3xl p-5 border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Daily Streak</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="font-display font-black text-3xl text-orange-400">{user.streak}</span>
              <span className="text-sm font-semibold text-gray-400">days</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-orange-500/80 font-medium mt-1">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span>Streak active!</span>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-5 border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total XP</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="font-display font-black text-3xl text-brand-purple">{user.totalXP}</span>
              <span className="text-sm font-semibold text-gray-400">XP</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-brand-purple/80 font-medium mt-1">
              <TrendingUp className="w-4 h-4" />
              <span>Level up: {500 - (user.totalXP % 500)} XP to go</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Quest Paths */}
      <div className="space-y-12">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-extrabold text-2xl text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-purple" />
            Subject Quest Lines
          </h3>
          <span className="text-xs text-gray-400 font-medium">Complete Easy levels to unlock Medium campaigns</span>
        </div>

        <div className="space-y-8">
          {subjects.map((subject) => {
            const levels = levelsMap[subject.id] || [];
            
            return (
              <div 
                key={subject.id} 
                className="glass-panel rounded-3xl p-6 border border-white/5 relative overflow-hidden"
              >
                {/* Subject Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/5">
                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-xl text-white tracking-tight">{subject.name}</h4>
                    <p className="text-xs text-gray-400">
                      Progress: {subject.completedLevels} / {subject.totalLevels} Levels Completed
                    </p>
                  </div>

                  {/* Horizontal progress bar */}
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple transition-all duration-500" 
                        style={{ width: `${(subject.completedLevels / (subject.totalLevels || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-gray-400 font-bold">
                      {Math.round((subject.completedLevels / (subject.totalLevels || 1)) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Level Node Map (Horizontal Node Path) */}
                <div className="flex flex-wrap items-center gap-8 md:gap-16 py-4 px-2 overflow-x-auto">
                  {levels.map((lvl, index) => {
                    // Lock logic: Easy levels are unlocked. Medium/Hard levels are locked unless previous levels are completed.
                    const isPreviousCompleted = index === 0 || levels[index - 1].isCompleted;
                    const isUnlocked = index === 0 || isPreviousCompleted;
                    const isCompleted = lvl.isCompleted;

                    return (
                      <div key={lvl.id} className="flex items-center gap-4">
                        {/* Connecting Line (drawn to the left of node, except for first) */}
                        {index > 0 && (
                          <div className={`hidden md:block w-12 h-1 rounded-full ${
                            isCompleted ? 'bg-brand-cyan' : isUnlocked ? 'bg-brand-purple/40' : 'bg-white/5'
                          }`} />
                        )}

                        {/* Interactive Node */}
                        <div className="flex flex-col items-center gap-2">
                          <button
                            disabled={!isUnlocked}
                            onClick={() => handleLevelClick(lvl, subject.name)}
                            className={`w-14 h-14 rounded-full flex items-center justify-center relative cursor-pointer outline-none transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-brand-cyan/20 border-2 border-brand-cyan text-brand-cyan shadow-lg shadow-brand-cyan/25 quest-node-completed hover:scale-105' 
                                : isUnlocked
                                  ? 'bg-brand-purple/10 border-2 border-brand-purple text-brand-purple shadow-lg shadow-brand-purple/15 hover:scale-105 hover:bg-brand-purple/20'
                                  : 'bg-black/40 border border-white/5 text-gray-600 cursor-not-allowed opacity-60'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-6 h-6" />
                            ) : isUnlocked ? (
                              <Play className="w-5 h-5 fill-brand-purple ml-0.5 animate-pulse" />
                            ) : (
                              <Lock className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                          
                          {/* Node Label */}
                          <div className="text-center">
                            <span className="text-xs font-bold text-gray-300 block">{lvl.difficulty}</span>
                            <span className="text-[10px] text-gray-500 font-mono font-medium">+{lvl.xpReward} XP</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Level Details Modal/Sidebar */}
      {selectedLevel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-sparkle">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-white/10 shadow-2xl p-6 relative">
            <h4 className="font-display font-extrabold text-2xl text-white mb-2">
              Quest: {selectedLevel.subjectName}
            </h4>
            <div className="flex items-center gap-2.5 mb-6">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                selectedLevel.difficulty === 'Easy' 
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                  : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
              }`}>
                {selectedLevel.difficulty} Campaign
              </span>
              <span className="text-xs text-gray-400 font-medium">XP Reward: <span className="font-bold text-brand-cyan">+{selectedLevel.xpReward} XP</span></span>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              Answer the quest questions to earn XP points! If you get stuck, call upon your personal AI Tutor for clues, advice, and detailed explanations of concepts.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setSelectedLevel(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 font-bold rounded-2xl transition"
              >
                Close Map
              </button>
              <button
                onClick={() => startLevel(selectedLevel.id)}
                className="flex-1 py-3 bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 text-white font-bold rounded-2xl shadow-lg shadow-brand-purple/20 transition active:scale-[0.98]"
              >
                Begin Quest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
