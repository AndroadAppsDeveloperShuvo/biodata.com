import React from 'react';
import { ExternalLink } from 'lucide-react';
import { HighlightService } from '../types/bio';

interface Props {
  services: HighlightService[];
}

// Convert numbers to Bengali digits (১, ২, ৩, ৪...)
const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[Number(d)]);
};

export const HighlightsServices: React.FC<Props> = ({ services }) => {
  if (!services || services.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Clean original section header */}
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
        হাইলাইটস ও মোমেন্টস
      </h2>

      {/* Services Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {services.map((service, index) => {
          return (
            <div
              key={service.id}
              className="group relative rounded-xl overflow-hidden aspect-square border border-slate-800/90 hover:border-cyan-400/80 transition-all duration-300 bg-slate-900 shadow-md"
            >
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

                {/* UI Matching Colored Corner Badge with Bengali numbers: ১, ২, ৩, ৪... */}
                <div className="absolute top-0 left-0 bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-br-xl shadow-md border-b border-r border-cyan-300/40 font-tech tracking-wider pointer-events-none z-10 flex items-center justify-center min-w-[24px]">
                  <span>{toBengaliNumber(index + 1)}</span>
                </div>

                {/* Dark Gradient Overlay for legible title & subtitle */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-2 transition-opacity group-hover:from-black/90">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-[11px] font-bold text-white leading-tight truncate group-hover:text-cyan-300 transition-colors">
                      {service.title}
                    </h4>
                    <ExternalLink className="w-3 h-3 text-cyan-400 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[9px] text-cyan-300/90 truncate font-medium mt-0.5">
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
