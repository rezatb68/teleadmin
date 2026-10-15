import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Trash2, 
  AlertOctagon, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  ArrowLeftRight,
  Filter,
  Check
} from 'lucide-react';
import { FiltersConfig } from '../types';

interface FiltersTabProps {
  filters: FiltersConfig;
  onUpdateFilters: (filters: Partial<FiltersConfig>) => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const FiltersTab: React.FC<FiltersTabProps> = ({
  filters,
  onUpdateFilters,
  showToast,
}) => {
  const [newBlacklistWord, setNewBlacklistWord] = useState('');
  const [newWhitelistWord, setNewWhitelistWord] = useState('');
  const [newReplacement, setNewReplacement] = useState({ from: '', to: '' });

  // Add Blacklist Word
  const handleAddBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    const word = newBlacklistWord.trim();
    if (!word) return;

    if (filters.blacklistWords.includes(word)) {
      showToast('این کلمه قبلاً در لیست سیاه ثبت شده است.', 'error');
      return;
    }

    const updated = [...filters.blacklistWords, word];
    await onUpdateFilters({ blacklistWords: updated });
    setNewBlacklistWord('');
    showToast(`کلمه «${word}» به لیست سیاه اضافه شد.`, 'success');
  };

  // Remove Blacklist Word
  const handleRemoveBlacklist = async (wordToRemove: string) => {
    const updated = filters.blacklistWords.filter((w) => w !== wordToRemove);
    await onUpdateFilters({ blacklistWords: updated });
    showToast(`کلمه «${wordToRemove}» حذف شد.`, 'info');
  };

  // Add Replacement Rule
  const handleAddReplacement = async (e: React.FormEvent) => {
    e.preventDefault();
    const from = newReplacement.from.trim();
    const to = newReplacement.to.trim();
    if (!from || !to) {
      showToast('هر دو فیلد کلمه اصلی و جایگزین الزامی است.', 'error');
      return;
    }

    const updated = [...filters.replacementWords, { from, to }];
    await onUpdateFilters({ replacementWords: updated });
    setNewReplacement({ from: '', to: '' });
    showToast(`قانون جایگزینی «${from} ➔ ${to}» اضافه شد.`, 'success');
  };

  // Remove Replacement Rule
  const handleRemoveReplacement = async (index: number) => {
    const updated = filters.replacementWords.filter((_, i) => i !== index);
    await onUpdateFilters({ replacementWords: updated });
    showToast('قانون جایگزینی حذف شد.', 'info');
  };

  // Add Whitelist Word
  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    const word = newWhitelistWord.trim();
    if (!word) return;

    if (filters.whitelistWords.includes(word)) {
      showToast('این کلمه در لیست کلمات مجاز موجود است.', 'error');
      return;
    }

    const updated = [...filters.whitelistWords, word];
    await onUpdateFilters({ whitelistWords: updated });
    setNewWhitelistWord('');
    showToast(`کلمه «${word}» به لیست الزامی اضافه شد.`, 'success');
  };

  // Remove Whitelist Word
  const handleRemoveWhitelist = async (wordToRemove: string) => {
    const updated = filters.whitelistWords.filter((w) => w !== wordToRemove);
    await onUpdateFilters({ whitelistWords: updated });
    showToast(`کلمه «${wordToRemove}» حذف شد.`, 'info');
  };

  // Add predefined bundle of blacklist words
  const addPresetBundle = async (presetWords: string[]) => {
    const combined = Array.from(new Set([...filters.blacklistWords, ...presetWords]));
    await onUpdateFilters({ blacklistWords: combined });
    showToast('بسته کلمات پیشنهادی با موفقیت افزوده شد.', 'success');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Info */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-sky-400" />
          مدیریت کلمات کلیدی فیلتر شده و پالایش محتوا
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          برای حفظ کیفیت کانال و جلوگیری از انتشار اخبار نامناسب، کلمات ممنوعه (لیست سیاه)، قوانین جایگزینی واژگان و کلمات کلیدی موضوعی را تنظیم کنید.
        </p>
      </div>

      {/* Section 1: Blacklist Keywords (Main Requirement) */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              کلمات کلیدی ممنوعه (Blacklist)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              هر خبری که شامل این کلمات باشد، به طور کامل رد شده و در کانال منتشر نخواهد شد.
            </p>
          </div>

          {/* Quick Bundles */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">افزودن بسته‌های آماده:</span>
            <button
              type="button"
              onClick={() => addPresetBundle(['قمار', 'کازینو', 'شرط‌بندی', 'bet', 'casino', 'gambling'])}
              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition cursor-pointer"
            >
              + شرط‌بندی و قمار
            </button>
            <button
              type="button"
              onClick={() => addPresetBundle(['اسپانسری', 'تبلیغات', 'promoted', 'sponsored', 'تبلیغاتی'])}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition cursor-pointer"
            >
              + تبلیغات و اسپانسر
            </button>
          </div>
        </div>

        {/* Add Blacklist Input */}
        <form onSubmit={handleAddBlacklist} className="flex gap-2">
          <input
            type="text"
            placeholder="کلمه یا عبارت ممنوعه را بنویسید (مثلاً: شرط‌بندی، پورن، کلاهبرداری...)"
            value={newBlacklistWord}
            onChange={(e) => setNewBlacklistWord(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md shadow-rose-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن به فیلتر</span>
          </button>
        </form>

        {/* Blacklist Tags Display */}
        <div className="flex flex-wrap gap-2 pt-2">
          {filters.blacklistWords.length === 0 ? (
            <span className="text-xs text-slate-500">هیچ کلمه‌ای در لیست سیاه ثبت نشده است.</span>
          ) : (
            filters.blacklistWords.map((word) => (
              <span
                key={word}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs font-medium"
              >
                <span>{word}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBlacklist(word)}
                  className="text-rose-400 hover:text-white transition cursor-pointer"
                  title="حذف کلمه"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Section 2: Auto Replacement Rules */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-sky-400" />
            قوانین جایگزینی خودکار کلمات (Word Replacement)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            کلماتی که مایلید پیش از ارسال به کانال، به صورت خودکار با واژه دلخواه شما تعویض شوند (مثلاً: تبدیل واژه‌های انگلیسی به فارسی یا سانسور ملایم).
          </p>
        </div>

        {/* Add Replacement Form */}
        <form onSubmit={handleAddReplacement} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          <input
            type="text"
            placeholder="کلمه اصلی (مثلاً: AI)"
            value={newReplacement.from}
            onChange={(e) => setNewReplacement({ ...newReplacement, from: e.target.value })}
            className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600"
          />
          <input
            type="text"
            placeholder="کلمه جایگزین (مثلاً: هوش مصنوعی)"
            value={newReplacement.to}
            onChange={(e) => setNewReplacement({ ...newReplacement, to: e.target.value })}
            className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت قانون</span>
          </button>
        </form>

        {/* Replacement Table/List */}
        <div className="space-y-2 pt-1">
          {filters.replacementWords.map((rule, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-rose-300 font-mono">{rule.from}</span>
                <span className="text-slate-500">➔</span>
                <span className="font-semibold text-emerald-300 font-mono">{rule.to}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveReplacement(idx)}
                className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                title="حذف قانون"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Whitelist & Minimum Length */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-400" />
              کلمات کلیدی الزامی و فیلتر طول محتوا (Whitelist)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              تنها اخباری را منتشر کن که حداقل یکی از این کلمات کلیدی مشخص را داشته باشند.
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <span>فعال‌سازی فیلتر الزامی:</span>
            <input
              type="checkbox"
              checked={filters.requireWhitelist}
              onChange={(e) => onUpdateFilters({ requireWhitelist: e.target.checked })}
              className="accent-emerald-500 w-4 h-4 cursor-pointer"
            />
          </label>
        </div>

        {filters.requireWhitelist && (
          <div className="space-y-3 pt-2">
            <form onSubmit={handleAddWhitelist} className="flex gap-2">
              <input
                type="text"
                placeholder="کلمه کلیدی الزامی (مثلاً: هوش مصنوعی، تسلا، اپل، کریپتو...)"
                value={newWhitelistWord}
                onChange={(e) => setNewWhitelistWord(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {filters.whitelistWords.map((word) => (
                <span
                  key={word}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs font-medium"
                >
                  <span>{word}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWhitelist(word)}
                    className="text-emerald-400 hover:text-white transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Content Length Safeguard */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              حداقل طول متن خبر (کاراکتر) برای جلوگیری از ارسال محتوای ناقص
            </span>
            <span className="text-xs font-bold font-mono text-sky-400">
              {filters.minContentLength} کاراکتر
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="200"
            step="10"
            value={filters.minContentLength}
            onChange={(e) => onUpdateFilters({ minContentLength: Number(e.target.value) })}
            className="w-full accent-sky-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
