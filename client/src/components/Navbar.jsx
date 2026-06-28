import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { Avatar } from '../utils/avatars';
import { 
  Zap, 
  Award, 
  Volume2, 
  VolumeX, 
  TrendingUp, 
  Menu, 
  X, 
  Gamepad2, 
  Trophy, 
  User as UserIcon, 
  LogOut 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isMuted, toggleMute, click } = useSound();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLinkClick = () => {
    click();
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    click();
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Render navigation links
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Gamepad2 },
    { name: 'Leaderboard', path: '/social', icon: Trophy },
    { name: 'Profile', path: '/profile', icon: UserIcon }
  ];

  if (!user) return null; // Hide navbar if user is not logged in

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
      {/* Brand Logo */}
      <Link to="/" onClick={handleLinkClick} className="flex items-center gap-2 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center font-display font-extrabold text-xl shadow-lg shadow-brand-purple/20 group-hover:scale-105 transition-transform">
          EQ
        </div>
        <span className="font-display font-black text-2xl tracking-tight gradient-text-purple-cyan group-hover:opacity-90">
          EduQuest
        </span>
      </Link>

      {/* Desktop Main Navigation */}
      <div className="hidden md:flex gap-1 items-center">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={handleLinkClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                active 
                  ? 'bg-brand-purple/15 text-brand-purple border border-brand-purple/20' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-brand-purple' : ''}`} />
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Stats and Profile Controls */}
      <div className="hidden md:flex items-center gap-6">
        {/* Streak Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-display font-bold shadow-sm shadow-orange-500/5 hover:scale-105 transition-transform" title="Daily Login Streak">
          <Zap className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
          <span>{user.streak}d</span>
        </div>

        {/* Level / XP Counter */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400 font-medium">LVL {user.level}</span>
            {/* XP mini-progress bar */}
            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple transition-all duration-500" 
                style={{ width: `${(user.totalXP % 500) / 5}%` }} 
              />
            </div>
            <span className="text-[10px] text-gray-500 font-mono mt-0.5">{user.totalXP % 500}/500 XP</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan" title={`Total XP: ${user.totalXP}`}>
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Audio Toggle */}
        <button 
          onClick={() => { toggleMute(); click(); }}
          className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <div className="flex items-center gap-0.5">
              <Volume2 className="w-5 h-5 mr-1" />
              {/* Sound animation waves */}
              <span className="sound-wave-bar w-[2px] h-[6px] bg-brand-cyan rounded-full inline-block"></span>
              <span className="sound-wave-bar w-[2px] h-[10px] bg-brand-purple rounded-full inline-block"></span>
              <span className="sound-wave-bar w-[2px] h-[8px] bg-brand-pink rounded-full inline-block"></span>
            </div>
          )}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { click(); setDropdownOpen(!dropdownOpen); }}
            className="flex items-center gap-1.5 focus:outline-none"
          >
            <Avatar avatarId={user.character} className="w-10 h-10 border border-white/10" />
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay to close */}
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
              
              <div className="absolute right-0 mt-3 w-48 rounded-2xl glass-panel border border-white/5 shadow-2xl p-2 z-20 animate-sparkle">
                <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-bold text-gray-200 truncate">{user.username}</p>
                </div>
                <Link 
                  to="/profile" 
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  <UserIcon className="w-4 h-4 text-brand-purple" />
                  My Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Right Controls (Hamburger & Sound) */}
      <div className="flex items-center gap-4 md:hidden">
        {/* Audio Toggle (Mobile) */}
        <button 
          onClick={() => { toggleMute(); click(); }}
          className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => { click(); setMenuOpen(!menuOpen); }}
          className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="absolute top-[73px] left-0 right-0 w-full glass-panel border-b border-white/5 p-6 flex flex-col gap-6 md:hidden shadow-2xl z-50 animate-sparkle">
          {/* User Info Mobile */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <Avatar avatarId={user.character} className="w-12 h-12" />
            <div>
              <p className="font-bold text-base text-gray-200">{user.username}</p>
              <p className="text-xs text-gray-400">Level {user.level} Hero • {user.totalXP} XP</p>
            </div>
          </div>

          {/* Navigation Links Mobile */}
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    active 
                      ? 'bg-brand-purple/10 text-brand-purple' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Stats Bar Mobile */}
          <div className="flex justify-around items-center bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Streak</span>
              <div className="flex items-center gap-1 text-orange-400 font-display font-extrabold mt-1">
                <Zap className="w-4 h-4 fill-orange-500 text-orange-500" />
                <span>{user.streak} Days</span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Total XP</span>
              <div className="flex items-center gap-1 text-brand-cyan font-display font-extrabold mt-1">
                <TrendingUp className="w-4 h-4" />
                <span>{user.totalXP} XP</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
