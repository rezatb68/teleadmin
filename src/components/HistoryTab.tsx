import React, { useState } from 'react';
import { 
  History as HistoryIcon, 
  CheckCircle2, 
  ShieldAlert, 
  AlertCircle, 
  ExternalLink, 
  Search, 
  Trash2, 
  Send,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryTabProps {
  history: HistoryItem[];
  channelUsername?: string;
  onClearHistory: () => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  history,
  channelUsername = '',
  onClearHistory,
  showToast,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'filtered' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const cleanChannelUsername = channelUsername.replace('@', '').trim();

  // Filter history
  const filteredItems = history.filter((item) => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = 
      item.originalTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translatedTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sourceName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('fa-IR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-sky-400" />
            تاریخچه و لاگ عملیات انتشار خودکار
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            مشاهده گزارش کامل اخباری که دریافت، ترجمه، فیلتر یا در کانال تلگرام شما منتشر شده‌اند.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-medium border border-slate-700 hover:border-rose-800 transition cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>پاکسازی لاگ‌ها</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'همه موارد', count: history.length },
            { id: 'published', label: 'منتشر شده در کانال', count: history.filter((h) => h.status === 'published').length },
            { id: 'filtered', label: 'فیلتر شده', count: history.filter((h) => h.status === 'filtered').length },
            { id: 'failed', label: 'خطاها', count: history.filter((h) => h.status === 'failed').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="جستجو در عناوین..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:border-sky-500"
          />
        </div>
      </div>

      {/* History Items List */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs sm:text-sm">
          موردی برای نمایش با این فیلتر یافت نشد.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left content info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-1 shrink-0">
                      {item.status === 'published' ? (
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : item.status === 'filtered' ? (
                        <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                          {item.sourceName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(item.publishedAt)}
                        </span>
                        {item.filterReason && (
                          <span className="text-[11px] px-2 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">
                            {item.filterReason}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-white">
                        {item.translatedTitle || item.originalTitle}
                      </h4>
                      {item.originalTitle && item.translatedTitle !== item.originalTitle && (
                        <p className="text-[11px] text-slate-400 truncate" dir="ltr">
                          {item.originalTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Links */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    
                    {/* Direct Telegram Message Link */}
                    {item.status === 'published' && item.telegramMessageId && cleanChannelUsername && (
                      <a
                        href={`https://t.me/${cleanChannelUsername}/${item.telegramMessageId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-medium border border-sky-500/30 transition flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3" />
                        <span>مشاهده در تلگرام</span>
                      </a>
                    )}

                    {/* Original Source Link */}
                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="مشاهده منبع خبر اصلی"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    {/* Expand Details Toggle */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                      title={isExpanded ? 'بستن جزییات' : 'مشاهده متن کامل'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs">
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[11px] text-slate-500 block mb-1">متن ترجمه شده ارسالی:</span>
                      <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                        {item.contentPreview}
                      </p>
                    </div>

                    {item.error && (
                      <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/50 text-rose-300 font-mono text-[11px]">
                        خطای تلگرام: {item.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
