import React, { useState } from 'react';
import { 
  Palette, 
  Sparkles, 
  Eye, 
  Send, 
  Check, 
  RotateCcw, 
  HelpCircle, 
  Loader2, 
  Image as ImageIcon,
  ExternalLink,
  Tag,
  Hash
} from 'lucide-react';
import { PostTemplateConfig } from '../types';

interface CustomizerTabProps {
  template: PostTemplateConfig;
  onUpdateTemplate: (template: Partial<PostTemplateConfig>) => Promise<void>;
  channelTitle?: string;
  channelUsername?: string;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const CustomizerTab: React.FC<CustomizerTabProps> = ({
  template,
  onUpdateTemplate,
  channelTitle = 'کانال تلگرام شما',
  channelUsername = '@channel_username',
  showToast,
}) => {
  const [isGeneratingAiPreview, setIsGeneratingAiPreview] = useState(false);
  const [aiPreviewData, setAiPreviewData] = useState<any>(null);

  const emojiPresets = ['⚡️', '🚨', '💡', '🌐', '📢', '📌', '🤖', '📈', '🚀', '🔥', '💻', '🌍'];

  const toneOptions = [
    {
      id: 'trading',
      title: 'تحلیل چارت و مارکت (تریدینگ‌ویو)',
      desc: 'ترجمه تخصصی و انسانی تریدینگ (حمایت، مقاومت، اوردربلاک، تارگت، دیدگاه صعودی/نزولی)',
      badge: 'ویژه چارت',
    },
    {
      id: 'journalistic',
      title: 'رسمی و خبری',
      desc: 'نگارش فصیح، حرفه‌ای و استاندارد مشابه خبرگزاری‌های بین‌المللی',
      badge: 'پیشنهادی',
    },
    {
      id: 'friendly',
      title: 'صمیمی و روان',
      desc: 'لحن صمیمی‌تر، خوش‌خوان و بسیار جذاب برای شبکه‌های اجتماعی',
      badge: 'پرمخاطب',
    },
    {
      id: 'bullets',
      title: 'نکات کلیدی (بولت‌پوینت)',
      desc: 'خلاصه‌سازی خبر در چند نکته مهم به همراه ایموجی برای مرور سریع',
      badge: 'خلاصه',
    },
    {
      id: 'technical',
      title: 'فنی و تخصصی',
      desc: 'دقت بالا روی جزییات مهندسی، معماری، کد و اصطلاحات تکنولوژی',
      badge: 'تخصصی',
    },
    {
      id: 'breaking',
      title: 'فوری و کوتاه',
      desc: 'تیتروار، سریع و تلگرافی با تمرکز روی اصل و فوریت رویداد',
      badge: 'فوری',
    },
  ];

  // Reset template pattern to default
  const handleResetTemplate = async () => {
    const defaultPattern = `{headerEmoji} <b>{title}</b>\n\n{content}\n\n{hashtags}\n\n{signature}`;
    await onUpdateTemplate({ templatePattern: defaultPattern });
    showToast('الگوی پست به حالت پیش‌فرض بازگشت.', 'info');
  };

  // Test AI translation preview
  const handleTestAiPreview = async () => {
    setIsGeneratingAiPreview(true);
    try {
      const res = await fetch('/api/ai/preview-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Anthropic and OpenAI unveil next-gen autonomous coding models',
          content: 'The new generative models can autonomously navigate code repositories, run debugging environments, and solve complex refactoring benchmarks with over 80% accuracy in real-time execution.',
          sourceName: 'TechCrunch',
          tone: template.tone,
          templatePattern: template.templatePattern,
          headerEmoji: template.headerEmoji,
          signature: template.customSignature,
        }),
      });

      const data = await res.json();
      if (data.success && data.processed) {
        setAiPreviewData(data.processed);
        showToast('پیش‌نمایش زنده با هوش مصنوعی تولید شد!', 'success');
      } else {
        showToast('خطا در تولید پیش‌نمایش هوش مصنوعی', 'error');
      }
    } catch (err: any) {
      showToast('خطا: ' + err.message, 'error');
    } finally {
      setIsGeneratingAiPreview(false);
    }
  };

  // Fallback demo content for visual preview
  const demoTitle = aiPreviewData?.translatedTitle || 'رونمایی از نسل جدید مدل‌های برنامه‌نویسی خودکار با دقت خیره‌کننده';
  const demoContent = aiPreviewData?.translatedContent || 
    (template.tone === 'bullets'
      ? '🔹 مدل‌های جدید قابلیت بررسی خودکار ساختار کل مخازن کد را دارا هستند.\n🔹 دقت حل باگ‌ها و تست‌ها تا بیش از ۸۰ درصد افزایش یافته است.\n🔹 محیط‌های شبیه‌سازی بلادرنگ برای اجرای کدها فراهم شده است.'
      : 'مدل‌های جدید هوش مصنوعی اکنون می‌توانند به طور خودکار در ساختار پروژه‌های بزرگ برنامه‌نویسی کاوش کرده، خطاها را بازتولید و با دقت بالای ۸۰ درصد راه‌حل‌های بهینه را در محیط‌های واقعی پیاده‌سازی نمایند.');
  const demoHashtags = aiPreviewData?.hashtags?.join(' ') || '#فناوری #هوش_مصنوعی #کدنویسی #Tech';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Info */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Palette className="w-6 h-6 text-sky-400" />
          شخصی‌سازی ظاهر و قالب پست‌های ارسالی به تلگرام
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          سبک ترجمه، ایموجی‌ها، امضای کانال، هشتگ‌ها و نحوه نمایش پیام در کانال تلگرام را طبق سلیقه خود تنظیم کنید.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left / Settings Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: AI Tone Selection */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                سبک و لحن ترجمه هوش مصنوعی (AI Tone)
              </label>
            </div>

            <div className="space-y-2">
              {toneOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => onUpdateTemplate({ tone: opt.id as any })}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    template.tone === opt.id
                      ? 'bg-sky-500/15 border-sky-500/50 text-white'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm">{opt.title}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-sky-400 border border-slate-700 font-medium">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{opt.desc}</p>
                  </div>

                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    template.tone === opt.id ? 'border-sky-400 bg-sky-400' : 'border-slate-600'
                  }`}>
                    {template.tone === opt.id && <Check className="w-3 h-3 text-slate-950" />}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Header Emoji */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <label className="font-bold text-sm text-white block">
              ایموجی شروع سرتیتر (Header Emoji)
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {emojiPresets.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onUpdateTemplate({ headerEmoji: emoji })}
                  className={`w-10 h-10 rounded-xl border text-lg flex items-center justify-center transition cursor-pointer ${
                    template.headerEmoji === emoji
                      ? 'bg-sky-500/20 border-sky-500 shadow-sm shadow-sky-500/30 scale-105'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
              <input
                type="text"
                maxLength={4}
                value={template.headerEmoji}
                onChange={(e) => onUpdateTemplate({ headerEmoji: e.target.value })}
                placeholder="دلخواه"
                className="w-16 h-10 px-2 rounded-xl bg-slate-950 border border-slate-800 text-center text-sm text-slate-200 focus:border-sky-500"
                title="ایموجی دلخواه خود را وارد کنید"
              />
            </div>
          </div>

          {/* Section 3: Switches & Formatting Options */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white">
              عناصر قابل نمایش در پست
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              
              {/* Show Source Link */}
              <label className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-950">
                <span className="text-slate-300">لینک منبع (دکمه شیشه‌ای)</span>
                <input
                  type="checkbox"
                  checked={template.showSourceLink}
                  onChange={(e) => onUpdateTemplate({ showSourceLink: e.target.checked })}
                  className="accent-sky-500 w-4 h-4 cursor-pointer"
                />
              </label>

              {/* Show Hashtags */}
              <label className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-950">
                <span className="text-slate-300">هشتگ‌های هوشمند هوش مصنوعی</span>
                <input
                  type="checkbox"
                  checked={template.showHashtags}
                  onChange={(e) => onUpdateTemplate({ showHashtags: e.target.checked })}
                  className="accent-sky-500 w-4 h-4 cursor-pointer"
                />
              </label>

              {/* Post with Image */}
              <label className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-950">
                <span className="text-slate-300">ارسال به همراه تصویر شاخص</span>
                <input
                  type="checkbox"
                  checked={template.postWithImage}
                  onChange={(e) => onUpdateTemplate({ postWithImage: e.target.checked })}
                  className="accent-sky-500 w-4 h-4 cursor-pointer"
                />
              </label>

              {/* Show Date */}
              <label className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-950">
                <span className="text-slate-300">فرمت متن (HTML تلگرام)</span>
                <span className="text-xs font-mono text-sky-400">HTML Tags</span>
              </label>
            </div>
          </div>

          {/* Section 4: Channel Signature / Footer */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-sm text-white">
                امضا و آیدی انتهای پست (Channel Signature)
              </label>
            </div>
            <textarea
              rows={3}
              value={template.customSignature}
              onChange={(e) => onUpdateTemplate({ customSignature: e.target.value })}
              placeholder="🆔 @my_channel\n🌐 www.example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              این متن در انتهای تمامی پست‌های ارسالی درج می‌شود. می‌توانید آیدی کانال، وب‌سایت یا شعار خود را بنویسید.
            </p>
          </div>

          {/* Section 5: Template Pattern Editor */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-sm text-white">
                الگوی ساختار پیام (Template Pattern)
              </label>
              <button
                type="button"
                onClick={handleResetTemplate}
                className="text-xs text-slate-400 hover:text-sky-300 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>بازنشانی پیش‌فرض</span>
              </button>
            </div>

            <textarea
              rows={4}
              dir="ltr"
              value={template.templatePattern}
              onChange={(e) => onUpdateTemplate({ templatePattern: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs font-mono text-slate-200"
            />
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400">
              <span>متغیرهای مجاز:</span>
              <code className="text-sky-400 px-1 py-0.5 rounded bg-slate-800">{'{headerEmoji}'}</code>
              <code className="text-sky-400 px-1 py-0.5 rounded bg-slate-800">{'{title}'}</code>
              <code className="text-sky-400 px-1 py-0.5 rounded bg-slate-800">{'{content}'}</code>
              <code className="text-sky-400 px-1 py-0.5 rounded bg-slate-800">{'{hashtags}'}</code>
              <code className="text-sky-400 px-1 py-0.5 rounded bg-slate-800">{'{signature}'}</code>
            </div>
          </div>
        </div>

        {/* Right / Live Telegram Preview Column (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-400" />
              پیش‌نمایش زنده در تلگرام
            </h3>
            <button
              onClick={handleTestAiPreview}
              disabled={isGeneratingAiPreview}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold transition cursor-pointer"
            >
              {isGeneratingAiPreview ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>ترجمه زنده...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تست هوش مصنوعی</span>
                </>
              )}
            </button>
          </div>

          {/* Telegram Phone Mockup Screen */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-4 shadow-2xl relative overflow-hidden">
            
            {/* Telegram Channel Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-sky-500/20">
                  {channelTitle ? channelTitle.charAt(0) : 'T'}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-white truncate max-w-[150px]">
                      {channelTitle}
                    </span>
                    <span className="w-3 h-3 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center text-[8px] font-black">
                      ✓
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block" dir="ltr">
                    {channelUsername}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500">امروز</span>
            </div>

            {/* Telegram Message Bubble */}
            <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl rounded-tr-sm p-4 text-xs space-y-3.5 shadow-lg">
              
              {/* Optional Photo/Banner simulation */}
              {template.postWithImage && (
                <div className="w-full h-36 rounded-xl bg-gradient-to-br from-slate-800 via-slate-800/80 to-slate-900 border border-slate-700/50 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
                  <ImageIcon className="w-8 h-8 opacity-40 text-sky-400 mb-1" />
                  <span className="text-[11px] font-medium opacity-60">تصویر شاخص منبع خبری</span>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[9px] text-slate-300 font-mono">
                    TechCrunch Media
                  </div>
                </div>
              )}

              {/* Title with Header Emoji */}
              <div className="text-white font-bold text-sm leading-snug">
                <span>{template.headerEmoji} </span>
                <span>{demoTitle}</span>
              </div>

              {/* Content Body */}
              <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                {demoContent}
              </div>

              {/* Hashtags */}
              {template.showHashtags && (
                <div className="text-sky-400 font-medium text-[11px] space-x-1 space-x-reverse">
                  {demoHashtags}
                </div>
              )}

              {/* Signature */}
              {template.customSignature && (
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono whitespace-pre-line leading-relaxed">
                  {template.customSignature}
                </div>
              )}

              {/* Message Footer: Views & Time */}
              <div className="flex items-center justify-end gap-1.5 pt-1 text-[10px] text-slate-500 font-mono">
                <span>👁 1.2k</span>
                <span>{new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Simulated Inline Button */}
            {template.showSourceLink && (
              <div className="mt-2">
                <div className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-sky-300 text-xs font-medium text-center flex items-center justify-center gap-1.5 transition">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{template.buttonText || '🔗 مطالعه منبع اصلی'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>نکته بهینه‌سازی کانال:</span>
            </div>
            <p>
              پست‌های دارای امضای مشخص و هشتگ‌های تخصصی معمولاً تا ۳۵ درصد بازدید و اشتراک‌گذاری بیشتری در تلگرام جذب می‌کنند.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
