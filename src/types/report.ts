export interface ReportMetadata {
  id: string;
  siteId: string;
  siteName: string;
  siteUrl: string;
  period: string;
  generatedAt: string;
  author: string;
  version: string;
}

export interface HealthScore {
  overall: number;
  analytics: number;
  seo: number;
  wordpress: number;
  security: number;
  performance: number;
}

export interface CriticalIssue {
  id: number;
  issue: string;
  priority: "critical" | "high" | "medium" | "low";
  category: "seo" | "security" | "performance" | "wordpress" | "analytics";
}

export interface TrafficMetric {
  label: string;
  value: number;
  previousValue?: number;
  change?: number;
  unit?: string;
}

export interface DeviceData {
  device: string;
  users: number;
  sessions: number;
  percentage: number;
}

export interface GeoData {
  country: string;
  countryCode: string;
  users: number;
  sessions: number;
  percentage: number;
}

export interface PageData {
  path: string;
  title?: string;
  views: number;
  avgTimeOnPage: number;
  bounceRate?: number;
}

export interface TrafficSource {
  channel: string;
  users: number;
  sessions: number;
  percentage: number;
}

export interface AnalyticsData {
  overview: {
    totalUsers: TrafficMetric;
    newUsers: TrafficMetric;
    sessions: TrafficMetric;
    pageViews: TrafficMetric;
    pagesPerSession: TrafficMetric;
    avgSessionDuration: TrafficMetric;
    bounceRate: TrafficMetric;
    engagementRate: TrafficMetric;
  };
  devices: DeviceData[];
  geography: GeoData[];
  topPages: PageData[];
  trafficSources: TrafficSource[];
  dailyData?: {
    date: string;
    users: number;
    sessions: number;
    pageViews: number;
  }[];
}

export interface SEOMetric {
  label: string;
  value: number | string;
  status: "good" | "warning" | "critical" | "neutral";
}

export interface IndexingStatus {
  indexed: number;
  notIndexed: number;
  reason?: string;
}

export interface Sitemap {
  url: string;
  urls: number;
  indexed: number;
}

export interface SEOData {
  overview: {
    totalClicks: SEOMetric;
    totalImpressions: SEOMetric;
    averageCTR: SEOMetric;
    averagePosition: SEOMetric;
  };
  indexing: IndexingStatus;
  sitemaps: Sitemap[];
  issues: {
    issue: string;
    severity: "critical" | "warning" | "info";
    solution?: string;
  }[];
}

export interface SystemInfo {
  siteName: string;
  tagline: string;
  url: string;
  adminEmail: string;
  language: string;
  timezone: string;
  multisite: boolean;
  ssl: boolean;
  permalinkStructure: string;
}

export interface WordPressCore {
  version: string;
  updateAvailable: boolean;
  latestVersion?: string;
  debugMode: boolean;
  debugLog: boolean;
  debugDisplay: boolean;
  memoryLimit: string;
  maxMemory: string;
  wpCron: boolean;
}

export interface ServerEnvironment {
  hostingProvider: string;
  serverSoftware: string;
  os: string;
  documentRoot: string;
}

export interface PHPConfig {
  version: string;
  memoryLimit: string;
  maxExecutionTime: string;
  maxInputVars: string;
  postMaxSize: string;
  uploadMaxFilesize: string;
  opcache: boolean;
  extensions: { name: string; version?: string; enabled: boolean }[];
}

export interface DatabaseInfo {
  version: string;
  server: string;
  name: string;
  host: string;
  tablePrefix: string;
  charset: string;
  collation: string;
  totalTables: number;
  totalSize: string;
  totalSizeMB: number;
  totalRows: number;
  largestTables: {
    name: string;
    size: string;
    sizeMB: number;
    rows: number;
  }[];
  cleanup: {
    metric: string;
    count: number;
    status: "good" | "warning" | "critical";
  }[];
  autoload: {
    size: string;
    sizeKB: number;
    count: number;
    status: "good" | "warning" | "critical";
  };
}

export interface PluginInfo {
  name: string;
  slug: string;
  version: string;
  author: string;
  active: boolean;
  updateAvailable: boolean;
  latestVersion?: string;
  autoUpdate: boolean;
  licenseIssue?: boolean;
}

export interface PluginUpdate {
  name: string;
  from: string;
  to: string;
}

export interface PluginChange {
  name: string;
  reason?: string;
  version?: string;
}

export interface ThemeInfo {
  name: string;
  version: string;
  author: string;
  active: boolean;
  isChild: boolean;
  parentTheme?: string;
  updateAvailable: boolean;
  latestVersion?: string;
}

export interface SecurityCheck {
  check: string;
  status: "pass" | "warning" | "fail";
  value?: string;
  recommendation?: string;
}

export interface UserInfo {
  username: string;
  email: string;
  role: string;
  weakUsername: boolean;
}

export interface SecurityData {
  ssl: {
    enabled: boolean;
    siteUrlSecure: boolean;
    forceSSLAdmin: boolean;
  };
  users: {
    total: number;
    administrators: number;
    adminUsernameExists: boolean;
    list: UserInfo[];
  };
  fileChecks: SecurityCheck[];
  settings: SecurityCheck[];
  recommendations: {
    priority: "high" | "medium" | "low";
    issue: string;
    action: string;
  }[];
}

export interface CacheStatus {
  type: string;
  enabled: boolean;
  details?: string;
}

export interface CronEvent {
  hook: string;
  nextRun: string;
  schedule: string;
}

export interface PerformanceData {
  caching: CacheStatus[];
  memory: {
    current: string;
    currentMB: number;
    peak: string;
    peakMB: number;
    limit: string;
    limitMB: number;
    usagePercent: number;
  };
  cron: {
    enabled: boolean;
    totalEvents: number;
    overdueEvents: number;
    schedules: string[];
    upcomingEvents: CronEvent[];
  };
}

export interface ContentStats {
  posts: { published: number; draft: number; total: number };
  pages: { published: number; draft: number; total: number };
  customPostTypes: {
    type: string;
    label: string;
    published: number;
    total: number;
  }[];
  media: {
    total: number;
    storageMB: number;
    recentUploads: number;
    byType: { type: string; count: number }[];
  };
  comments: {
    approved: number;
    pending: number;
    spam: number;
    total: number;
  };
  taxonomies: { name: string; label: string; terms: number }[];
}

export interface ActionItem {
  id: number;
  task: string;
  priority: "critical" | "high" | "medium" | "low";
  details: string;
  category: string;
}

export interface LighthouseScores {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

export interface CoreWebVitals {
  fcp: string; // First Contentful Paint
  lcp: string; // Largest Contentful Paint
  cls: string; // Cumulative Layout Shift
  tbt?: string; // Total Blocking Time
  si?: string; // Speed Index
}

export interface LighthouseData {
  scores: LighthouseScores;
  coreWebVitals: CoreWebVitals;
  strategy: "mobile" | "desktop";
  fetchTime: string;
}

export interface WordPressData {
  system: SystemInfo;
  core: WordPressCore;
  server: ServerEnvironment;
  php: PHPConfig;
  database: DatabaseInfo;
  plugins: {
    total: number;
    active: number;
    inactive: number;
    muPlugins: number;
    updatesAvailable: number;
    autoUpdatesEnabled: number;
    list: PluginInfo[];
    muList?: PluginInfo[];
    dropins?: { file: string; description: string }[];
    updatedThisMonth?: PluginUpdate[];
    installedThisMonth?: PluginChange[];
    removedThisMonth?: PluginChange[];
  };
  themes: {
    total: number;
    updatesAvailable: number;
    active: ThemeInfo;
    list: ThemeInfo[];
  };
  security: SecurityData;
  performance: PerformanceData;
  content: ContentStats;
}

export interface Report {
  metadata: ReportMetadata;
  healthScore: HealthScore;
  executiveSummary: {
    highlights: TrafficMetric[];
    criticalIssues: CriticalIssue[];
  };
  analytics: AnalyticsData;
  seo: SEOData;
  wordpress: WordPressData;
  lighthouse?: {
    mobile?: LighthouseData;
    desktop?: LighthouseData;
  };
  actionItems: {
    critical: ActionItem[];
    high: ActionItem[];
    medium: ActionItem[];
    low: ActionItem[];
  };
}
