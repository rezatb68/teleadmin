import React, { useState, useRef, useEffect } from 'react';
import { Bot, ChevronDown, Plus, Check, ExternalLink, Settings } from 'lucide-react';
import { BotProfile } from '../types';

interface BotSwitcherProps {
  bots: BotProfile[];
  activeBotId: string;
  onSelectBot: (botId: string) => void;
  onOpenNewBotModal: () => void;
  onNavigateToBotsManager: () => void;
}

export const BotSwitcher: React.FC<BotSwitcherProps> = ({
  bots,
  activeBotId,
  onSelectBot,
  onOpenNewBotModal,
  onNavigateToBotsManager,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeBot = bots.find((b) => b.id === activeBotId) || bots[0];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const colorStyles: Record<string, { dot: string; border: string; bg: string }> = {
    sky: { dot: 'bg-sky-400', border: 'border-sky-500/40', bg: 'bg-sky-500/10' },
    emerald: { dot: 'bg-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
    amber: { dot: 'bg-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
    purple: { dot: 'bg-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10' },
    rose: { dot: 'bg-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-500/10' },
    indigo: { dot: 'bg-indigo-400', border: 'border-indigo-500/40', bg: 'bg-indigo-500/10' },
  };

  const activeColor = colorStyles[activeBot?.color || 'sky'] || colorStyles.sky;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition cursor-pointer ${activeColor.bg} ${activeColor.border} text-white hover:brightness-110`}
      >
        <span className={`w-2.5 h-2.5 rounded-full ${activeColor.dot} shadow-sm animate-pulse`} />
        <div className="text-right">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs max-w-[130px] sm:max-w-[170px] truncate block">
              {activeBot?.name || 'ربات انتخابی'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
              ({activeBot?.telegram?.channelUsername || activeBot?.telegram?.channelId || 'کانال تنظیم نشده'})
            </span>
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              ربات‌ها و کانال‌های تعریف شده ({bots.length})
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigateToBotsManager();
              }}
              className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              <span>مدیریت همه</span>
            </button>
          </div>

          {/* List of Bots */}
          <div className="py-1 space-y-1 max-h-72 overflow-y-auto">
            {bots.map((bot) => {
              const isSelected = bot.id === activeBotId;
              const botColor = colorStyles[bot.color || 'sky'] || colorStyles.sky;
              const hasChannel = bot.telegram.isValidated && !!bot.telegram.channelId;

              return (
                <div
                  key={bot.id}
                  onClick={() => {
                    onSelectBot(bot.id);
                    setIsOpen(false);
                  }}
                  className={`p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 text-white font-medium border border-slate-700'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${botColor.dot}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs truncate">
                          {bot.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <span className="text-sky-400 font-mono truncate max-w-[120px]">
                          {bot.telegram.channelUsername || bot.telegram.channelId || 'بدون کانال'}
                        </span>
                        <span>•</span>
                        <span>{bot.sources.filter(s => s.enabled).length} منبع</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mr-1" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New Bot Action */}
          <div className="pt-2 border-t border-slate-800/80 mt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenNewBotModal();
              }}
              className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-xs font-semibold text-sky-400 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ افزودن ربات جدید (کانال متفاوت)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
