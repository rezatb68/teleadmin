import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { XMLParser } from 'fast-xml-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Storage file path
const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'teleadmin_data.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default single bot template factory
function createDefaultBot(id: string, name: string, purpose: string, color: 'sky' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo' = 'sky') {
  return {
    id,
    name,
    purpose,
    color,
    telegram: {
      botToken: '',
      channelId: '',
      botName: '',
      botUsername: '',
      channelTitle: '',
      channelUsername: '',
      isValidated: false,
      canPost: false,
      lastChecked: null as string | null,
    },
    scheduler: {
      enabled: false,
      mode: 'interval' as 'interval' | 'specific_hours',
      intervalMinutes: 60,
      specificHours: ['09:00', '13:00', '17:00', '21:00'],
      maxPostsPerRun: 2,
      lastRunTime: null as string | null,
      nextRunTime: null as string | null,
    },
    sources: [
      {
        id: `src-${Date.now()}-1`,
        name: 'TradingView Ideas (تحلیل‌های برتر چارت)',
        url: 'https://www.tradingview.com/ideas/',
        category: 'تحلیل تکنیکال و مارکت',
        enabled: true,
        lastFetched: null as string | null,
        fetchCount: 0,
      },
      {
        id: `src-${Date.now()}-2`,
        name: 'CoinDesk Crypto',
        url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
        category: 'کریپتو و مالی',
        enabled: true,
        lastFetched: null as string | null,
        fetchCount: 0,
      },
    ],
    template: {
      tone: 'trading' as 'journalistic' | 'friendly' | 'bullets' | 'technical' | 'breaking' | 'trading',
      headerEmoji: '📊',
      showTitle: true,
      showSummary: true,
      showSourceLink: true,
      showDate: true,
      showHashtags: true,
      customSignature: '🆔 @your_channel_name\n🤖 تهیه شده توسط ادمین خودکار TeleAdmin',
      formatMode: 'HTML' as 'HTML' | 'Markdown',
      postWithImage: true,
      buttonText: '📊 مشاهده چارت در تریدینگ‌ویو',
      templatePattern: `{headerEmoji} <b>{title}</b>\n\n{content}\n\n{hashtags}\n\n{signature}`,
    },
    filters: {
      blacklistWords: ['casino', 'betting', 'شرط‌بندی', 'کازینو', 'قمار', 'اسپانسری', 'promoted', 'sponsor'],
      replacementWords: [
        { from: 'AI', to: 'هوش مصنوعی' },
        { from: 'ChatGPT', to: 'چت‌جی‌پی‌تی' },
        { from: 'Crypto', to: 'رمزارز' },
      ],
      whitelistWords: [] as string[],
      requireWhitelist: false,
      minContentLength: 40,
      filterSpam: true,
    },
    history: [] as any[],
    processedGuids: [] as string[],
  };
}

// Initial state with multi-bot structure
interface MultiBotState {
  activeBotId: string;
  bots: ReturnType<typeof createDefaultBot>[];
}

// Load state with automatic migration from single bot to multi-bot
function loadState(): MultiBotState {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const data = JSON.parse(raw);

      // Check if already in multi-bot format
      if (data.bots && Array.isArray(data.bots) && data.bots.length > 0) {
        return {
          activeBotId: data.activeBotId || data.bots[0].id,
          bots: data.bots,
        };
      }

      // Migrate single bot state to multi-bot seamlessly
      if (data.telegram) {
        const migratedBot = {
          id: 'bot-1',
          name: data.telegram.channelTitle ? `ربات ${data.telegram.channelTitle}` : 'ربات ۱: تحلیل تریدینگ‌ویو و کریپتو',
          purpose: 'تحلیل تکنیکال بازارهای مالی و اخبار چارت',
          color: 'emerald' as const,
          telegram: data.telegram,
          scheduler: data.scheduler || createDefaultBot('bot-1', '', '').scheduler,
          sources: data.sources || createDefaultBot('bot-1', '', '').sources,
          template: data.template || createDefaultBot('bot-1', '', '').template,
          filters: data.filters || createDefaultBot('bot-1', '', '').filters,
          history: data.history || [],
          processedGuids: data.processedGuids || [],
        };

        const migratedState: MultiBotState = {
          activeBotId: 'bot-1',
          bots: [migratedBot],
        };
        saveState(migratedState);
        return migratedState;
      }
    }
  } catch (err) {
    console.error('Error loading state:', err);
  }

  // Fallback initial multi-bot state with 2 default bot profiles
  const bot1 = createDefaultBot('bot-1', 'ربات ۱: تحلیل تکنیکال و تریدینگ', 'تحلیل‌های تریدینگ‌ویو و کریپتو', 'emerald');
  const bot2 = createDefaultBot('bot-2', 'ربات ۲: اخبار فناوری و هوش مصنوعی', 'پوشش تحولات دنیای فناوری و گجت‌ها', 'sky');
  bot2.sources = [
    {
      id: 'src-tc',
      name: 'TechCrunch News',
      url: 'https://techcrunch.com/feed/',
      category: 'فناوری و استارتاپ',
      enabled: true,
      lastFetched: null,
      fetchCount: 0,
    },
    {
      id: 'src-verge',
      name: 'The Verge',
      url: 'https://www.theverge.com/rss/index.xml',
      category: 'تکنولوژی و گجت',
      enabled: true,
      lastFetched: null,
      fetchCount: 0,
    },
  ];
  bot2.template.tone = 'journalistic';
  bot2.template.headerEmoji = '⚡️';
  bot2.template.buttonText = '🔗 مطالعه خبر اصلی';

  const defaultMultiState: MultiBotState = {
    activeBotId: 'bot-1',
    bots: [bot1, bot2],
  };
  saveState(defaultMultiState);
  return defaultMultiState;
}

function saveState(state: MultiBotState) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving state:', err);
  }
}

let appState = loadState();

// Helper: Get active bot or specific bot by ID
function getBot(botId?: string) {
  const targetId = botId || appState.activeBotId;
  const bot = appState.bots.find((b) => b.id === targetId);
  return bot || appState.bots[0];
}

// Helper: XML Parser
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

// Helper: Telegram API requests
async function callTelegramApi(token: string, method: string, body?: any) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return await response.json();
}

// Helper: Check keyword filters
function checkFilters(text: string, filters: ReturnType<typeof createDefaultBot>['filters']): { passed: boolean; reason?: string } {
  const lower = text.toLowerCase();

  // 1. Blacklist check
  for (const word of filters.blacklistWords) {
    const trimmed = word.trim().toLowerCase();
    if (trimmed && lower.includes(trimmed)) {
      return { passed: false, reason: `شامل کلمه فیلتر شده: "${word}"` };
    }
  }

  // 2. Whitelist check (if required)
  if (filters.requireWhitelist && filters.whitelistWords.length > 0) {
    const hasWhitelist = filters.whitelistWords.some((w) => {
      const trimmed = w.trim().toLowerCase();
      return trimmed && lower.includes(trimmed);
    });
    if (!hasWhitelist) {
      return { passed: false, reason: 'هیچ‌کدام از کلمات مجاز اجباری یافت نشد' };
    }
  }

  return { passed: true };
}

// Helper: Apply word replacements
function applyReplacements(text: string, replacements: ReturnType<typeof createDefaultBot>['filters']['replacementWords']): string {
  let result = text;
  for (const item of replacements) {
    if (item.from && item.to) {
      const regex = new RegExp(item.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      result = result.replace(regex, item.to);
    }
  }
  return result;
}

// Helper: Translate and format with Gemini API
async function processContentWithGemini(
  title: string,
  content: string,
  sourceName: string,
  template: ReturnType<typeof createDefaultBot>['template'],
  filters: ReturnType<typeof createDefaultBot>['filters'],
  sourceUrl?: string
): Promise<{
  translatedTitle: string;
  translatedContent: string;
  hashtags: string[];
  formattedTelegramText: string;
}> {
  const isTradingAnalysis =
    template.tone === 'trading' ||
    sourceName.toLowerCase().includes('tradingview') ||
    sourceName.includes('تریدینگ') ||
    (sourceUrl && sourceUrl.includes('tradingview.com')) ||
    content.includes('تحلیل نماد:') ||
    content.includes('chart structure') ||
    content.includes('BTCUSDT') ||
    content.includes('ETHUSD');

  const toneDescriptions: Record<string, string> = {
    journalistic: 'رسمی، روان، خبری و حرفه‌ای مانند خبرگزاری‌های معتبر',
    friendly: 'صمیمی، جذاب و روان مناسب کانال‌های عمومی و شبکه‌های اجتماعی',
    bullets: 'خلاصه‌سازی به صورت نکات کلیدی بولت‌پوینت با ایموجی‌های مناسب برای هر نکته',
    technical: 'دقیق، تخصصی با حفظ اصطلاحات فنی به همراه توضیحات روان',
    breaking: 'کوتاه، فوری، هیجانی و تلگرافی با تاکید بر اصل خبر',
    trading: 'تخصصی، تحلیل تکنیکال و انسانی با اصطلاحات بازار تریدینگ (حمایت، مقاومت، اوردربلاک، تارگت)',
  };

  const tonePrompt = toneDescriptions[template.tone] || toneDescriptions.journalistic;

  const prompt = isTradingAnalysis
    ? `
نقش شما: یک تحلیل‌گر ارشد و حرفه‌ای بازارهای مالی (کریپتو و فارکس) و ادمین کانال تخصصی تحلیل در تلگرام.
وظیفه: تحلیل تکنیکال زیر از تریدینگ‌ویو (TradingView) را به «فارسی روان، سلیس و کاملاً انسانی» (با ادبیات طبیعی تریدرهای حرفه‌ای، بدون لحن ربات‌گونه یا ترجمه تحت‌اللفظی) ترجمه و بازنویسی کنید.

الزامات ترجمه انسانی و تخصصی بازار:
1. استفاده از اصطلاحات رایج و اصیل بازار مالی:
   - سطوح حمایت و مقاومت (Support & Resistance)
   - دیدگاه صعودی/لانگ (Bullish / Long) یا نزولی/شورت (Bearish / Short)
   - اوردربلاک‌ها (Order Blocks)، نواحی عرضه و تقاضا (Supply & Demand Zones)
   - شکست خط روند (Trendline Breakout)، پول‌بک و تست مجدد، جمع‌آوری نقدینگی (Liquidity Sweep)
   - تارگت‌های صعودی/نزولی و حد ضرر
2. عنوان فارسی جذاب و رسا برای تحلیل شامل نام نماد و سناریوی اصلی.
3. متن تحلیل را خوانا، خوش‌خوان و با ایموجی‌های مناسب بنویسید به طوری که هر تریدری در چند ثانیه پیام اصلی چارت را بفهمد.
4. حجم کل متن بین ۴۵۰ تا ۷۵۰ کاراکتر باشد تا همراه با عکس چارت در کپشن تلگرام ارسال شود.
5. ۳ الی ۵ هشتگ تخصصی بازار (مانند #تحلیل_تکنیکال #TradingView #بیتکوین یا نماد مربوطه) تولید کنید.

عنوان انگلیسی تحلیل: ${title}
متن و داده‌های تحلیل تریدینگ‌ویو:
${content || title}

خروجی را صرفاً در قالب JSON زیر بازگردانید:
{
  "translatedTitle": "عنوان فارسی جذاب و تحلیل‌گرانه",
  "translatedContent": "متن تحلیل چارت به فارسی روان و انسانی با پاراگراف‌بندی مناسب",
  "hashtags": ["#نماد", "#تحلیل_تکنیکال", "#TradingView"]
}
`
    : `
نقش شما: یک مدیر محتوا و ادمین حرفه‌ای کانال تلگرام فارسی.
وظیفه: خبر/مقاله زیر را از زبان انگلیسی (یا هر زبان دیگر) به زبان فارسی روان و شیوا ترجمه و بازنویسی کنید.

مشخصات سبک ترجمه: ${tonePrompt}
نام منبع: ${sourceName}

متن اصلی برای ترجمه:
عنوان: ${title}
متن خبر: ${content || title}

الزامات خروجی:
1. یک عنوان جذاب فارسی (ترجمه دقیق و گیرا) ارائه دهید.
2. متن خبر را به طور کامل یا خلاصه شده (مطابق سبک ${template.tone}) به فارسی ترجمه کنید.
3. ۳ تا ۶ هشتگ فارسی و انگلیسی مناسب استخراج کنید.
4. از ادبیات ربات‌گونه و ترجمه ماشینی سفت پرهیز کنید؛ جملات باید کاملاً طبیعی و خوش‌خوان باشند.

پاسخ را دقیقاً در قالب فرمت JSON زیر بدون هیچ متن اضافی بازگردانید:
{
  "translatedTitle": "عنوان فارسی جذاب",
  "translatedContent": "متن ترجمه شده به فارسی با رعایت پاراگراف‌بندی مناسب",
  "hashtags": ["#هشتگ۱", "#هشتگ۲", "#هشتگ۳"]
}
`;

  let responseText = '';
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      if (response.text) {
        responseText = response.text;
        break;
      }
    } catch (apiErr: any) {
      console.warn(`Model ${modelName} failed, trying next fallback:`, apiErr.message || apiErr);
    }
  }

  if (responseText) {
    try {
      const parsed = JSON.parse(responseText);

      const translatedTitle = parsed.translatedTitle || title;
      let translatedContent = parsed.translatedContent || content;
      const hashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags : ['#خبر', '#تحلیل'];

      // Apply custom keyword replacements
      translatedContent = applyReplacements(translatedContent, filters.replacementWords);

      // Format post according to template
      const headerEmoji = isTradingAnalysis ? (template.headerEmoji || '📊') : (template.headerEmoji || '⚡️');
      const hashtagsStr = hashtags.join(' ');
      const signatureStr = template.customSignature || '';
      const sourceLinkStr = sourceUrl && template.showSourceLink ? `\n\n🔗 <a href="${sourceUrl}">منبع: ${sourceName}</a>` : '';

      let formattedTelegramText = '';
      if (isTradingAnalysis) {
        formattedTelegramText = `📊 <b>${translatedTitle}</b>\n\n${translatedContent}\n\n${hashtagsStr}${sourceLinkStr}\n\n${signatureStr}`;
      } else if (template.templatePattern && template.templatePattern.includes('{title}')) {
        formattedTelegramText = template.templatePattern
          .replace('{headerEmoji}', headerEmoji)
          .replace('{title}', translatedTitle)
          .replace('{content}', translatedContent)
          .replace('{hashtags}', hashtagsStr)
          .replace('{signature}', signatureStr)
          .replace('{source}', sourceLinkStr);
      } else {
        formattedTelegramText = `${headerEmoji} <b>${translatedTitle}</b>\n\n${translatedContent}\n\n${hashtagsStr}${sourceLinkStr}\n\n${signatureStr}`;
      }

      return {
        translatedTitle,
        translatedContent,
        hashtags,
        formattedTelegramText,
      };
    } catch (parseErr) {
      console.error('Error parsing Gemini JSON response:', parseErr);
    }
  }

  // Fallback if AI call fails
  return {
    translatedTitle: title,
    translatedContent: content,
    hashtags: ['#اخبار', `#${sourceName.replace(/\s+/g, '_')}`],
    formattedTelegramText: `${template.headerEmoji || '📌'} <b>${title}</b>\n\n${content}\n\n${template.customSignature || ''}`,
  };
}

// Scrape TradingView Ideas page for chart analyses and chart snapshot images
async function fetchTradingViewIdeas(url: string): Promise<Array<{
  guid: string;
  title: string;
  link: string;
  content: string;
  pubDate: string;
  imageUrl?: string;
  symbol?: string;
  stance?: string;
  author?: string;
}>> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!res.ok) {
    throw new Error(`خطا در دسترسی به صفحه تریدینگ‌ویو (${res.status} ${res.statusText})`);
  }

  const html = await res.text();
  const cardSplits = html.split(/<article\s+[^>]*class=["'][^'"]*ideaCard/i);

  const items: any[] = [];
  for (let i = 1; i < cardSplits.length; i++) {
    const card = cardSplits[i];

    // Extract Title
    const titleMatch = card.match(/data-qa-id=["']ui-lib-card-link-title["'][^>]*>([\s\S]*?)<\/a>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';

    // Extract Link
    const linkMatch = card.match(/href=["'](https:\/\/www\.tradingview\.com\/chart\/[^"'\s]+)["']/i) ||
                      card.match(/href=["'](\/chart\/[^"'\s]+)["']/i);
    let link = linkMatch ? linkMatch[1] : '';
    if (link && link.startsWith('/')) {
      link = 'https://www.tradingview.com' + link;
    }

    // Extract Paragraph / Content
    const pMatch = card.match(/data-qa-id=["']ui-lib-card-link-paragraph["'][^>]*>([\s\S]*?)<\/a>/i);
    const rawParagraph = pMatch ? pMatch[1].replace(/<[^>]*>/g, '').trim() : '';

    // Extract Chart snapshot image (upgrade to _big.png for crisp chart)
    const imgMatch = card.match(/(https:\/\/s3\.tradingview\.com\/[a-zA-Z0-9_\-\/]+(?:_mid|_big)\.(?:png|webp|jpg))/i);
    let imageUrl = imgMatch ? imgMatch[1] : '';
    if (imageUrl) {
      imageUrl = imageUrl.replace('_mid.webp', '_big.png').replace('_mid.png', '_big.png');
    }

    // Extract Stance (Long/Short)
    const stanceMatch = card.match(/title=["'](Long|Short|Neutral)["']/i);
    const stance = stanceMatch ? stanceMatch[1] : '';

    // Extract Symbol
    const symbolMatch = card.match(/\/chart\/([a-zA-Z0-9_\-]+)\//i) || card.match(/\/symbols\/([a-zA-Z0-9_\-]+)\//i);
    const symbol = symbolMatch ? symbolMatch[1] : '';

    // Extract Author
    const authorMatch = card.match(/class=["'][^'"]*cardAuthor[^'"]*["'][^>]*>([\s\S]*?)<\/span>/i);
    const author = authorMatch ? authorMatch[1].replace(/<[^>]*>/g, '').trim() : '';

    if (title && link) {
      const stanceFa = stance === 'Long' ? '🟢 دیدگاه: صعودی (Long)' : stance === 'Short' ? '🔴 دیدگاه: نزولی (Short)' : '';
      const stanceLine = stanceFa ? `${stanceFa}\n` : '';
      const symbolLine = symbol ? `نماد: ${symbol}\n` : '';
      const authorLine = author ? `تحلیل‌گر: ${author}\n` : '';

      items.push({
        guid: link,
        title,
        link,
        content: `${symbolLine}${stanceLine}${authorLine}\n${rawParagraph}`,
        pubDate: new Date().toISOString(),
        imageUrl: imageUrl || undefined,
        symbol,
        stance,
        author,
      });
    }
  }

  return items;
}

// Fetch RSS feed articles
async function fetchRssFeed(url: string): Promise<Array<{
  guid: string;
  title: string;
  link: string;
  content: string;
  pubDate: string;
  imageUrl?: string;
}>> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TeleAdminBot/1.0',
    },
  });

  if (!res.ok) {
    throw new Error(`خطا در دریافت فید (${res.status} ${res.statusText})`);
  }

  const xmlText = await res.text();
  const parsed = xmlParser.parse(xmlText);

  const items: any[] = [];
  if (parsed.rss?.channel?.item) {
    const rawItems = Array.isArray(parsed.rss.channel.item) ? parsed.rss.channel.item : [parsed.rss.channel.item];
    items.push(...rawItems);
  } else if (parsed.feed?.entry) {
    // Atom feed
    const rawEntries = Array.isArray(parsed.feed.entry) ? parsed.feed.entry : [parsed.feed.entry];
    for (const entry of rawEntries) {
      items.push({
        title: entry.title,
        link: entry.link?.['@_href'] || entry.link || '',
        description: entry.summary || entry.content?.['#text'] || entry.content || '',
        guid: entry.id || entry.link?.['@_href'] || entry.title,
        pubDate: entry.updated || entry.published || '',
      });
    }
  }

  return items.map((item) => {
    const rawDesc = item.description || item['content:encoded'] || '';
    const cleanDesc = typeof rawDesc === 'string' ? rawDesc.replace(/<[^>]*>/g, '').trim() : '';

    let imageUrl: string | undefined = undefined;
    if (item.enclosure?.['@_type']?.startsWith('image/')) {
      imageUrl = item.enclosure['@_url'];
    } else if (item['media:content']?.['@_url']) {
      imageUrl = item['media:content']['@_url'];
    } else if (item['media:thumbnail']?.['@_url']) {
      imageUrl = item['media:thumbnail']['@_url'];
    }

    return {
      guid: String(item.guid?.['#text'] || item.guid || item.link || item.title),
      title: String(item.title || '').trim(),
      link: String(item.link || '').trim(),
      content: cleanDesc.slice(0, 1500),
      pubDate: item.pubDate || new Date().toISOString(),
      imageUrl,
    };
  });
}

// Universal fetcher for RSS feeds or Web Scraping (like TradingView)
async function fetchContentSource(url: string): Promise<Array<{
  guid: string;
  title: string;
  link: string;
  content: string;
  pubDate: string;
  imageUrl?: string;
  symbol?: string;
  stance?: string;
  author?: string;
}>> {
  if (url.includes('tradingview.com')) {
    return await fetchTradingViewIdeas(url);
  }
  return await fetchRssFeed(url);
}

// Safe HTML caption for Telegram photos (respecting Telegram 1024-character limit and tag closures)
function formatSafeTelegramCaption(htmlText: string, maxLen = 980): string {
  if (htmlText.length <= maxLen) return htmlText;

  let truncated = htmlText.slice(0, maxLen);
  const lastBreak = Math.max(
    truncated.lastIndexOf('\n\n'),
    truncated.lastIndexOf('\n'),
    truncated.lastIndexOf('. ')
  );
  if (lastBreak > maxLen * 0.5) {
    truncated = truncated.slice(0, lastBreak);
  }

  // Ensure opened HTML tags are properly closed
  const tags = ['b', 'i', 'code', 'pre', 'a'];
  for (const tag of tags) {
    const openCount = (truncated.match(new RegExp(`<${tag}(\\s+[^>]*)?>`, 'gi')) || []).length;
    const closeCount = (truncated.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
    for (let i = 0; i < openCount - closeCount; i++) {
      truncated += `</${tag}>`;
    }
  }

  return truncated;
}

// Core function: Run the automated fetch & publish cycle for a specific bot
async function executePublishCycleForBot(botId?: string): Promise<{
  success: boolean;
  botId: string;
  botName: string;
  publishedCount: number;
  filteredCount: number;
  errors: string[];
}> {
  const bot = getBot(botId);
  const { telegram, sources, filters, template, scheduler } = bot;
  const errors: string[] = [];
  let publishedCount = 0;
  let filteredCount = 0;

  if (!telegram.botToken || !telegram.channelId) {
    return {
      success: false,
      botId: bot.id,
      botName: bot.name,
      publishedCount: 0,
      filteredCount: 0,
      errors: [`توکن ربات تلگرام یا آیدی کانال برای ربات «${bot.name}» مشخص نشده است.`],
    };
  }

  const activeSources = sources.filter((s) => s.enabled);
  if (activeSources.length === 0) {
    return {
      success: false,
      botId: bot.id,
      botName: bot.name,
      publishedCount: 0,
      filteredCount: 0,
      errors: [`هیچ منبع فعالی برای ربات «${bot.name}» انتخاب نشده است.`],
    };
  }

  const maxPosts = scheduler.maxPostsPerRun || 2;
  let remainingSlots = maxPosts;

  for (const source of activeSources) {
    if (remainingSlots <= 0) break;

    try {
      const articles = await fetchContentSource(source.url);
      source.lastFetched = new Date().toISOString();
      source.fetchCount = (source.fetchCount || 0) + articles.length;

      for (const article of articles) {
        if (remainingSlots <= 0) break;

        // Check if already processed by this bot
        if (bot.processedGuids.includes(article.guid)) {
          continue;
        }

        // Mark as seen immediately
        bot.processedGuids.push(article.guid);
        if (bot.processedGuids.length > 500) {
          bot.processedGuids = bot.processedGuids.slice(-500);
        }

        // Check keyword filters
        const fullTextToCheck = `${article.title} ${article.content}`;
        const filterResult = checkFilters(fullTextToCheck, filters);

        if (!filterResult.passed) {
          filteredCount++;
          bot.history.unshift({
            id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            sourceName: source.name,
            sourceUrl: article.link,
            originalTitle: article.title,
            translatedTitle: '(فیلتر شده)',
            contentPreview: article.content.slice(0, 100),
            publishedAt: new Date().toISOString(),
            status: 'filtered',
            filterReason: filterResult.reason,
          });
          continue;
        }

        // Process with Gemini AI
        const processed = await processContentWithGemini(
          article.title,
          article.content,
          source.name,
          template,
          filters,
          article.link
        );

        // Prepare Telegram message
        const isTrading = source.url.includes('tradingview.com') || source.name.includes('تریدینگ');
        const buttonLabel = isTrading ? '📊 مشاهده چارت در تریدینگ‌ویو' : (template.buttonText || '🔗 منبع خبر');

        const replyMarkup = template.showSourceLink && article.link ? {
          inline_keyboard: [
            [
              { text: buttonLabel, url: article.link },
            ],
          ],
        } : undefined;

        let sendResult;
        if (template.postWithImage && article.imageUrl) {
          const safeCaption = formatSafeTelegramCaption(processed.formattedTelegramText, 980);
          sendResult = await callTelegramApi(telegram.botToken, 'sendPhoto', {
            chat_id: telegram.channelId,
            photo: article.imageUrl,
            caption: safeCaption,
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
          });

          // Fallback if sendPhoto failed
          if (!sendResult.ok) {
            console.warn('sendPhoto failed, falling back to sendMessage:', sendResult.description);
            sendResult = await callTelegramApi(telegram.botToken, 'sendMessage', {
              chat_id: telegram.channelId,
              text: processed.formattedTelegramText,
              parse_mode: 'HTML',
              reply_markup: replyMarkup,
            });
          }
        } else {
          sendResult = await callTelegramApi(telegram.botToken, 'sendMessage', {
            chat_id: telegram.channelId,
            text: processed.formattedTelegramText,
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
          });
        }

        if (sendResult.ok) {
          publishedCount++;
          remainingSlots--;
          bot.history.unshift({
            id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            sourceName: source.name,
            sourceUrl: article.link,
            originalTitle: article.title,
            translatedTitle: processed.translatedTitle,
            contentPreview: processed.translatedContent.slice(0, 140) + '...',
            publishedAt: new Date().toISOString(),
            status: 'published',
            telegramMessageId: sendResult.result?.message_id,
            telegramChatId: telegram.channelId,
          });
        } else {
          errors.push(`خطا در ارسال به کانال (${bot.name}): ${sendResult.description || 'نامشخص'}`);
          bot.history.unshift({
            id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            sourceName: source.name,
            sourceUrl: article.link,
            originalTitle: article.title,
            translatedTitle: processed.translatedTitle,
            contentPreview: processed.translatedContent.slice(0, 100),
            publishedAt: new Date().toISOString(),
            status: 'failed',
            error: sendResult.description,
          });
        }
      }
    } catch (sourceErr: any) {
      errors.push(`خطا در پردازش منبع ${source.name}: ${sourceErr.message}`);
    }
  }

  if (bot.history.length > 100) {
    bot.history = bot.history.slice(0, 100);
  }

  bot.scheduler.lastRunTime = new Date().toISOString();
  saveState(appState);

  return {
    success: errors.length === 0 || publishedCount > 0,
    botId: bot.id,
    botName: bot.name,
    publishedCount,
    filteredCount,
    errors,
  };
}

// Background scheduler timer checking ALL enabled bots
let schedulerInterval: NodeJS.Timeout | null = null;

function calculateNextRunTime(scheduler: ReturnType<typeof createDefaultBot>['scheduler']) {
  if (!scheduler.enabled) return null;

  const now = new Date();
  if (scheduler.mode === 'interval') {
    const next = new Date(now.getTime() + (scheduler.intervalMinutes || 60) * 60 * 1000);
    return next.toISOString();
  } else {
    const hours = (scheduler.specificHours || []).sort();
    for (const hStr of hours) {
      const [h, m] = hStr.split(':').map(Number);
      const candidate = new Date(now);
      candidate.setHours(h, m, 0, 0);
      if (candidate.getTime() > now.getTime()) {
        return candidate.toISOString();
      }
    }
    if (hours.length > 0) {
      const [h, m] = hours[0].split(':').map(Number);
      const nextDay = new Date(now);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(h, m, 0, 0);
      return nextDay.toISOString();
    }
  }
  return null;
}

function startScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }

  // Calculate next run times for all bots
  for (const bot of appState.bots) {
    if (bot.scheduler.enabled) {
      bot.scheduler.nextRunTime = calculateNextRunTime(bot.scheduler);
    } else {
      bot.scheduler.nextRunTime = null;
    }
  }
  saveState(appState);

  // Check every 30 seconds
  schedulerInterval = setInterval(async () => {
    const now = new Date();

    for (const bot of appState.bots) {
      if (!bot.scheduler.enabled) continue;

      const nextTime = bot.scheduler.nextRunTime ? new Date(bot.scheduler.nextRunTime) : null;
      if (nextTime && now >= nextTime) {
        console.log(`⏰ Running scheduled cycle for bot [${bot.name}] (${bot.id}) at`, now.toISOString());
        try {
          await executePublishCycleForBot(bot.id);
        } catch (e) {
          console.error(`Scheduled cycle error for bot ${bot.name}:`, e);
        }
        bot.scheduler.nextRunTime = calculateNextRunTime(bot.scheduler);
        saveState(appState);
      }
    }
  }, 30000);
}

// Start scheduler on launch
startScheduler();

// API Routes

// 1. Get complete state
app.get('/api/state', (req, res) => {
  res.json({ success: true, data: appState });
});

// 2. Select active bot
app.post('/api/bots/select', (req, res) => {
  const { botId } = req.body;
  if (botId && appState.bots.some((b) => b.id === botId)) {
    appState.activeBotId = botId;
    saveState(appState);
  }
  res.json({ success: true, data: appState });
});

// 3. Create a new bot profile
app.post('/api/bots/create', (req, res) => {
  const { name, purpose, preset, color } = req.body;
  const newId = `bot-${Date.now()}`;
  const colors: Array<'sky' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo'> = ['amber', 'purple', 'rose', 'sky', 'indigo', 'emerald'];
  const chosenColor = color || colors[appState.bots.length % colors.length];

  const newBot = createDefaultBot(
    newId,
    name || `ربات جدید ${appState.bots.length + 1}`,
    purpose || 'انتشار خودکار محتوا در کانال تلگرام',
    chosenColor
  );

  // Apply presets if chosen
  if (preset === 'tech') {
    newBot.name = name || 'ربات اخبار فناوری و هوش مصنوعی';
    newBot.purpose = purpose || 'اخبار فناوری، استارتاپ و هوش مصنوعی';
    newBot.color = 'sky';
    newBot.sources = [
      {
        id: `src-${Date.now()}-1`,
        name: 'TechCrunch News',
        url: 'https://techcrunch.com/feed/',
        category: 'فناوری و استارتاپ',
        enabled: true,
        lastFetched: null,
        fetchCount: 0,
      },
      {
        id: `src-${Date.now()}-2`,
        name: 'The Verge',
        url: 'https://www.theverge.com/rss/index.xml',
        category: 'تکنولوژی و گجت',
        enabled: true,
        lastFetched: null,
        fetchCount: 0,
      },
    ];
    newBot.template.tone = 'journalistic';
    newBot.template.headerEmoji = '⚡️';
    newBot.template.buttonText = '🔗 مطالعه منبع اصلی';
  } else if (preset === 'world') {
    newBot.name = name || 'ربات اخبار فوری جهان';
    newBot.purpose = purpose || 'پوشش تحولات بین‌المللی و اقتصادی';
    newBot.color = 'amber';
    newBot.sources = [
      {
        id: `src-${Date.now()}-1`,
        name: 'BBC World News',
        url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
        category: 'اخبار جهان',
        enabled: true,
        lastFetched: null,
        fetchCount: 0,
      },
    ];
    newBot.template.tone = 'breaking';
    newBot.template.headerEmoji = '🚨';
    newBot.template.buttonText = '🔗 منبع خبر';
  }

  appState.bots.push(newBot);
  appState.activeBotId = newId;
  saveState(appState);

  res.json({ success: true, data: appState, createdBot: newBot });
});

// 4. Update specific bot profile or active bot
app.post('/api/state', (req, res) => {
  const { botId, name, purpose, color, telegram, scheduler, sources, template, filters } = req.body;
  const targetBot = getBot(botId);

  if (name) targetBot.name = name;
  if (purpose) targetBot.purpose = purpose;
  if (color) targetBot.color = color;
  if (telegram) targetBot.telegram = { ...targetBot.telegram, ...telegram };
  if (scheduler) {
    const wasEnabled = targetBot.scheduler.enabled;
    targetBot.scheduler = { ...targetBot.scheduler, ...scheduler };
    if (wasEnabled !== targetBot.scheduler.enabled || scheduler.mode || scheduler.intervalMinutes || scheduler.specificHours) {
      targetBot.scheduler.nextRunTime = calculateNextRunTime(targetBot.scheduler);
    }
  }
  if (sources) targetBot.sources = sources;
  if (template) targetBot.template = { ...targetBot.template, ...template };
  if (filters) targetBot.filters = { ...targetBot.filters, ...filters };

  saveState(appState);
  res.json({ success: true, data: appState });
});

// 5. Delete a bot profile
app.delete('/api/bots/:id', (req, res) => {
  const { id } = req.params;
  if (appState.bots.length <= 1) {
    return res.status(400).json({ success: false, message: 'حداقل یک ربات باید در سیستم وجود داشته باشد.' });
  }

  appState.bots = appState.bots.filter((b) => b.id !== id);
  if (appState.activeBotId === id) {
    appState.activeBotId = appState.bots[0].id;
  }
  saveState(appState);
  res.json({ success: true, data: appState, message: 'ربات با موفقیت حذف شد.' });
});

// 6. Test Bot Token
app.post('/api/telegram/test-bot', async (req, res) => {
  try {
    const { botToken, botId } = req.body;
    if (!botToken) {
      return res.status(400).json({ success: false, message: 'لطفاً توکن ربات را وارد کنید.' });
    }

    const result = await callTelegramApi(botToken, 'getMe');
    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: result.description || 'توکن ربات نامعتبر است یا ارتباط با تلگرام برقرار نشد.',
      });
    }

    const targetBot = getBot(botId);
    targetBot.telegram.botToken = botToken;
    targetBot.telegram.botName = result.result?.first_name || '';
    targetBot.telegram.botUsername = result.result?.username ? `@${result.result.username}` : '';
    saveState(appState);

    res.json({
      success: true,
      bot: {
        id: result.result?.id,
        name: result.result?.first_name,
        username: result.result?.username,
        canJoinGroups: result.result?.can_join_groups,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Test Channel Connection & Admin Permissions
app.post('/api/telegram/test-channel', async (req, res) => {
  try {
    const { botToken, channelId, botId } = req.body;
    const targetBot = getBot(botId);
    const token = botToken || targetBot.telegram.botToken;
    const targetChannel = channelId || targetBot.telegram.channelId;

    if (!token || !targetChannel) {
      return res.status(400).json({
        success: false,
        message: 'توکن ربات و آیدی کانال هر دو الزامی هستند.',
      });
    }

    let formattedChannel = targetChannel.trim();
    if (!formattedChannel.startsWith('@') && !formattedChannel.startsWith('-100') && !formattedChannel.startsWith('-')) {
      if (isNaN(Number(formattedChannel))) {
        formattedChannel = `@${formattedChannel}`;
      }
    }

    const chatResult = await callTelegramApi(token, 'getChat', { chat_id: formattedChannel });
    if (!chatResult.ok) {
      return res.status(400).json({
        success: false,
        message: `کانال یافت نشد یا ربات به آن دسترسی ندارد (${chatResult.description}). مطمئن شوید ربات را به عنوان ادمین به این کانال اضافه کرده‌اید.`,
      });
    }

    const botMe = await callTelegramApi(token, 'getMe');
    let canPost = false;
    let adminStatus = 'نامشخص';

    if (botMe.ok) {
      const memberResult = await callTelegramApi(token, 'getChatMember', {
        chat_id: formattedChannel,
        user_id: botMe.result.id,
      });

      if (memberResult.ok) {
        const status = memberResult.result.status;
        adminStatus = status;
        if (status === 'administrator' || status === 'creator') {
          canPost = memberResult.result.can_post_messages !== false;
        }
      }
    }

    targetBot.telegram.channelId = formattedChannel;
    targetBot.telegram.channelTitle = chatResult.result?.title || '';
    targetBot.telegram.channelUsername = chatResult.result?.username ? `@${chatResult.result.username}` : formattedChannel;
    targetBot.telegram.isValidated = true;
    targetBot.telegram.canPost = canPost;
    targetBot.telegram.lastChecked = new Date().toISOString();
    saveState(appState);

    res.json({
      success: true,
      channel: {
        id: chatResult.result?.id,
        title: chatResult.result?.title,
        username: chatResult.result?.username,
        description: chatResult.result?.description,
        adminStatus,
        canPost,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Send Test Message to Channel
app.post('/api/telegram/send-test', async (req, res) => {
  try {
    const { customText, botId } = req.body;
    const targetBot = getBot(botId);
    const { botToken, channelId } = targetBot.telegram;

    if (!botToken || !channelId) {
      return res.status(400).json({
        success: false,
        message: `ابتدا توکن ربات و آیدی کانال را برای «${targetBot.name}» تنظیم کنید.`,
      });
    }

    const testMessage = customText || `⚡️ <b>پیام آزمایشی TeleAdmin AI</b>\n\nاتصال «${targetBot.name}» به کانال تلگرام شما با موفقیت تأیید شد! 🎉\nکاربرد ربات: ${targetBot.purpose}\n\n🆔 ${channelId}\n🕒 تاریخ: ${new Date().toLocaleDateString('fa-IR')}`;

    const sendResult = await callTelegramApi(botToken, 'sendMessage', {
      chat_id: channelId,
      text: testMessage,
      parse_mode: 'HTML',
    });

    if (!sendResult.ok) {
      return res.status(400).json({
        success: false,
        message: `خطا در ارسال پیام: ${sendResult.description}`,
      });
    }

    res.json({
      success: true,
      message: `پیام آزمایشی برای «${targetBot.name}» در کانال منتشر شد!`,
      messageId: sendResult.result?.message_id,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. Test Fetch from Source (RSS or TradingView)
app.post('/api/sources/test-fetch', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'آدرس فید یا سایت الزامی است.' });
    }

    const articles = await fetchContentSource(url);
    res.json({
      success: true,
      count: articles.length,
      sampleArticles: articles.slice(0, 5),
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: `خطا در دریافت منبع: ${err.message}`,
    });
  }
});

// 10. Preview AI Translation & Formatting
app.post('/api/ai/preview-translate', async (req, res) => {
  try {
    const { title, content, sourceName, tone, templatePattern, headerEmoji, signature, botId } = req.body;
    const targetBot = getBot(botId);

    const customTemplate = {
      ...targetBot.template,
      tone: tone || targetBot.template.tone,
      templatePattern: templatePattern || targetBot.template.templatePattern,
      headerEmoji: headerEmoji || targetBot.template.headerEmoji,
      customSignature: signature !== undefined ? signature : targetBot.template.customSignature,
    };

    const processed = await processContentWithGemini(
      title || 'Nvidia reveals next-generation architecture for high-speed computing',
      content || 'The new architecture delivers up to 4x higher throughput and real-time efficiency across global datacenters.',
      sourceName || targetBot.name,
      customTemplate,
      targetBot.filters
    );

    res.json({ success: true, processed });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 11. Run specific bot immediately
app.post('/api/scheduler/run-now', async (req, res) => {
  try {
    const { botId } = req.body;
    const result = await executePublishCycleForBot(botId);
    const targetBot = getBot(botId);

    res.json({
      success: result.success,
      botId: result.botId,
      botName: result.botName,
      publishedCount: result.publishedCount,
      filteredCount: result.filteredCount,
      errors: result.errors,
      history: targetBot.history.slice(0, 10),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 12. Run ALL enabled bots simultaneously
app.post('/api/scheduler/run-all', async (req, res) => {
  try {
    const results = [];
    for (const bot of appState.bots) {
      if (bot.telegram.botToken && bot.telegram.channelId) {
        const resForBot = await executePublishCycleForBot(bot.id);
        results.push(resForBot);
      }
    }

    res.json({
      success: true,
      results,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 13. Clear History of a bot
app.delete('/api/history', (req, res) => {
  const { botId } = req.query;
  const targetBot = getBot(botId as string);
  targetBot.history = [];
  saveState(appState);
  res.json({ success: true, message: `تاریخچه ربات «${targetBot.name}» پاکسازی شد.` });
});

// Start Express server and connect Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TeleAdmin AI Multi-Bot Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
