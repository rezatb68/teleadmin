import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Layers, 
  Clock, 
  Play, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Settings, 
  Loader2,
  Sparkles,
  RefreshCw,
  Power,
  TrendingUp,
  Globe,
  Cpu
} from 'lucide-react';
import { BotProfile } from '../types';

interface BotsManagerTabProps {
  bots: BotProfile[];
  activeBotId: string;
  onSelectBot: (botId: string) => void;
  onOpenNewBotModal: () => void;
  onDeleteBot: (botId: string) => Promise<void>;
  onRunBotNow: (botId: string) => Promise<void>;
  onRunAllBots: () => Promise<void>;
  onSendTestToBot: (botId: string) => Promise<void>;
  onToggleSchedulerForBot: (botId: string) => Promise<void>;
  isRunningBotId: string | null;
  isRunningAll: boolean;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const BotsManagerTab: React.FC<BotsManagerTabProps> = ({
  bots,
  activeBotId,
  onSelectBot,
  onOpenNewBotModal,
  onDeleteBot,
  onRunBotNow,
  onRunAllBots,
  onSendTestToBot,
  onToggleSchedulerForBot,
  isRunningBotId,
  isRunningAll,
  showToast,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const colorStyles: Record<string, { dot: string; border: string; bg: string; badge: string }> = {
    sky: { dot: 'bg-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10', badge: 'bg-sky-500/20 text-sky-300' },
    emerald: { dot: 'bg-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', badge: 'bg-emerald-500/20 text-emerald-300' },
    amber: { dot: 'bg-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', badge: 'bg-amber-500/20 text-amber-300' },
    purple: { dot: 'bg-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10', badge: 'bg-purple-500/20 text-purple-300' },
    rose: { dot: 'bg-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10', badge: 'bg-rose-500/20 text-rose-300' },
    indigo: { dot: 'bg-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', badge: 'bg-indigo-500/20 text-indigo-300' },
  };

  const handleDelete = async (bot: BotProfile) => {
    if (bots.length <= 1) {
      showToast('حداقل یک ربات باید در سیستم باقی بماند.', 'error');
      return;
    }

    if (window.confirm(`آیا از حذف ربات «${bot.name}» اطمینان دارید؟`)) {
      setDeletingId(bot.id);
      try {
        await onDeleteBot(bot.id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Info & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-sky-400" />
            مدیریت ربات‌ها و کانال‌های چندگانه (Multi-Bot Manager)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            شما می‌توانید ۲، ۳ یا تعداد نامحدودی ربات با توکن‌ها، کانال‌ها، منابع و استایل‌های مستقل تعریف و مدیریت کنید.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onRunAllBots}
            disabled={isRunningAll}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            title="اجرای فرآیند دریافت و انتشار برای همه ربات‌های فعال همزمان"
          >
            {isRunningAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>در حال انتشار همگانی...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>اجرای همزمان همه ربات‌ها</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenNewBotModal}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>تعریف ربات جدید</span>
          </button>
        </div>
      </div>

      {/* Grid of Bots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => {
          const isSelected = bot.id === activeBotId;
          const colors = colorStyles[bot.color || 'sky'] || colorStyles.sky;
          const isConnected = bot.telegram.isValidated && !!bot.telegram.channelId;
          const publishedCount = bot.history.filter((h) => h.status === 'published').length;
          const activeSourcesCount = bot.sources.filter((s) => s.enabled).length;

          return (
            <div
              key={bot.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between transition relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900/90 border-sky-500/50 shadow-xl shadow-sky-500/5'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Active Badge */}
              {isSelected && (
                <div className="absolute top-0 left-0 bg-sky-500 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-br-xl">
                  ربات جاری در پنل
                </div>
              )}

              {/* Bot Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl ${colors.bg} ${colors.border} border flex items-center justify-center font-bold text-base shadow-sm`}>
                      <Bot className={`w-5 h-5 ${colors.dot.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-white">
                        {bot.name}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium mt-1 inline-block ${colors.badge}`}>
                        {bot.purpose || 'ادمین کانال تلگرام'}
                      </span>
                    </div>
                  </div>

                  {bots.length > 1 && (
                    <button
                      onClick={() => handleDelete(bot)}
                      disabled={deletingId === bot.id}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                      title="حذف این ربات"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Channel & Bot Info Box */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 mt-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">کانال تلگرام:</span>
                    <span className="font-semibold text-slate-200 font-mono flex items-center gap-1">
                      {bot.telegram.channelTitle ? (
                        <>
                          <span>{bot.telegram.channelTitle}</span>
                          <span className="text-sky-400 text-[11px]">({bot.telegram.channelUsername || bot.telegram.channelId})</span>
                        </>
                      ) : (
                        <span className="text-amber-400">تنظیم نشده</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ربات تلگرام:</span>
                    <span className="font-mono text-slate-300">
                      {bot.telegram.botUsername || bot.telegram.botName || 'توکن وارد نشده'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">منابع محتوا:</span>
                    <span className="text-slate-200 font-semibold">
                      {activeSourcesCount} منبع فعال
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">لحن و قالب:</span>
                    <span className="text-sky-300 font-medium">
                      {bot.template.tone === 'trading' ? 'تحلیل تکنیکال چارت' :
                       bot.template.tone === 'journalistic' ? 'رسمی و خبری' :
                       bot.template.tone === 'friendly' ? 'صمیمی و روان' :
                       bot.template.tone === 'bullets' ? 'نکات کلیدی' : 'فوری'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400">انتشار خودکار:</span>
                    <button
                      onClick={() => onToggleSchedulerForBot(bot.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                        bot.scheduler.enabled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${bot.scheduler.enabled ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      <span>{bot.scheduler.enabled ? 'روشن' : 'خاموش'}</span>
                    </button>
                  </div>
                </div>

                {/* Published Stat */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>تعداد پست‌های ارسالی:</span>
                  <span className="font-bold text-white font-mono">{publishedCount} پست</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectBot(bot.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>{isSelected ? 'در حال مدیریت' : 'انتخاب و مدیریت'}</span>
                  </button>

                  <button
                    onClick={() => onRunBotNow(bot.id)}
                    disabled={isRunningBotId === bot.id || !isConnected}
                    className="py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    title={!isConnected ? 'ابتدا توکن و کانال را متصل کنید' : 'انتشار فوری برای این ربات'}
                  >
                    {isRunningBotId === bot.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    <span>انتشار فوری</span>
                  </button>
                </div>

                {isConnected && (
                  <button
                    onClick={() => onSendTestToBot(bot.id)}
                    className="w-full py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3 h-3 text-sky-400" />
                    <span>ارسال پیام تست به {bot.telegram.channelTitle || 'کانال'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add New Bot Big Card */}
        <div
          onClick={onOpenNewBotModal}
          className="rounded-3xl border-2 border-dashed border-slate-800 hover:border-sky-500/50 bg-slate-900/30 hover:bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center transition cursor-pointer min-h-[340px] group"
        >
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-sky-500/20 transition mb-3">
            <Plus className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-white group-hover:text-sky-300 transition">
            افزودن ربات جدید
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed">
            یک کانال دیگر، منابع اختصاصی دیگر یا کاربردی مجزا (مثل اخبار، طلا، رمزارز یا تکنولوژی) اضافه کنید.
          </p>
        </div>
      </div>
    </div>
  );
};
