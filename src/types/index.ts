export interface TelegramConfig {
  botToken: string;
  channelId: string;
  botName: string;
  botUsername: string;
  channelTitle: string;
  channelUsername: string;
  isValidated: boolean;
  canPost: boolean;
  lastChecked: string | null;
}

export interface SchedulerConfig {
  enabled: boolean;
  mode: 'interval' | 'specific_hours';
  intervalMinutes: number;
  specificHours: string[];
  maxPostsPerRun: number;
  lastRunTime: string | null;
  nextRunTime: string | null;
}

export interface SourceItem {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled: boolean;
  lastFetched: string | null;
  fetchCount?: number;
}

export interface PostTemplateConfig {
  tone: 'journalistic' | 'friendly' | 'bullets' | 'technical' | 'breaking' | 'trading';
  headerEmoji: string;
  showTitle: boolean;
  showSummary: boolean;
  showSourceLink: boolean;
  showDate: boolean;
  showHashtags: boolean;
  customSignature: string;
  formatMode: 'HTML' | 'Markdown';
  postWithImage: boolean;
  buttonText: string;
  templatePattern: string;
}

export interface FilterWordReplacement {
  from: string;
  to: string;
}

export interface FiltersConfig {
  blacklistWords: string[];
  replacementWords: FilterWordReplacement[];
  whitelistWords: string[];
  requireWhitelist: boolean;
  minContentLength: number;
  filterSpam: boolean;
}

export interface HistoryItem {
  id: string;
  sourceName: string;
  sourceUrl: string;
  originalTitle: string;
  translatedTitle: string;
  contentPreview: string;
  publishedAt: string;
  status: 'published' | 'filtered' | 'failed';
  filterReason?: string;
  telegramMessageId?: number;
  telegramChatId?: string;
  error?: string;
}

export interface BotProfile {
  id: string;
  name: string;
  purpose: string;
  color: 'sky' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo';
  telegram: TelegramConfig;
  scheduler: SchedulerConfig;
  sources: SourceItem[];
  template: PostTemplateConfig;
  filters: FiltersConfig;
  history: HistoryItem[];
  processedGuids: string[];
}

export interface AppState {
  activeBotId: string;
  bots: BotProfile[];
}
