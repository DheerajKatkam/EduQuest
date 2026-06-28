import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Sparkles, Trophy, BrainCircuit } from 'lucide-react';

const highlights = [
  { title: 'Adaptive Quests', text: 'Practice math, science, history, and languages through gamified levels.' },
  { title: 'AI Tutor', text: 'Use Groq-powered hints to stay on track without spoiling the answer.' },
  { title: 'Streaks & XP', text: 'Earn titles, unlock avatars, and climb the leaderboard every day.' }
];

export default function LandingPage() {
  return (
    <div className="flex-1 relative overflow-hidden bg-dark-bg min-h-[calc(100vh-73px)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(102,126,234,0.25),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(240,147,251,0.2),_transparent_35%)]" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-24">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-purple/20 bg-brand-purple/10 px-4 py-2 text-sm font-semibold text-brand-cyan">
            <Sparkles className="h-4 w-4" />
            Production-ready gamified learning platform
          </div>
          <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Level up your learning with <span className="gradient-text-purple-cyan">EduQuest</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-400">
            Turn every study session into an adventure. Answer quests, earn XP, unlock avatars, and get AI-powered hints as you grow from novice scholar to legendary genius.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" className="rounded-2xl bg-gradient-to-r from-brand-purple to-brand-cyan px-6 py-3.5 font-bold uppercase tracking-wide text-white shadow-lg shadow-brand-purple/20 transition hover:scale-[1.02]">
              Start Your Adventure
            </Link>
            <Link to="/login" className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-gray-200 transition hover:bg-white/10">
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-12 w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl lg:mt-0">
          <div className="grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple/30 to-brand-cyan/20 text-brand-cyan">
                  {item.title.includes('AI') ? <BrainCircuit className="h-5 w-5" /> : item.title.includes('XP') ? <Trophy className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                </div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-brand-cyan/20 bg-brand-cyan/10 p-4 text-sm text-brand-cyan">
            <p className="font-semibold">Ready to begin?</p>
            <p className="mt-1">Create your hero, choose a subject, and start your first quest today.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
