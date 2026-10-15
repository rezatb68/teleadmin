/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BotsManagerTab } from './components/BotsManagerTab';
import { DashboardTab } from './components/DashboardTab';
import { TelegramTab } from './components/TelegramTab';
import { SourcesTab } from './components/SourcesTab';
import { SchedulerTab } from './components/SchedulerTab';
import { CustomizerTab } from './components/CustomizerTab';
import { FiltersTab } from './components/FiltersTab';
import { HistoryTab } from './components/HistoryTab';
import { NewBotModal } from './components/NewBotModal';
import { 
  AppState, 
  BotProfile, 
  TelegramConfig, 
  SchedulerConfig, 
  SourceItem, 
  PostTemplateConfig, 
  FiltersConfig 
} from './types';
import { CheckCircle2, AlertCircle, Info, X, Loader2 } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRunningBotId, setIsRunningBotId] = useState<string | null>(null);
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [isNewBotModalOpen, setIsNewBotModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Show Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Fetch state from server
  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      if (data.success && data.data) {
        setState(data.data);
      }
    } catch (err: any) {
      console.error('Error fetching state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 15000);
    return () => clearInterval(interval);
  }, []);

  // Active bot resolver
  const activeBot: BotProfile | undefined = state?.bots.find((b) => b.id === state.activeBotId) || state?.bots[0];

  // Select another bot
  const handleSelectBot = async (botId: string) => {
    try {
      const res = await fetch('/api/bots/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setState(data.data);
        const selected = data.data.bots.find((b: BotProfile) => b.id === botId);
        showToast(`ربات «${selected?.name || 'انتخابی'}» فعال شد.`, 'info');
      }
    } catch (err: any) {
      showToast('خطا در انتخاب ربات: ' + err.message, 'error');
    }
  };

  // Create new bot profile
  const handleCreateBot = async (botData: {
    name: string;
    purpose: string;
    preset?: 'trading' | 'tech' | 'world' | 'custom';
    color: 'sky' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo';
  }) => {
    try {
      const res = await fetch('/api/bots/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(botData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setState(data.data);
        showToast(`ربات «${data.createdBot.name}» با موفقیت ساخته شد! اکنون توکن و کانال آن را متصل کنید.`, 'success');
        setActiveTab('telegram');
      }
    } catch (err: any) {
      showToast('خطا در ساخت ربات: ' + err.message, 'error');
    }
  };

  // Delete a bot profile
  const handleDeleteBot = async (botId: string) => {
    try {
      const res = await fetch(`/api/bots/${botId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && data.data) {
        setState(data.data);
        showToast('ربات با موفقیت حذف شد.', 'info');
      } else {
        showToast(data.message || 'خطا در حذف ربات', 'error');
      }
    } catch (err: any) {
      showToast('خطا: ' + err.message, 'error');
    }
  };

  // Save changes to active bot
  const handleUpdateActiveBot = async (partial: Partial<BotProfile>) => {
    if (!activeBot) return;
    try {
      const res = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId: activeBot.id, ...partial }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setState(data.data);
      }
    } catch (err: any) {
      showToast('خطا در ذخیره‌سازی: ' + err.message, 'error');
    }
  };

  // Run Now for specific bot or active bot
  const handleRunBotNow = async (botId?: string) => {
    const targetBot = botId ? state?.bots.find(b => b.id === botId) : activeBot;
    if (!targetBot?.telegram.botToken || !targetBot?.telegram.channelId) {
      showToast(`ابتدا توکن ربات و کانال را برای «${targetBot?.name || 'ربات'}» متصل کنید.`, 'error');
      if (targetBot && targetBot.id !== activeBot?.id) {
        await handleSelectBot(targetBot.id);
      }
      setActiveTab('telegram');
      return;
    }

    setIsRunningBotId(targetBot.id);
    showToast(`در حال دریافت محتوا، ترجمه و انتشار برای «${targetBot.name}»...`, 'info');

    try {
      const res = await fetch('/api/scheduler/run-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId: targetBot.id }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.publishedCount > 0) {
          showToast(`عملیات موفق: ${data.publishedCount} پست جدید در کانال «${targetBot.telegram.channelTitle || targetBot.telegram.channelId}» منتشر شد! 🎉`, 'success');
        } else if (data.filteredCount > 0) {
          showToast(`محتوای دریافتی به علت تطابق با کلمات فیلتر شده رد شد (${data.filteredCount} مورد).`, 'info');
        } else {
          showToast('مطلب جدیدی در منابع این ربات یافت نشد (یا قبلاً ارسال شده بودند).', 'info');
        }
      } else {
        showToast(data.errors?.[0] || 'خطا در انتشار محتوا', 'error');
      }
      await fetchState();
    } catch (err: any) {
      showToast('خطای شبکه: ' + err.message, 'error');
    } finally {
      setIsRunningBotId(null);
    }
  };

  // Run all enabled bots simultaneously
  const handleRunAllBots = async () => {
    setIsRunningAll(true);
    showToast('در حال اجرای فرآیند انتشار برای تمام ربات‌های فعال...', 'info');

    try {
      const res = await fetch('/api/scheduler/run-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (data.success) {
        const totalPublished = (data.results || []).reduce((acc: number, r: any) => acc + (r.publishedCount || 0), 0);
        showToast(`فرآیند همگانی به پایان رسید: مجموعاً ${totalPublished} پست در کانال‌ها منتشر شد!`, 'success');
        await fetchState();
      }
    } catch (err: any) {
      showToast('خطا در اجرای همگانی: ' + err.message, 'error');
    } finally {
      setIsRunningAll(false);
    }
  };

  // Send test message to a bot's channel
  const handleSendTestToBot = async (botId?: string) => {
    const targetBot = botId ? state?.bots.find(b => b.id === botId) : activeBot;
    if (!targetBot) return;

    setIsSendingTest(true);
    try {
      const res = await fetch('/api/telegram/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId: targetBot.id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`پیام آزمایشی به کانال «${targetBot.telegram.channelTitle || targetBot.telegram.channelId}» ارسال شد! 🎉`, 'success');
      } else {
        showToast(data.message || 'خطا در ارسال پیام به تلگرام', 'error');
      }
    } catch (err: any) {
      showToast('خطا: ' + err.message, 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Toggle scheduler for a specific bot
  const handleToggleSchedulerForBot = async (botId: string) => {
    const targetBot = state?.bots.find(b => b.id === botId);
    if (!targetBot) return;

    const nextEnabled = !targetBot.scheduler.enabled;
    const nextScheduler = { ...targetBot.scheduler, enabled: nextEnabled };
    
    try {
      const res = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId: targetBot.id, scheduler: nextScheduler }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setState(data.data);
        showToast(
          nextEnabled 
            ? `انتشار خودکار برای «${targetBot.name}» فعال شد 🚀` 
            : `انتشار خودکار برای «${targetBot.name}» متوقف شد`,
          nextEnabled ? 'success' : 'info'
        );
      }
    } catch (err: any) {
      showToast('خطا در تغییر وضعیت زمانبندی: ' + err.message, 'error');
    }
  };

  // Clear history of active bot
  const handleClearHistory = async () => {
    if (!activeBot) return;
    try {
      const res = await fetch(`/api/history?botId=${activeBot.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`تاریخچه ربات «${activeBot.name}» پاکسازی شد.`, 'success');
        fetchState();
      }
    } catch (err: any) {
      showToast('خطا در پاکسازی تاریخچه', 'error');
    }
  };

  if (isLoading || !state || !activeBot) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
        <span className="text-sm font-medium">در حال بارگذاری سامانه چند رباته TeleAdmin...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-300">
      
      {/* Top Navbar with Multi-Bot Switcher */}
      <Navbar
        bots={state.bots}
        activeBot={activeBot}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectBot={handleSelectBot}
        onOpenNewBotModal={() => setIsNewBotModalOpen(true)}
        onRunNow={() => handleRunBotNow(activeBot.id)}
        isRunningNow={isRunningBotId === activeBot.id}
        onToggleScheduler={() => handleToggleSchedulerForBot(activeBot.id)}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tab 1: Multi-Bot Management Overview */}
        {activeTab === 'bots' && (
          <BotsManagerTab
            bots={state.bots}
            activeBotId={state.activeBotId}
            onSelectBot={(id) => {
              handleSelectBot(id);
              setActiveTab('dashboard');
            }}
            onOpenNewBotModal={() => setIsNewBotModalOpen(true)}
            onDeleteBot={handleDeleteBot}
            onRunBotNow={handleRunBotNow}
            onRunAllBots={handleRunAllBots}
            onSendTestToBot={handleSendTestToBot}
            onToggleSchedulerForBot={handleToggleSchedulerForBot}
            isRunningBotId={isRunningBotId}
            isRunningAll={isRunningAll}
            showToast={showToast}
          />
        )}

        {/* Tab 2: Dashboard for active bot with performance chart for all bots */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            state={activeBot}
            allBots={state.bots}
            onNavigate={setActiveTab}
            onRunNow={() => handleRunBotNow(activeBot.id)}
            isRunningNow={isRunningBotId === activeBot.id}
            onSendTestMessage={() => handleSendTestToBot(activeBot.id)}
            isSendingTest={isSendingTest}
          />
        )}

        {/* Tab 3: Telegram Connection for active bot */}
        {activeTab === 'telegram' && (
          <TelegramTab
            config={activeBot.telegram}
            onUpdate={(telegram) => handleUpdateActiveBot({ telegram: { ...activeBot.telegram, ...telegram } })}
            showToast={showToast}
          />
        )}

        {/* Tab 4: Sources for active bot */}
        {activeTab === 'sources' && (
          <SourcesTab
            sources={activeBot.sources}
            onUpdateSources={(sources) => handleUpdateActiveBot({ sources })}
            showToast={showToast}
          />
        )}

        {/* Tab 5: Scheduler for active bot */}
        {activeTab === 'scheduler' && (
          <SchedulerTab
            config={activeBot.scheduler}
            onUpdate={(scheduler) => handleUpdateActiveBot({ scheduler: { ...activeBot.scheduler, ...scheduler } })}
            showToast={showToast}
          />
        )}

        {/* Tab 6: Customizer for active bot */}
        {activeTab === 'customizer' && (
          <CustomizerTab
            template={activeBot.template}
            onUpdateTemplate={(template) => handleUpdateActiveBot({ template: { ...activeBot.template, ...template } })}
            channelTitle={activeBot.telegram.channelTitle}
            channelUsername={activeBot.telegram.channelUsername}
            showToast={showToast}
          />
        )}

        {/* Tab 7: Filters for active bot */}
        {activeTab === 'filters' && (
          <FiltersTab
            filters={activeBot.filters}
            onUpdateFilters={(filters) => handleUpdateActiveBot({ filters: { ...activeBot.filters, ...filters } })}
            showToast={showToast}
          />
        )}

        {/* Tab 8: History & Logs for active bot */}
        {activeTab === 'history' && (
          <HistoryTab
            history={activeBot.history}
            channelUsername={activeBot.telegram.channelUsername || activeBot.telegram.channelId}
            onClearHistory={handleClearHistory}
            showToast={showToast}
          />
        )}
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>مدیریت {state.bots.length} ربات مستقل تلگرام با هوش مصنوعی Gemini 3.8</span>
          </div>
          <span>TeleAdmin AI &copy; 2026 - پشتیبانی همزمان از چند کانال با کاربردهای مختلف</span>
        </div>
      </footer>

      {/* New Bot Creation Modal */}
      <NewBotModal
        isOpen={isNewBotModalOpen}
        onClose={() => setIsNewBotModalOpen(false)}
        onCreateBot={handleCreateBot}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-96 z-50 transition-all duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-start justify-between gap-3 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              : 'bg-slate-900/90 border-sky-500/40 text-slate-200'
          }`}>
            <div className="flex items-start gap-2.5">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              )}
              <span className="text-xs sm:text-sm font-medium leading-relaxed">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white transition cursor-pointer p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
