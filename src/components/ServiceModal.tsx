import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon, Tag, Check, Sparkles } from 'lucide-react';
import { HighlightService } from '../types/bio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit?: HighlightService | null;
  onSave: (serviceData: { title: string; subtitle: string; imageUrl: string; linkUrl: string }) => Promise<void>;
}

export const ServiceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  serviceToEdit,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (serviceToEdit) {
      setTitle(serviceToEdit.title);
      setSubtitle(serviceToEdit.subtitle);
      setImageUrl(serviceToEdit.imageUrl);
      setLinkUrl(serviceToEdit.linkUrl);
    } else {
      setTitle('');
      setSubtitle('ফটো ও মেমোরিজ');
      setImageUrl('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfH9zfFpRCmlHhd3O2zdevPVkl63_176D67FiAnTlgTQ&s=10');
      setLinkUrl('https://');
    }
    setPreviewError(false);
  }, [serviceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !linkUrl.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        subtitle: subtitle.trim() || 'ওয়েব টুলস',
        imageUrl: imageUrl.trim() || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfH9zfFpRCmlHhd3O2zdevPVkl63_176D67FiAnTlgTQ&s=10',
        linkUrl: linkUrl.trim()
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{serviceToEdit ? 'সাভিস এডিট করুন' : 'নতুন সাভিস যোগ করুন'}</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              এটি ওয়েবসাইটে এবং টেলিগ্রাম বটে সাথে সাথে আপডেট হবে
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Title */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 block">
              সাভিসের নাম (Title) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: QR Code Pro Generator"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Subtitle / Category */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 block">
              ক্যাটাগরি বা সাব-টাইটেল
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="যেমন: ফটো ও মেমোরিজ অথবা ওয়েব টুলস"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setSubtitle('ওয়েব টুলস')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-[10px] shrink-0"
              >
                টুলস
              </button>
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 block">
              সাভিসের ছবির লিংক (Image URL)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewError(false);
                }}
                placeholder="https://..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <div className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
                {imageUrl && !previewError ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    onError={() => setPreviewError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </div>
          </div>

          {/* Target Click Link */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 block">
              ক্লিক করলে কোথায় যাবে (Target URL) <span className="text-rose-400">*</span>
            </label>
            <input
              type="url"
              required
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://androadappsdevelopershuvo.github.io/..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="pt-1">
            <span className="text-[10px] text-slate-500 block mb-1">কমন ছবির ডেমো লিংক:</span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setImageUrl('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfH9zfFpRCmlHhd3O2zdevPVkl63_176D67FiAnTlgTQ&s=10')}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300"
              >
                আইকন ১
              </button>
              <button
                type="button"
                onClick={() => setImageUrl('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0WKD8w5ijwQjZ9Kud4DBymrTdPbChGcgVb1HzbEBxMw&s')}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300"
              >
                পিডিএফ আইকন
              </button>
              <button
                type="button"
                onClick={() => setImageUrl('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTj0UXOpAGwxbCdVZGM7hcG5_F5WQDFrjRvfL_g_aRAAQ&s=10')}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300"
              >
                কিউআর কোড
              </button>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !linkUrl.trim()}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-950/50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'সেভ হচ্ছে...' : (serviceToEdit ? 'আপডেট করুন' : 'পাবলিশ করুন')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
