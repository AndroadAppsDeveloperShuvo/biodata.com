import React from 'react';
import { ExternalLink } from 'lucide-react';
import { HighlightService } from '../types/bio';

interface Props {
  services: HighlightService[];
  themeStyle?: string;
}

// Convert numbers to Bengali digits (১, ২, ৩, ৪...)
const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[Number(d)]);
};

export const HighlightsServices: React.FC<Props> = ({ services, themeStyle }) => {
  const isIgnitronSpace = themeStyle === 'ignitron_cyber_space';

  if (!services || services.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1 font-mono">
        <h2 className={`text-xs font-bold uppercase tracking-wider ${
          isIgnitronSpace ? 'text-cyan-300' : 'text-slate-400'
        }`}>
          {isIgnitronSpace ? '[03] MOMENTS_HIGHLIGHTS // MEDIA_GRID' : 'হাইলাইটস ও মোমেন্টস'}
        </h2>
        <span className="text-[10px] text-cyan-400 font-mono">[CAD_GRID]</span>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {services.map((service, index) => {
          return (
            <div
              key={service.id}
              className={`service-card group relative rounded-2xl overflow-hidden aspect-square border transition-all duration-300 ease-out hover:scale-[1.03] active:scale-[0.98] ${
                isIgnitronSpace
                  ? 'bg-slate-950 border-2 border-cyan-400/70 hover:border-pink-500 shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_30px_rgba(255,42,133,0.4)]'
                  : 'bg-slate-900 border-slate-800/90 hover:border-cyan-400/80 shadow-md hover:shadow-cyan-500/20'
              }`}
            >
              {isIgnitronSpace && (
                <>
                  <div className="absolute top-1 left-2.5 text-cyan-400/80 text-[10px] font-bold z-20">+</div>
                  <div className="absolute top-1 right-2.5 text-pink-400/90 text-[8px] font-mono z-20 font-bold bg-slate-950/80 px-1 rounded">
                    [320x320]
                  </div>
                </>
              )}

              {/* Target Link Wrapper */}
              <a
                href={service.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-full block cursor-pointer"
                title={service.title}
              >
                {/* Image with fallback */}
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfH9zfFpRCmlHhd3O2zdevPVkl63_176D67FiAnTlgTQ&s=10';
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />

                {/* UI Matching Colored Corner Badge */}
                <div className={`absolute top-0 left-0 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-br-xl shadow-md border-b border-r font-mono tracking-wider pointer-events-none z-10 flex items-center justify-center min-w-[24px] ${
                  isIgnitronSpace
                    ? 'bg-gradient-to-br from-pink-500 to-purple-600 border-pink-300/50'
                    : 'bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 border-cyan-300/40 font-tech'
                }`}>
                  <span>{toBengaliNumber(index + 1)}</span>
                </div>

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-2.5 transition-opacity group-hover:from-slate-950">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className={`text-[11px] font-bold leading-tight truncate transition-colors ${
                      isIgnitronSpace ? 'text-white group-hover:text-pink-400 font-mono' : 'text-white group-hover:text-cyan-300'
                    }`}>
                      {service.title}
                    </h4>
                    <ExternalLink className="w-3 h-3 text-cyan-400 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[9px] text-cyan-300/90 truncate font-medium mt-0.5 font-sans">
                    {service.subtitle || 'ফটো ও মেমোরিজ'}
                  </p>
                </div>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};
