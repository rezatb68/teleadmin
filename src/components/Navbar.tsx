import React from 'react';
import { 
  Bot, 
  Send, 
  Layers, 
  Clock, 
  Palette, 
  ShieldAlert, 
  History, 
  Play, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  LayoutDashboard,
  Sparkles
} from 'lucide-react';
import { BotProfile } from '../types';
import { BotSwitcher } from './BotSwitcher';

interface NavbarProps {
  bots: BotProfile[];
  activeBot: BotProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectBot: (botId: string) => void;
  onOpenNewBotModal: () => void;
  onRunNow: () => void;
  isRunningNow: boolean;
  onToggleScheduler: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  bots,
  activeBot,
  activeTab,
  setActiveTab,
  onSelectBot,
  onOpenNewBotModal,
  onRunNow,
  isRunningNow,
  onToggleScheduler,
}) => {
  const tabs = [
    { id: 'bots', label: 'مدیریت ربات‌ها', icon: Bot, badge: bots.length },
    { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
    { id: 'telegram', label: 'اتصال تلگرام', icon: Send },
    { id: 'sources', label: 'منابع محتوا', icon: Layers, badge: activeBot?.sources.filter(s => s.enabled).length },
    { id: 'scheduler', label: 'زمان‌بندی انتشار', icon: Clock },
    { id: 'customizer', label: 'ظاهر و قالب پست‌ها', icon: Palette },
    { id: 'filters', label: 'فیلتر کلمات', icon: ShieldAlert, badge: activeBot?.filters.blacklistWords.length },
    { id: 'history', label: 'تاریخچه و لاگ‌ها', icon: History, badge: activeBot?.history.length },
  ];

  const isConnected = activeBot?.telegram?.isValidated && !!activeBot?.telegram?.channelId;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand + Bot Switcher */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  TeleAdmin <span className="text-sky-400">AI</span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  چند رباته
                </span>
              </div>
            </div>

            {/* Interactive Bot Switcher */}
            <div className="mr-2">
              <BotSwitcher
                bots={bots}
                activeBotId={activeBot?.id}
                onSelectBot={onSelectBot}
                onOpenNewBotModal={onOpenNewBotModal}
                onNavigateToBotsManager={() => setActiveTab('bots')}
              />
            </div>
          </div>

          {/* Quick Status & Actions */}
          <div className="flex items-center gap-2.5">
            {/* Telegram Status indicator */}
            <div 
              onClick={() => setActiveTab('telegram')}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition ${
                isConnected
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/40'
              }`}
              title={isConnected ? `متصل به ${activeBot?.telegram?.channelTitle || activeBot?.telegram?.channelId}` : 'ربات تلگرام تنظیم نشده'}
            >
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="max-w-[120px] truncate">
                    {activeBot?.telegram?.channelTitle || activeBot?.telegram?.channelId}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>اتصال کانال</span>
                </>
              )}
            </div>

            {/* Scheduler Toggle */}
            <button
              onClick={onToggleScheduler}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                activeBot?.scheduler.enabled
                  ? 'bg-sky-500/10 border-sky-500/40 text-sky-300 hover:bg-sky-500/20'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
              title="تغییر وضعیت انتشار خودکار برای این ربات"
            >
              <span className={`w-2 h-2 rounded-full ${activeBot?.scheduler.enabled ? 'bg-sky-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="hidden sm:inline">خودکار:</span>
              <span>{activeBot?.scheduler.enabled ? 'روشن' : 'خاموش'}</span>
            </button>

            {/* Run Cycle Now Button */}
            <button
              onClick={onRunNow}
              disabled={isRunningNow || !isConnected}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition ${
                isRunningNow || !isConnected
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20 active:scale-95 cursor-pointer'
              }`}
              title={!isConnected ? 'ابتدا در تب اتصال تلگرام، ربات را متصل کنید' : `انتشار فوری برای ${activeBot?.name}`}
            >
              {isRunningNow ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">در حال ارسال...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>انتشار فوری</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80 -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-sky-400/20 text-sky-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
