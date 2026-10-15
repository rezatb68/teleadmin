import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Power, 
  Layers, 
  Sliders, 
  Sparkles,
  Timer
} from 'lucide-react';
import { SchedulerConfig } from '../types';

interface SchedulerTabProps {
  config: SchedulerConfig;
  onUpdate: (updated: Partial<SchedulerConfig>) => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SchedulerTab: React.FC<SchedulerTabProps> = ({
  config,
  onUpdate,
  showToast,
}) => {
  const [newHour, setNewHour] = useState('12:00');

  // Toggle master automation switch
  const handleToggleEnabled = async () => {
    const nextState = !config.enabled;
    await onUpdate({ enabled: nextState });
    showToast(nextState ? 'انتشار خودکار فعال شد 🚀' : 'انتشار خودکار متوقف شد', nextState ? 'success' : 'info');
  };

  // Change mode (interval vs specific_hours)
  const handleModeChange = async (mode: 'interval' | 'specific_hours') => {
    await onUpdate({ mode });
    showToast('حالت زمان‌بندی تغییر کرد', 'info');
  };

  // Add specific hour
  const handleAddHour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHour) return;

    if (config.specificHours.includes(newHour)) {
      showToast('این ساعت قبلاً اضافه شده است.', 'error');
      return;
    }

    const updated = [...config.specificHours, newHour].sort();
    await onUpdate({ specificHours: updated });
    showToast(`ساعت ${newHour} به برنامه اضافه شد.`, 'success');
  };

  // Remove specific hour
  const handleRemoveHour = async (hourToRemove: string) => {
    const updated = config.specificHours.filter((h) => h !== hourToRemove);
    await onUpdate({ specificHours: updated });
    showToast(`ساعت ${hourToRemove} حذف شد.`, 'info');
  };

  // Quick preset schedules
  const applyPresetSchedule = async (presetHours: string[]) => {
    await onUpdate({
      mode: 'specific_hours',
      specificHours: presetHours,
    });
    showToast('برنامه زمان‌بندی پیشنهادی اعمال شد.', 'success');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Info */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-sky-400" />
          تنظیمات زمان‌بندی و انتشار خودکار
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          مشخص کنید ربات در چه ساعت‌هایی یا در چه فواصل زمانی منابع را چک کرده و پست جدید در کانال تلگرام منتشر کند.
        </p>
      </div>

      {/* Master Enable/Disable Switch Card */}
      <div className={`p-6 rounded-2xl border transition ${
        config.enabled 
          ? 'bg-gradient-to-r from-sky-950/40 via-slate-900/80 to-slate-900/60 border-sky-500/40' 
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleEnabled}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition cursor-pointer shadow-lg ${
                config.enabled
                  ? 'bg-sky-500 text-slate-950 shadow-sky-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Power className="w-7 h-7" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  وضعیت کلی انتشار خودکار (ادمین ربات)
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  config.enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {config.enabled ? 'روشن و در حال اجرا' : 'خاموش / متوقف'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {config.enabled
                  ? 'ربات در پس‌زمینه سر ساعت‌های مقرر منابع را اسکن، ترجمه و به کانال ارسال می‌کند.'
                  : 'انتشار خودکار موقتاً متوقف شده است (می‌توانید انتشار دستی را از داشبورد اجرا کنید).'}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleEnabled}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shrink-0 ${
              config.enabled
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20'
            }`}
          >
            {config.enabled ? 'توقف موقت خودکار' : 'فعال‌سازی انتشار خودکار'}
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2 mb-1">
            <Sliders className="w-4 h-4 text-sky-400" />
            انتخاب روش زمان‌بندی
          </h3>
          <p className="text-xs text-slate-400">
            می‌توانید سر ساعت‌های معینی از روز (مثلاً ۹ صبح و ۶ عصر) یا به صورت دوره‌ای (مثلاً هر ۱ ساعت) پست بگذارید.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Mode 1: Specific Hours */}
          <div
            onClick={() => handleModeChange('specific_hours')}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              config.mode === 'specific_hours'
                ? 'bg-sky-500/10 border-sky-500/50 text-white'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className={`w-5 h-5 ${config.mode === 'specific_hours' ? 'text-sky-400' : 'text-slate-400'}`} />
                <h4 className="font-bold text-sm">سر ساعت‌های مشخص در شبانه‌روز</h4>
              </div>
              <span className={`w-3.5 h-3.5 rounded-full border-2 ${
                config.mode === 'specific_hours' ? 'border-sky-400 bg-sky-400' : 'border-slate-600'
              }`} />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              پست‌گذاری دقیق سر ساعات دلخواه شما (مثلاً: 09:00، 13:30، 18:00، 22:00)
            </p>
          </div>

          {/* Mode 2: Interval */}
          <div
            onClick={() => handleModeChange('interval')}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              config.mode === 'interval'
                ? 'bg-sky-500/10 border-sky-500/50 text-white'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <Timer className={`w-5 h-5 ${config.mode === 'interval' ? 'text-sky-400' : 'text-slate-400'}`} />
                <h4 className="font-bold text-sm">فاصله‌زمانی دوره‌ای (پیوسته)</h4>
              </div>
              <span className={`w-3.5 h-3.5 rounded-full border-2 ${
                config.mode === 'interval' ? 'border-sky-400 bg-sky-400' : 'border-slate-600'
              }`} />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              اجرای منظم هر چند دقیقه یا ساعت یک‌بار (مثلاً هر ۳۰ دقیقه یا هر ۲ ساعت)
            </p>
          </div>
        </div>

        {/* Content for Specific Hours Mode */}
        {config.mode === 'specific_hours' && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-semibold text-xs sm:text-sm text-slate-200">
                ساعت‌های برنامه‌ریزی شده برای انتشار در کانال:
              </h4>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">پیش‌تنظیم‌ها:</span>
                <button
                  type="button"
                  onClick={() => applyPresetSchedule(['09:00', '13:00', '18:00', '22:00'])}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 transition cursor-pointer"
                >
                  ۴ بار در روز
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetSchedule(['10:00', '14:00', '17:00', '20:00', '23:00'])}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 transition cursor-pointer"
                >
                  ۵ بار در روز
                </button>
              </div>
            </div>

            {/* Hours Badges */}
            <div className="flex flex-wrap gap-2.5">
              {config.specificHours.map((hour) => (
                <div
                  key={hour}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200"
                >
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-mono font-bold text-sm tracking-wide">{hour}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHour(hour)}
                    className="text-slate-500 hover:text-rose-400 transition cursor-pointer mr-1"
                    title="حذف این ساعت"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Hour Form */}
            <form onSubmit={handleAddHour} className="flex items-center gap-2 max-w-sm pt-2">
              <input
                type="time"
                value={newHour}
                onChange={(e) => setNewHour(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-sm font-mono text-slate-200"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-semibold text-xs sm:text-sm border border-sky-500/30 transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن ساعت</span>
              </button>
            </form>
          </div>
        )}

        {/* Content for Interval Mode */}
        {config.mode === 'interval' && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="font-semibold text-xs sm:text-sm text-slate-200">
              فاصله بین هر بار بررسی و انتشار:
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: 'هر ۱۵ دقیقه', minutes: 15 },
                { label: 'هر ۳۰ دقیقه', minutes: 30 },
                { label: 'هر ۱ ساعت', minutes: 60 },
                { label: 'هر ۲ ساعت', minutes: 120 },
                { label: 'هر ۳ ساعت', minutes: 180 },
                { label: 'هر ۶ ساعت', minutes: 360 },
              ].map((opt) => (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => onUpdate({ intervalMinutes: opt.minutes })}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer font-semibold text-xs sm:text-sm ${
                    config.intervalMinutes === opt.minutes
                      ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Batch Size (Max Posts per Run) */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-semibold text-slate-200">
              حداکثر تعداد پست ارسالی در هر نوبت اجرا
            </label>
            <span className="text-sm font-bold font-mono text-sky-400">
              {config.maxPostsPerRun} پست
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={config.maxPostsPerRun}
            onChange={(e) => onUpdate({ maxPostsPerRun: Number(e.target.value) })}
            className="w-full accent-sky-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>۱ پست (سبک و ملایم)</span>
            <span>۲ الی ۳ پست (پیشنهادی)</span>
            <span>۵ پست (پوشش خبری گسترده)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
