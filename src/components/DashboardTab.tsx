import React from 'react';
import { 
  Bot, 
  Send, 
  Layers, 
  CheckCircle, 
  ShieldAlert, 
  Clock, 
  ArrowUpRight, 
  RefreshCw, 
  ExternalLink,
  Sparkles,
  Zap,
  Play
} from 'lucide-react';
import { BotProfile } from '../types';
import { BotsAnalyticsChart } from './BotsAnalyticsChart';

interface DashboardTabProps {
  state: BotProfile;
  allBots?: BotProfile[];
  onNavigate: (tab: string) => void;
  onRunNow: () => void;
  isRunningNow: boolean;
  onSendTestMessage: () => void;
  isSendingTest: boolean;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  state,
  allBots,
  onNavigate,
  onRunNow,
  isRunningNow,
  onSendTestMessage,
  isSendingTest,
}) => {
  const publishedCount = state.history.filter((h) => h.status === 'published').length;
  const filteredCount = state.history.filter((h) => h.status === 'filtered').length;
  const activeSourcesCount = state.sources.filter((s) => s.enabled).length;

  const isConnected = state.telegram.isValidated && !!state.telegram.channelId;

  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'هنوز اجرا نشده';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('fa-IR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Quick Alert if not connected */}
      {!isConnected ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-amber-200">
                اتصال به ربات و کانال تلگرام را کامل کنید
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                برای شروع فعالیت ادمین خودکار، توکن ربات تلگرام و آیدی کانال خود را وارد کرده و مطمئن شوید ربات در کانال شما ادمین با دسترسی ارسال پست است.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('telegram')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition shrink-0 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            تنظیم اتصال تلگرام
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-transparent border border-sky-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  سیستم ادمین خودکار آماده به کار است
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                  آنلاین
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                کانال مقصد: <span className="font-semibold text-sky-300">{state.telegram.channelTitle || state.telegram.channelId}</span> ({state.telegram.channelUsername || state.telegram.channelId})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onSendTestMessage}
              disabled={isSendingTest}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>ارسال تست به کانال</span>
            </button>
            <button
              onClick={onRunNow}
              disabled={isRunningNow}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
            >
              {isRunningNow ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال دریافت و ترجمه...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>اجرای فوری ادمین</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Channel Connection */}
        <div 
          onClick={() => onNavigate('telegram')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">وضعیت تلگرام</span>
            <div className={`p-2 rounded-lg ${isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              {isConnected ? 'متصل و تأیید شده' : 'نیازمند تنظیم'}
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {state.telegram.botUsername ? `ربات: ${state.telegram.botUsername}` : 'توکن ربات ثبت نشده'}
            </p>
          </div>
        </div>

        {/* Card 2: Active Sources */}
        <div 
          onClick={() => onNavigate('sources')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">منابع خبری فعال</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">
              {activeSourcesCount} <span className="text-xs font-normal text-slate-400">از {state.sources.length} منبع</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              کلیک برای مدیریت منابع فید RSS
            </p>
          </div>
        </div>

        {/* Card 3: Published Posts */}
        <div 
          onClick={() => onNavigate('history')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">پست‌های منتشر شده</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">
              {publishedCount} <span className="text-xs font-normal text-slate-400">پست</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              ترجمه و ارسال شده در کانال
            </p>
          </div>
        </div>

        {/* Card 4: Filtered Posts */}
        <div 
          onClick={() => onNavigate('filters')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">پست‌های فیلتر شده</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">
              {filteredCount} <span className="text-xs font-normal text-slate-400">رد شده</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {state.filters.blacklistWords.length} کلمه کلیدی در لیست سیاه
            </p>
          </div>
        </div>
      </div>

      {/* Middle Grid: Automation Schedule & Channel Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Schedule & Timing Card */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">برنامه زمان‌بندی انتشار خودکار</h3>
                <p className="text-xs text-slate-400">
                  {state.scheduler.enabled 
                    ? `فعال - حالت: ${state.scheduler.mode === 'interval' ? `هر ${state.scheduler.intervalMinutes} دقیقه` : 'ساعات مشخص در طول روز'}`
                    : 'در حال حاضر متوقف است'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('scheduler')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition"
            >
              <span>تنظیم ساعت‌ها</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="text-xs text-slate-400 block">آخرین نوبت اجرا</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5 block">
                {formatDate(state.scheduler.lastRunTime)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">نوبت اجرای بعدی</span>
              <span className="text-xs sm:text-sm font-semibold text-sky-300 mt-0.5 block">
                {state.scheduler.enabled ? formatDate(state.scheduler.nextRunTime) : 'غیرفعال'}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">سقف ارسال در هر بار</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5 block">
                {state.scheduler.maxPostsPerRun} پست همزمان
              </span>
            </div>
          </div>

          {state.scheduler.mode === 'specific_hours' && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">ساعت‌های برنامه‌ریزی شده:</span>
              {state.scheduler.specificHours.map((h) => (
                <span key={h} className="px-2.5 py-1 rounded-md bg-slate-800 text-sky-300 text-xs font-mono font-medium border border-slate-700">
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Telegram Destination Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm text-white">مشخصات کانال تلگرام</h3>
              </div>
              <button
                onClick={() => onNavigate('telegram')}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                تغییر
              </button>
            </div>

            {state.telegram.isValidated ? (
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                    {state.telegram.channelTitle ? state.telegram.channelTitle.charAt(0) : 'T'}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-sm text-white truncate">
                      {state.telegram.channelTitle || 'کانال تلگرام'}
                    </h4>
                    <span className="text-xs text-sky-400 font-mono">
                      {state.telegram.channelUsername || state.telegram.channelId}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">ربات ادمین:</span>
                    <span className="font-mono text-slate-200">{state.telegram.botUsername || state.telegram.botName || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">مجوز ارسال پست:</span>
                    <span className="text-emerald-400 font-medium">مجاز و فعال</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-xs text-slate-400 leading-relaxed">
                  هنوز کانالی ثبت نشده است. برای راه‌اندازی به بخش «اتصال تلگرام» مراجعه کنید.
                </p>
                <button
                  onClick={() => onNavigate('telegram')}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 text-xs font-semibold hover:bg-sky-500/30 transition cursor-pointer"
                >
                  ورود به تنظیمات تلگرام
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>سبک ترجمه AI:</span>
            <span className="text-sky-300 font-medium">
              {state.template.tone === 'journalistic' ? 'رسمی و خبری' :
               state.template.tone === 'friendly' ? 'صمیمی و روان' :
               state.template.tone === 'bullets' ? 'نکات کلیدی' :
               state.template.tone === 'technical' ? 'فنی و تخصصی' :
               state.template.tone === 'trading' ? 'تحلیل تکنیکال چارت' : 'فوری'}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Performance Analysis Chart (Past Month Breakdown by Bot) */}
      <BotsAnalyticsChart bots={allBots && allBots.length > 0 ? allBots : [state]} />

      {/* Recent History Timeline */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">آخرین فعالیت‌های ثبت شده</h3>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-sky-400 hover:text-sky-300 font-medium transition"
          >
            مشاهده تمام لاگ‌ها ({state.history.length})
          </button>
        </div>

        {state.history.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs sm:text-sm">
            هنوز پستی پردازش نشده است. برای اولین انتشار روی دکمه «اجرای فوری ادمین» کلیک کنید.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {state.history.slice(0, 5).map((item) => (
              <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    item.status === 'published' ? 'bg-emerald-400' :
                    item.status === 'filtered' ? 'bg-rose-400' : 'bg-amber-400'
                  }`} />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                      {item.translatedTitle || item.originalTitle}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="text-sky-400">{item.sourceName}</span>
                      <span>•</span>
                      <span>{formatDate(item.publishedAt)}</span>
                      {item.filterReason && (
                        <>
                          <span>•</span>
                          <span className="text-rose-400">{item.filterReason}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    item.status === 'published' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                    item.status === 'filtered' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                    'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  }`}>
                    {item.status === 'published' ? 'منتشر شد' :
                     item.status === 'filtered' ? 'فیلتر شد' : 'ناموفق'}
                  </span>
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-slate-400 hover:text-white transition"
                      title="مشاهده منبع خبر"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
