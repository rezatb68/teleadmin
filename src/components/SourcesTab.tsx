import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Check, 
  RefreshCw, 
  Rss, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { SourceItem } from '../types';

interface SourcesTabProps {
  sources: SourceItem[];
  onUpdateSources: (sources: SourceItem[]) => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SourcesTab: React.FC<SourcesTabProps> = ({
  sources,
  onUpdateSources,
  showToast,
}) => {
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    category: 'فناوری و استارتاپ',
  });
  const [isTestingFeed, setIsTestingFeed] = useState(false);
  const [testFeedResult, setTestFeedResult] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Curated Preset Sources for 1-click addition
  const presets = [
    {
      name: 'TradingView Ideas (تحلیل‌های برتر چارت)',
      url: 'https://www.tradingview.com/ideas/',
      category: 'تحلیل تکنیکال و مارکت',
    },
    {
      name: 'TradingView Crypto (تحلیل‌های کریپتو)',
      url: 'https://www.tradingview.com/ideas/crypto/',
      category: 'کریپتو و مالی',
    },
    {
      name: 'TradingView Forex (تحلیل جفت‌ارزها و طلا)',
      url: 'https://www.tradingview.com/ideas/forex/',
      category: 'فارکس و طلا',
    },
    {
      name: 'CoinDesk',
      url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
      category: 'کریپتو و مالی',
    },
    {
      name: 'TechCrunch',
      url: 'https://techcrunch.com/feed/',
      category: 'فناوری و استارتاپ',
    },
    {
      name: 'The Verge',
      url: 'https://www.theverge.com/rss/index.xml',
      category: 'تکنولوژی و گجت',
    },
    {
      name: 'Wired AI',
      url: 'https://www.wired.com/feed/category/ai/latest/rss',
      category: 'هوش مصنوعی',
    },
    {
      name: 'BBC World News',
      url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
      category: 'اخبار جهان',
    },
  ];

  // Toggle active state of a source
  const handleToggle = async (id: string) => {
    const updated = sources.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    await onUpdateSources(updated);
    showToast('وضعیت منبع بروزرسانی شد', 'info');
  };

  // Delete a source
  const handleDelete = async (id: string) => {
    const updated = sources.filter((s) => s.id !== id);
    await onUpdateSources(updated);
    showToast('منبع با موفقیت حذف شد', 'info');
  };

  // Test RSS feed URL
  const handleTestFeed = async (urlToTest?: string) => {
    const targetUrl = urlToTest || newSource.url;
    if (!targetUrl.trim()) {
      showToast('لطفاً آدرس اینترنتی فید RSS را وارد کنید.', 'error');
      return;
    }

    setIsTestingFeed(true);
    setTestFeedResult(null);

    try {
      const res = await fetch('/api/sources/test-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(`فید معتبر است! ${data.count} خبر یافت شد.`, 'success');
        setTestFeedResult({
          ok: true,
          count: data.count,
          sampleArticles: data.sampleArticles || [],
        });
      } else {
        showToast(data.message || 'خطا در دریافت فید RSS', 'error');
        setTestFeedResult({
          ok: false,
          error: data.message,
        });
      }
    } catch (err: any) {
      showToast('خطا در دسترسی به فید: ' + err.message, 'error');
    } finally {
      setIsTestingFeed(false);
    }
  };

  // Add source from form
  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.name.trim() || !newSource.url.trim()) {
      showToast('نام و آدرس فید هر دو الزامی هستند.', 'error');
      return;
    }

    // Check duplicate
    if (sources.some((s) => s.url.toLowerCase() === newSource.url.toLowerCase())) {
      showToast('این منبع قبلاً در لیست ثبت شده است.', 'error');
      return;
    }

    const item: SourceItem = {
      id: `src-${Date.now()}`,
      name: newSource.name.trim(),
      url: newSource.url.trim(),
      category: newSource.category || 'عمومی',
      enabled: true,
      lastFetched: null,
      fetchCount: 0,
    };

    await onUpdateSources([...sources, item]);
    setNewSource({ name: '', url: '', category: 'فناوری و استارتاپ' });
    setTestFeedResult(null);
    showToast(`منبع «${item.name}» با موفقیت اضافه شد.`, 'success');
  };

  // Add a curated preset
  const handleAddPreset = async (preset: typeof presets[0]) => {
    if (sources.some((s) => s.url.toLowerCase() === preset.url.toLowerCase())) {
      showToast('این منبع در لیست شما موجود است.', 'info');
      return;
    }

    const item: SourceItem = {
      id: `src-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: preset.name,
      url: preset.url,
      category: preset.category,
      enabled: true,
      lastFetched: null,
      fetchCount: 0,
    };

    await onUpdateSources([...sources, item]);
    showToast(`منبع ${preset.name} به لیست اضافه شد.`, 'success');
  };

  // Filter sources by category
  const categories = ['all', ...Array.from(new Set(sources.map((s) => s.category)))];
  const filteredSources = activeFilter === 'all' 
    ? sources 
    : sources.filter((s) => s.category === activeFilter);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Info */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-sky-400" />
          مدیریت منابع محتوا و فیدهای خبری
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          منابع خبری، وبلاگ‌ها و خبرگزاری‌های مورد نظر خود را اضافه کنید. ربات در ساعت‌های مقرر جدیدترین محتواها را از این منابع استخراج و ترجمه خواهد کرد.
        </p>
      </div>

      {/* Add New Source Section */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-sky-400" />
          افزودن منبع فید جدید (RSS / Atom)
        </h3>

        <form onSubmit={handleAddSource} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                نام منبع <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="مثال: رویترز، تک‌کرانچ، زومیت..."
                value={newSource.name}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                آدرس فید RSS یا Atom <span className="text-rose-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  dir="ltr"
                  placeholder="https://example.com/feed or rss.xml"
                  value={newSource.url}
                  onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-xs sm:text-sm font-mono text-slate-200 placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => handleTestFeed()}
                  disabled={isTestingFeed || !newSource.url}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  title="تست ارتباط با این آدرس فید"
                >
                  {isTestingFeed ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Rss className="w-3.5 h-3.5 text-sky-400" />}
                  <span>تست فید</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">دسته‌بندی:</label>
              <select
                value={newSource.category}
                onChange={(e) => setNewSource({ ...newSource, category: e.target.value })}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
              >
                <option value="فناوری و استارتاپ">فناوری و استارتاپ</option>
                <option value="هوش مصنوعی">هوش مصنوعی</option>
                <option value="کریپتو و مالی">کریپتو و مالی</option>
                <option value="اخبار جهان">اخبار جهان</option>
                <option value="علم و دانش">علم و دانش</option>
                <option value="عمومی">عمومی</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>ذخیره و افزودن منبع</span>
            </button>
          </div>
        </form>

        {/* Live Feed Test Feedback */}
        {testFeedResult && (
          <div className={`p-4 rounded-xl border mt-3 text-xs ${
            testFeedResult.ok ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-300' : 'bg-rose-950/20 border-rose-800/50 text-rose-300'
          }`}>
            {testFeedResult.ok ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>فید با موفقیت دریافت شد ({testFeedResult.count} خبر فعال)</span>
                </div>
                <div className="space-y-1 text-slate-300 pr-6">
                  {testFeedResult.sampleArticles.slice(0, 3).map((a: any, i: number) => (
                    <div key={i} className="truncate">
                      • {a.title}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>خطا: {testFeedResult.error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preset Sources Suggestions */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            منابع پیشنهادی معتبر (افزودن با ۱ کلیک)
          </h3>
          <span className="text-[11px] text-slate-500">اخبار به‌روز بین‌المللی و فناوری</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {presets.map((preset) => {
            const isAlreadyAdded = sources.some((s) => s.url.toLowerCase() === preset.url.toLowerCase());
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleAddPreset(preset)}
                disabled={isAlreadyAdded}
                className={`p-3 rounded-xl border text-right transition cursor-pointer flex flex-col justify-between ${
                  isAlreadyAdded
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60 cursor-default'
                    : 'bg-slate-950/80 border-slate-800 hover:border-sky-500/50 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-white flex items-center justify-between">
                    <span>{preset.name}</span>
                    {isAlreadyAdded ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-sky-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {preset.category}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 truncate block mt-2" dir="ltr">
                  {preset.url.split('/')[2]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Registered Sources List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-white">
              منابع ثبت شده ({sources.length})
            </h3>
            <span className="text-xs text-slate-400">
              ({sources.filter((s) => s.enabled).length} فعال)
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat === 'all' ? 'همه دسته‌ها' : cat}
              </button>
            ))}
          </div>
        </div>

        {filteredSources.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs sm:text-sm">
            هیچ منبعی در این دسته‌بندی یافت نشد.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredSources.map((source) => (
              <div
                key={source.id}
                className={`p-4 rounded-xl border transition ${
                  source.enabled
                    ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white truncate">
                        {source.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-sky-400 border border-slate-700">
                        {source.category}
                      </span>
                    </div>

                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      dir="ltr"
                      className="text-xs font-mono text-slate-400 hover:text-sky-300 truncate block flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3 shrink-0" />
                      <span className="truncate">{source.url}</span>
                    </a>
                  </div>

                  {/* Toggle & Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggle(source.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                      title={source.enabled ? 'غیرفعال‌سازی این منبع' : 'فعال‌سازی این منبع'}
                    >
                      {source.enabled ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(source.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                      title="حذف منبع"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>آخرین دریافت: {source.lastFetched ? new Date(source.lastFetched).toLocaleTimeString('fa-IR') : 'هنوز دریافت نشده'}</span>
                  <span className="font-mono">{source.fetchCount || 0} خبر پردازش شده</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
