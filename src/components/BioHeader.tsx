import React from 'react';
import { ShieldCheck, MapPin } from 'lucide-react';
import { PersonalInfo, Badge } from '../types/bio';

interface Props {
  profile: PersonalInfo | null;
  badges: Badge[];
  themeStyle?: string;
}

export const BioHeader: React.FC<Props> = ({ profile, badges, themeStyle }) => {
  const isUltraGlass = themeStyle === 'ultra_cyber_glass';
  const isGlass = themeStyle === 'dark_glassmorphism';

  if (!profile) {
    return (
      <div>
        <div className="relative h-36 sm:h-44 w-full bg-slate-900/60 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
        </div>
        <div className="px-5 pt-0 pb-4 relative -mt-14 flex flex-col items-center text-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-800 animate-pulse border-2 border-slate-700 shadow-xl" />
          <div className="h-6 w-44 bg-slate-800 rounded-md mt-3 animate-pulse" />
          <div className="h-3.5 w-28 bg-slate-800/80 rounded-md mt-2 animate-pulse" />
          <div className="h-3.5 w-56 bg-slate-800/60 rounded-md mt-2 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Banner Cover */}
      <div className="profile-banner-container relative h-36 sm:h-44 w-full bg-slate-900 overflow-hidden">
        {profile.bannerUrl && (
          <img
            src={profile.bannerUrl}
            alt="Banner"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-80"
          />
        )}
        <div className="profile-banner-overlay absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

        {/* Top Active Status */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <span className={`${
            isUltraGlass
              ? 'bg-zinc-900/80 text-cyan-300 border border-cyan-400/30'
              : isGlass
              ? 'bg-emerald-500/90 text-white shadow-md'
              : 'bg-emerald-500/90 text-white'
          } text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl backdrop-blur-md tracking-wider`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {isUltraGlass ? 'OPEN TO WORK' : 'Active'}
          </span>
        </div>
      </div>

      {/* Profile Header & Avatar */}
      <div className="px-5 pt-0 pb-4 relative -mt-14 flex flex-col items-center text-center">
        {/* Avatar Container */}
        <div className="relative my-3 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
          {/* Outer Decorative Spinning Rings for Ultra Cyber Glass */}
          {isUltraGlass && (
            <>
              {/* Ring 1: Clockwise Cyan Dashed Ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400 pointer-events-none z-0 shadow-[0_0_20px_rgba(34,211,238,0.7)]"
                style={{ animation: 'spinSlow 12s linear infinite' }}
              />
              {/* Ring 2: Counter-Clockwise Purple/Fuchsia Ring */}
              <div
                className="absolute -inset-3 sm:-inset-3.5 rounded-full border-2 border-dashed border-purple-500 pointer-events-none z-0 shadow-[0_0_25px_rgba(168,85,247,0.6)]"
                style={{ animation: 'spinReverse 8s linear infinite' }}
              />
              {/* Ambient Glow Behind Rings */}
              <div
                className="absolute inset-2 rounded-full bg-cyan-400/20 blur-xl pointer-events-none z-0 animate-pulse"
              />
            </>
          )}

          <div
            className={`avatar-glow relative z-10 ${
              isUltraGlass
                ? 'w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-br from-cyan-400 via-purple-500 to-fuchsia-500 shadow-[0_0_40px_rgba(34,211,238,0.6)]'
                : isGlass
                ? 'w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-tr from-cyan-400 via-amber-300 to-pink-400 shadow-xl overflow-hidden'
                : 'w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 shadow-xl overflow-hidden'
            }`}
            style={isUltraGlass ? { animation: 'gradientX 3.5s ease infinite', backgroundSize: '200% 200%' } : undefined}
          >
            <img
              src={profile.avatarUrl || 'https://i.ibb.co/bRWhx1Lf/4880.jpg'}
              alt={profile.name || 'User'}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover ${isUltraGlass ? 'rounded-full' : 'rounded-xl'}`}
            />
          </div>

          {profile.verifiedBadge && (
            <div
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full shadow-md border-2 border-slate-950 flex items-center justify-center z-20"
              title="Verified Creator"
            >
              <ShieldCheck className="w-4 h-4 fill-white text-blue-500" />
            </div>
          )}
        </div>

        {/* Names & Title */}
        {profile.name && (
          <h1 className="text-xl sm:text-2xl font-bold mt-2.5 tracking-tight flex items-center gap-1.5 justify-center">
            <span className={`profile-name-text font-tech ${
              isUltraGlass
                ? 'text-white font-extrabold drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]'
                : isGlass
                ? 'text-slate-900 font-extrabold'
                : 'text-white font-extrabold drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]'
            }`}>
              {profile.name}
            </span>
          </h1>
        )}
        
        {profile.handle && (
          <p className={`profile-handle text-xs font-mono font-semibold mt-1 tracking-wide px-3 py-0.5 rounded-full shadow-sm ${
            isGlass
              ? 'bg-sky-100/90 border border-sky-300/80 text-sky-700 font-bold'
              : 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/40'
          }`}>
            {profile.handle}
          </p>
        )}
        
        {profile.title && (
          <p className={`profile-title text-xs font-medium mt-1.5 max-w-sm leading-relaxed ${
            isGlass ? 'text-slate-700 font-semibold' : 'text-slate-300'
          }`}>
            {profile.title}
          </p>
        )}
        
        {profile.location && (
          <p className={`profile-location text-[11px] mt-1 flex items-center gap-1 justify-center ${
            isGlass ? 'text-slate-600' : 'text-slate-400'
          }`}>
            <MapPin className={`w-3 h-3 ${isGlass ? 'text-sky-600' : 'text-cyan-400'}`} />
            <span>{profile.location}</span>
          </p>
        )}

        {/* Bio Text */}
        {profile.bio && (
          <div className={`bio-card text-xs px-3.5 py-2.5 rounded-xl mt-3 leading-relaxed text-center max-w-sm shadow-sm ${
            isGlass
              ? 'bg-white/70 backdrop-blur-md border border-amber-200/80 text-slate-800 font-medium'
              : 'text-slate-300 bg-slate-900/70 border border-slate-800/90 shadow-inner'
          }`}>
            <p>{profile.bio}</p>
          </div>
        )}

        {/* Badges List - Only shows if badges exist */}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
            {badges.map((badge) => (
              <span
                key={badge.id}
                className={`badge-pill text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors shadow-sm ${
                  isGlass
                    ? 'bg-white/85 text-slate-800 border border-slate-200/90 hover:bg-white'
                    : 'bg-zinc-900/80 text-zinc-200 border border-zinc-700/80 hover:border-cyan-400/50'
                }`}
                style={badge.color && !isGlass ? { borderColor: `${badge.color}60` } : undefined}
              >
                {badge.color && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: badge.color }}
                  />
                )}
                {badge.text}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
