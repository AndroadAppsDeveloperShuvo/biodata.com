import React from 'react';
import { ShieldCheck, MapPin } from 'lucide-react';
import { PersonalInfo, Badge } from '../types/bio';

interface Props {
  profile: PersonalInfo | null;
  badges: Badge[];
}

export const BioHeader: React.FC<Props> = ({ profile, badges }) => {
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
          <span className="bg-emerald-500/90 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Active
          </span>
        </div>
      </div>

      {/* Profile Header & Avatar */}
      <div className="px-5 pt-0 pb-4 relative -mt-14 flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative group">
          <div className="avatar-glow w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 shadow-xl">
            <img
              src={profile.avatarUrl || 'https://i.ibb.co/bRWhx1Lf/4880.jpg'}
              alt={profile.name || 'User'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          {profile.verifiedBadge && (
            <div
              className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full shadow-md border-2 border-slate-950 flex items-center justify-center"
              title="Verified Creator"
            >
              <ShieldCheck className="w-4 h-4 fill-white text-blue-500" />
            </div>
          )}
        </div>

        {/* Names & Title */}
        {profile.name && (
          <h1 className="text-xl sm:text-2xl font-bold mt-2.5 tracking-tight flex items-center gap-1.5 justify-center">
            <span className="profile-name-text font-tech bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
              {profile.name}
            </span>
          </h1>
        )}
        
        {profile.handle && (
          <p className="profile-handle text-xs font-mono text-cyan-400 font-semibold mt-0.5 tracking-wide px-2.5 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-800/40">
            {profile.handle}
          </p>
        )}
        
        {profile.title && (
          <p className="profile-title text-xs text-slate-300 font-medium mt-1 max-w-sm leading-relaxed">
            {profile.title}
          </p>
        )}
        
        {profile.location && (
          <p className="profile-location text-[11px] text-slate-400 mt-1 flex items-center gap-1 justify-center">
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span>{profile.location}</span>
          </p>
        )}

        {/* Bio Text */}
        {profile.bio && (
          <div className="bio-card text-xs text-slate-300 bg-slate-900/70 border border-slate-800/90 px-3.5 py-2.5 rounded-xl mt-3 leading-relaxed text-center max-w-sm shadow-inner">
            <p>{profile.bio}</p>
          </div>
        )}

        {/* Badges List - Only shows if badges exist */}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
            {badges.map((badge) => (
              <span
                key={badge.id}
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-800/90 text-zinc-200 border border-zinc-700/80 flex items-center gap-1 hover:border-zinc-500 transition-colors shadow-sm"
                style={badge.color ? { borderColor: `${badge.color}40` } : undefined}
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
