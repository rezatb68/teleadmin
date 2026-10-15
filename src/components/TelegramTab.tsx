import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Key, 
  Hash, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Loader2, 
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { TelegramConfig } from '../types';

interface TelegramTabProps {
  config: TelegramConfig;
  onUpdate: (updated: Partial<TelegramConfig>) => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TelegramTab: React.FC<TelegramTabProps> = ({
  config,
  onUpdate,
  showToast,
}) => {
  const [botToken, setBotToken] = useState(config.botToken || '');
  const [channelId, setChannelId] = useState(config.channelId || '');
  const [showToken, setShowToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Validate and connect
  const handleVerify = async () => {
    if (!botToken.trim()) {
      showToast('لطفاً توکن ربات تلگرام را وارد کنید.', 'error');
      return;
    }
    if (!channelId.trim()) {
      showToast('لطفاً آیدی یا یوزرنیم کانال را وارد کنید.', 'error');
      return;
    }

    setIsVerifying(true);
    setTestResult(null);

    try {
      // Step 1: Test Bot
      const botRes = await fetch('/api/telegram/test-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: botToken.trim() }),
      });
      const botData = await botRes.json();

      if (!botData.success) {
        showToast(botData.message || 'توکن ربات نامعتبر است.', 'error');
        setIsVerifying(false);
        return;
      }

      // Step 2: Test Channel and Admin Privileges
      const chanRes = await fetch('/api/telegram/test-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: botToken.trim(),
          channelId: channelId.trim(),
        }),
      });
      const chanData = await chanRes.json();

      if (!chanData.success) {
        showToast(chanData.message || 'ارتباط با کانال برقرار نشد.', 'error');
        setTestResult({
          botOk: true,
          bot: botData.bot,
          channelOk: false,
          error: chanData.message,
        });
      } else {
        showToast('اتصال به ربات و کانال با موفقیت تأیید شد!', 'success');
        setTestResult({
          botOk: true,
          bot: botData.bot,
          channelOk: true,
          channel: chanData.channel,
        });

        await onUpdate({
          botToken: botToken.trim(),
          channelId: channelId.trim(),
          botName: botData.bot?.name || '',
          botUsername: botData.bot?.username ? `@${botData.bot.username}` : '',
          channelTitle: chanData.channel?.title || '',
          channelUsername: chanData.channel?.username ? `@${chanData.channel.username}` : channelId.trim(),
          isValidated: true,
          canPost: chanData.channel?.canPost ?? true,
          lastChecked: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      showToast('خطای شبکه در ارتباط با سرور تلگرام: ' + err.message, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  // Send a test message
  const handleSendTestMessage = async () => {
    setIsSendingTest(true);
    try {
      const res = await fetch('/api/telegram/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        showToast('پیام آزمایشی با موفقیت در کانال منتشر شد! 🎉', 'success');
      } else {
        showToast(data.message || 'خطا در ارسال پیام به کانال', 'error');
      }
    } catch (err: any) {
      showToast('خطا: ' + err.message, 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  const copySampleText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Info */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bot className="w-6 h-6 text-sky-400" />
          تنظیمات اتصال ربات و کانال تلگرام
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          برای اینکه سیستم بتواند به صورت خودکار پست‌ها را در کانال شما منتشر کند، توکن ربات ادمین و آیدی کانال را در این بخش وارد نمایید.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        
        {/* Field 1: Bot Token */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
            توکن ربات تلگرام (Bot Token) <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Key className="w-4 h-4" />
            </div>
            <input
              type={showToken ? 'text' : 'password'}
              dir="ltr"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              className="w-full pl-24 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-xs sm:text-sm font-mono text-slate-200 placeholder:text-slate-600 transition"
            />
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                title={showToken ? 'مخفی کردن' : 'نمایش توکن'}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            توکن دریافت شده از ربات رسمی @BotFather در تلگرام
          </p>
        </div>

        {/* Field 2: Channel ID / Username */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
            آیدی یا یوزرنیم کانال تلگرام (Channel Username / ID) <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Hash className="w-4 h-4" />
            </div>
            <input
              type="text"
              dir="ltr"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="@my_tech_channel یا -1001234567890"
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-xs sm:text-sm font-mono text-slate-200 placeholder:text-slate-600 transition"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            برای کانال‌های عمومی از یوزرنیم با @ استفاده کنید (مثال: <code className="text-sky-400">@my_channel</code>) یا برای کانال‌های خصوصی شناسه عددی با پیشوند -100 وارد کنید.
          </p>
        </div>

        {/* Actions Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال بررسی و اعتبارسنجی...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>بررسی و ذخیره اتصال</span>
              </>
            )}
          </button>

          {config.isValidated && (
            <button
              onClick={handleSendTestMessage}
              disabled={isSendingTest}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSendingTest ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ارسال پیام...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>ارسال پیام آزمایشی به کانال</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Validation Result Box */}
        {testResult && (
          <div className={`p-4 rounded-xl border mt-4 text-xs sm:text-sm ${
            testResult.channelOk 
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' 
              : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
          }`}>
            <div className="flex items-start gap-2.5">
              {testResult.channelOk ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="font-bold">
                  {testResult.channelOk ? 'اتصال با موفقیت برقرار شد!' : 'اشکال در اتصال به کانال تلگرام'}
                </h4>
                {testResult.bot && (
                  <p className="text-slate-300">
                    ربات: <span className="font-semibold">{testResult.bot.name}</span> (@{testResult.bot.username})
                  </p>
                )}
                {testResult.channel && (
                  <p className="text-slate-300">
                    کانال: <span className="font-semibold">{testResult.channel.title}</span> (دسترسی ارسال: {testResult.channel.canPost ? 'مجاز' : 'غیرمجاز'})
                  </p>
                )}
                {testResult.error && (
                  <p className="text-rose-200 mt-1 font-mono text-xs">
                    علت خطا: {testResult.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Persian Tutorial & Setup Guide */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-sky-400" />
          راهنمای گام به گام ساخت ربات و اتصال به کانال
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
          
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center font-mono">1</span>
              <span>دریافت توکن از BotFather</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              وارد تلگرام شده و به ربات <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-400 underline font-mono inline-flex items-center gap-0.5">@BotFather <ExternalLink className="w-3 h-3" /></a> پیام دهید. دستور <code className="text-sky-300 font-mono">/newbot</code> را ارسال کنید، برای ربات نام و یوزرنیم انتخاب کرده و در پایان رشته توکن داده شده را کپی کنید.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center font-mono">2</span>
              <span>افزودن ربات به عنوان مدیر (Admin)</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              به تنظیمات کانال تلگرام خود بروید، بخش <b>مدیران (Administrators)</b> را باز کنید و روی <b>افزودن مدیر (Add Admin)</b> بزنید. یوزرنیم ربات خود را سرچ کرده و به عنوان ادمین اضافه کنید.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center font-mono">3</span>
              <span>فعال‌سازی مجوز ارسال پیام</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              در دسترسی‌های ادمین، مطمئن شوید گزینه <b>ارسال پیام‌ها (Post Messages)</b> فعال (تیک‌خورده) باشد تا ربات اجازه ارسال محتوا را در کانال داشته باشد.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center font-mono">4</span>
              <span>وارد کردن آیدی در این پنل</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              یوزرنیم عمومی کانال خود (مثل <code className="text-sky-300 font-mono">@mychannel</code>) یا آیدی عددی کانال خصوصی را در کادر بالا وارد کرده و دکمه بررسی را بزنید!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
