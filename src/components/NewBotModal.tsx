import React, { useState } from 'react';
import { Bot, X, Sparkles, TrendingUp, Cpu, Globe, Check, Plus } from 'lucide-react';

interface NewBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBot: (botData: {
    name: string;
    purpose: string;
    preset?: 'trading' | 'tech' | 'world' | 'custom';
    color: 'sky' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo';
  }) => Promise<void>;
}

export const NewBotModal: React.FC<NewBotModalProps> = ({
  isOpen,
  onClose,
  onCreateBot,
}) => {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<'trading' | 'tech' | 'world' | 'custom'>('tech');
  const [selectedColor, setSelectedColor] = useState<'sky' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo'>('sky');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const presets = [
    {
      id: 'trading' as const,
      title: 'تحلیل تکنیکال و مارکت',
      desc: 'منابع TradingView Ideas و کریپتو، لحن تخصصی ترید و ارسال همراه با عکس چارت',
      icon: TrendingUp,
      color: 'emerald' as const,
      defaultName: 'ربات تحلیل تکنیکال چارت',
      defaultPurpose: 'تحلیل چارت تریدینگ‌ویو و بازارهای مالی',
    },
    {
      id: 'tech' as const,
      title: 'اخبار فناوری و هوش مصنوعی',
      desc: 'منابع TechCrunch و The Verge، لحن رسمی و مدرن خبری',
      icon: Cpu,
      color: 'sky' as const,
      defaultName: 'ربات اخبار فناوری و هوش مصنوعی',
      defaultPurpose: 'اخبار استارتاپ‌ها، تکنولوژی و هوش مصنوعی',
    },
    {
      id: 'world' as const,
      title: 'اخبار جهان و رویدادهای فوری',
      desc: 'منابع بین‌المللی BBC و رویترز، لحن فوری و تلگرافی',
      icon: Globe,
      color: 'amber' as const,
      defaultName: 'ربات اخبار فوری بین‌المللی',
      defaultPurpose: 'پوشش تحولات و سرخط رویدادهای جهانی',
    },
  ];

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setSelectedPreset(preset.id);
    setSelectedColor(preset.color);
    if (!name || presets.some(p => p.defaultName === name)) {
      setName(preset.defaultName);
    }
    if (!purpose || presets.some(p => p.defaultPurpose === purpose)) {
      setPurpose(preset.defaultPurpose);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateBot({
        name: name.trim(),
        purpose: purpose.trim() || 'ادمین خودکار کانال تلگرام',
        preset: selectedPreset,
        color: selectedColor,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                تعریف ربات جدید با کاربرد و کانال اختصاصی
              </h3>
              <p className="text-xs text-slate-400">
                می‌توانید چند ربات جداگانه برای کانال‌های متفاوت با منابع و استایل مستقل بسازید.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          
          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              ۱. انتخاب قالب آماده کاربرد ربات (پیشنهادی):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {presets.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedPreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500/60 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                      </div>
                      <h4 className="font-bold text-xs text-white leading-tight">
                        {preset.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                        {preset.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bot Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ۲. نام دلخواه برای این ربات <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: ربات اخبار ارز دیجیتال یا کانال سیگنال فارکس"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:border-sky-500"
              required
            />
          </div>

          {/* Bot Purpose */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ۳. کاربرد و زمینه فعالیت (توضیح کوتاه)
            </label>
            <input
              type="text"
              placeholder="مثال: انتشار خودکار تحلیل چارت‌های تریدینگ‌ویو برای کانال ترید VIP"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:border-sky-500"
            />
          </div>

          {/* Color Tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              ۴. رنگ نشانگر برای تمایز ربات در پنل:
            </label>
            <div className="flex items-center gap-2">
              {[
                { id: 'sky', label: 'آبی آسمانی', bg: 'bg-sky-500' },
                { id: 'emerald', label: 'سبز تریدینگ', bg: 'bg-emerald-500' },
                { id: 'amber', label: 'طلایی / زرد', bg: 'bg-amber-500' },
                { id: 'purple', label: 'بنفش', bg: 'bg-purple-500' },
                { id: 'rose', label: 'قرمز / رز', bg: 'bg-rose-500' },
                { id: 'indigo', label: 'نیلی', bg: 'bg-indigo-500' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.id as any)}
                  className={`w-7 h-7 rounded-xl ${c.bg} transition cursor-pointer flex items-center justify-center ${
                    selectedColor === c.id ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-60 hover:opacity-100'
                  }`}
                  title={c.label}
                >
                  {selectedColor === c.id && <Check className="w-4 h-4 text-slate-950" />}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'در حال ساخت...' : 'ایجاد و رفتن به تنظیمات ربات'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
