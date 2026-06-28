import React from 'react';

const avatarData = {
  warrior_m: {
    name: 'Knight Valorous',
    bg: 'linear-gradient(135deg, #ef4444, #f59e0b)',
    svg: (className) => (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="url(#warrior_m_bg)" />
        {/* Helmet */}
        <rect x="35" y="25" width="30" height="35" rx="6" fill="#4b5563" />
        <path d="M50 20 L55 35 L45 35 Z" fill="#ef4444" /> {/* Plume */}
        <rect x="42" y="32" width="16" height="6" rx="2" fill="#1f2937" /> {/* Visor slit */}
        <line x1="50" y1="32" x2="50" y2="38" stroke="#ef4444" strokeWidth="2" />
        {/* Armor shoulders */}
        <path d="M20 80 Q50 65 80 80 L80 100 L20 100 Z" fill="#374151" />
        <path d="M50 65 L50 100" stroke="#9ca3af" strokeWidth="2" />
        <rect x="40" y="70" width="20" height="8" rx="2" fill="#f59e0b" /> {/* Chest emblem */}
        <defs>
          <linearGradient id="warrior_m_bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ef4444" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
  warrior_f: {
    name: 'Shieldmaiden Freya',
    bg: 'linear-gradient(135deg, #f43f5e, #fb7185)',
    svg: (className) => (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="url(#warrior_f_bg)" />
        {/* Gold Tiara / Hair */}
        <path d="M25 45 Q50 25 75 45" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round" />
        <circle cx="50" cy="45" r="18" fill="#ffedd5" /> {/* Face */}
        <path d="M35 30 C30 45 30 65 30 75" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" /> {/* Hair braids */}
        <path d="M65 30 C70 45 70 65 70 75" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
        {/* Tiara crown */}
        <path d="M40 32 L50 22 L60 32 Z" fill="#fbbf24" />
        <circle cx="50" cy="27" r="2.5" fill="#ef4444" />
        {/* Steel Collar / Breastplate */}
        <path d="M22 80 Q50 68 78 80 L78 100 L22 100 Z" fill="#4b5563" />
        <path d="M35 80 L50 95 L65 80" fill="#f43f5e" /> {/* Trim */}
        <defs>
          <linearGradient id="warrior_f_bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f43f5e" />
            <stop offset="1" stopColor="#fb7185" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
  mage_m: {
    name: 'Archmage Zephyr',
    bg: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    svg: (className) => (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="url(#mage_m_bg)" />
        {/* Mage Hat */}
        <path d="M30 40 L50 10 L70 40 Z" fill="#1e1b4b" />
        <ellipse cx="50" cy="40" rx="28" ry="6" fill="#1e1b4b" />
        <path d="M38 38 Q50 35 62 38" stroke="#3b82f6" strokeWidth="4" /> {/* Hat band */}
        <polygon points="50,22 53,28 47,28" fill="#fbbf24" /> {/* Hat gold star */}
        {/* Wizard face with beard */}
        <circle cx="50" cy="50" r="14" fill="#ffedd5" />
        <path d="M36 50 Q50 72 64 50 Q50 82 36 50" fill="#e5e7eb" /> {/* Beard */}
        {/* Robes */}
        <path d="M22 80 Q50 70 78 80 L78 100 L22 100 Z" fill="#312e81" />
        <path d="M50 70 L50 100" stroke="#f59e0b" strokeWidth="2" />
        <defs>
          <linearGradient id="mage_m_bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
  mage_f: {
    name: 'Sorceress Lyra',
    bg: 'linear-gradient(135deg, #a855f7, #ec4899)',
    svg: (className) => (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="url(#mage_f_bg)" />
        {/* Hair and Wizard Hat */}
        <path d="M15 50 C15 30 85 30 85 50 C85 75 75 90 75 95" stroke="#ec4899" strokeWidth="6" fill="none" /> {/* Pink Hair */}
        <path d="M32 38 L50 8 L68 38 Z" fill="#2e1065" /> {/* Pointy Hat */}
        <ellipse cx="50" cy="38" rx="24" ry="5" fill="#2e1065" />
        <circle cx="50" cy="46" r="13" fill="#ffedd5" /> {/* Face */}
        <circle cx="45" cy="45" r="1.5" fill="#312e81" /> {/* Eyes */}
        <circle cx="55" cy="45" r="1.5" fill="#312e81" />
        {/* Robe shoulders */}
        <path d="M24 80 Q50 72 76 80 L76 100 L24 100 Z" fill="#4c1d95" />
        <circle cx="50" cy="78" r="4" fill="#fbbf24" /> {/* Amulet */}
        <defs>
          <linearGradient id="mage_f_bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a855f7" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
  rogue_m: {
    name: 'Shadow Thief',
    bg: 'linear-gradient(135deg, #10b981, #06b6d4)',
    svg: (className) => (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="url(#rogue_m_bg)" />
        {/* Hood */}
        <path d="M25 50 C25 25 75 25 75 50 C75 72 65 80 65 80 L35 80 Z" fill="#1f2937" />
        {/* Masked face */}
        <circle cx="50" cy="50" r="13" fill="#ffedd5" />
        <rect x="36" y="48" width="28" height="15" fill="#111827" /> {/* Mask covering lower face */}
        <path d="M43 44 L48 46 M57 44 L52 46" stroke="#111827" strokeWidth="2" strokeLinecap="round" /> {/* Sneaky eyes */}
        {/* Cloak shoulders */}
        <path d="M22 80 L35 75 L50 82 L65 75 L78 80 L78 100 L22 100 Z" fill="#111827" />
        <defs>
          <linearGradient id="rogue_m_bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10b981" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
  rogue_f: {
    name: 'Whisper Assassin',
    bg: 'linear-gradient(135deg, #14b8a6, #0f766e)',
    svg: (className) => (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="url(#rogue_f_bg)" />
        {/* Rogue Cowl */}
        <path d="M26 48 C26 22 74 22 74 48 C74 70 63 76 63 76 L37 76 Z" fill="#134e4a" />
        <circle cx="50" cy="48" r="12.5" fill="#ffd1b3" /> {/* Face */}
        <path d="M38 46 L46 47 M62 46 L54 47" stroke="#111827" strokeWidth="2.5" /> {/* Eyes */}
        <path d="M36 52 C42 62 58 62 64 52 Z" fill="#0f766e" /> {/* Face mask */}
        {/* Leather Armor shoulders */}
        <path d="M22 76 Q50 68 78 76 L78 100 L22 100 Z" fill="#111827" />
        <path d="M25 76 L50 95 L75 76" fill="#14b8a6" stroke="#0f766e" strokeWidth="2" />
        <defs>
          <linearGradient id="rogue_f_bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#14b8a6" />
            <stop offset="1" stopColor="#0f766e" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
  cyber_m: {
    name: 'Grid Hacker',
    bg: 'linear-gradient(135deg, #06b6d4, #a855f7)',
    svg: (className) => (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="url(#cyber_m_bg)" />
        {/* Spiky hair */}
        <path d="M30 35 L33 22 L40 28 L50 18 L60 28 L67 22 L70 35 Z" fill="#06b6d4" />
        {/* Tech visor */}
        <rect x="35" y="32" width="30" height="28" rx="4" fill="#ff80df" opacity="0.1" /> {/* Face background */}
        <circle cx="50" cy="45" r="14" fill="#e5e7eb" />
        <rect x="32" y="38" width="36" height="10" rx="3" fill="#06b6d4" /> {/* Visor */}
        <line x1="32" y1="43" x2="68" y2="43" stroke="#22d3ee" strokeWidth="2" /> {/* Glowing line */}
        {/* Tech jacket */}
        <path d="M20 78 Q50 68 80 78 L80 100 L20 100 Z" fill="#0f172a" />
        <rect x="42" y="78" width="16" height="22" fill="#06b6d4" /> {/* Cyber zipper */}
        <circle cx="50" cy="85" r="3" fill="#a855f7" />
        <defs>
          <linearGradient id="cyber_m_bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#06b6d4" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
  cyber_f: {
    name: 'Neon Runner',
    bg: 'linear-gradient(135deg, #f43f5e, #a855f7)',
    svg: (className) => (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="url(#cyber_f_bg)" />
        {/* Neon hair with buns */}
        <circle cx="30" cy="25" r="10" fill="#a855f7" />
        <circle cx="70" cy="25" r="10" fill="#a855f7" />
        <path d="M25 45 Q50 25 75 45 L75 60 L25 60 Z" fill="#a855f7" />
        <circle cx="50" cy="46" r="14" fill="#ffd1b3" /> {/* Face */}
        {/* Cyber Visor */}
        <polygon points="30,42 70,42 66,52 34,52" fill="#ec4899" />
        <line x1="30" y1="47" x2="70" y2="47" stroke="#f43f5e" strokeWidth="2.5" />
        {/* Collar / Jacket */}
        <path d="M22 78 Q50 68 78 78 L78 100 L22 100 Z" fill="#1e1b4b" />
        <path d="M30 78 L50 92 L70 78" fill="none" stroke="#ec4899" strokeWidth="3" />
        <defs>
          <linearGradient id="cyber_f_bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f43f5e" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
    )
  }
};

export function Avatar({ avatarId, className = 'w-16 h-16', onClick = null }) {
  const avatar = avatarData[avatarId] || avatarData['warrior_m'];
  return (
    <div 
      onClick={onClick} 
      className={`relative inline-block rounded-full overflow-hidden select-none ${onClick ? 'cursor-pointer transform hover:scale-105 transition-all duration-200 hover:ring-4 hover:ring-brand-purple/50' : ''}`}
      style={{ minWidth: 'fit-content' }}
    >
      {avatar.svg(className)}
    </div>
  );
}

export function getAvatarName(avatarId) {
  return avatarData[avatarId]?.name || 'Unknown Hero';
}

export function getAvatarBg(avatarId) {
  return avatarData[avatarId]?.bg || 'linear-gradient(135deg, #9ca3af, #4b5563)';
}
