import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Report as JSONReport } from "@/types/report";

const REPORTS_DIRECTORY = path.join(process.cwd(), "src/content/reports");

export interface HealthScore {
  overall: number;
  analytics: number;
  seo: number;
  wordpress: number;
  security: number;
  performance: number;
}

export interface ReportMeta {
  slug: string;
  siteSlug: string;
  title: string;
  siteName: string;
  siteUrl: string;
  period: string;
  generatedAt: string;
  author: string;
  healthScore: HealthScore;
  isJson?: boolean;
}

export interface Report extends ReportMeta {
  content: string;
}

export type { JSONReport };

export interface Site {
  slug: string;
  name: string;
  url: string;
  reportsCount: number;
  latestReport: ReportMeta | null;
}

function generateSiteSlug(siteName: string): string {
  return siteName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function calculateHealthScore(content: string): HealthScore {
  let analyticsScore = 70;
  let seoScore = 70;
  let wordpressScore = 70;
  let securityScore = 70;
  let performanceScore = 70;

  // Analytics scoring
  const usersMatch = content.match(/Total Users\s*\|\s*(\d+)/i);
  if (usersMatch) {
    const users = parseInt(usersMatch[1], 10);
    if (users > 1000) analyticsScore = 95;
    else if (users > 500) analyticsScore = 85;
    else if (users > 100) analyticsScore = 75;
    else if (users > 50) analyticsScore = 65;
    else analyticsScore = 50;
  }

  // SEO scoring
  if (content.includes("noindex") || content.includes("Not Indexed")) {
    seoScore = 20;
  } else if (content.includes("Indexed Pages | 0")) {
    seoScore = 30;
  } else {
    const impressionsMatch = content.match(/Total Impressions\s*\|\s*(\d+)/i);
    if (impressionsMatch) {
      const impressions = parseInt(impressionsMatch[1], 10);
      if (impressions > 10000) seoScore = 95;
      else if (impressions > 1000) seoScore = 85;
      else if (impressions > 100) seoScore = 70;
      else seoScore = 55;
    }
  }

  // WordPress scoring
  if (content.includes("WordPress Version") && content.includes("Latest")) {
    wordpressScore += 10;
  }

  const updatesMatch = content.match(/Updates Available\s*\|\s*\*\*(\d+)\*\*/i);
  if (updatesMatch) {
    const updates = parseInt(updatesMatch[1], 10);
    if (updates === 0) wordpressScore = 95;
    else if (updates <= 3) wordpressScore = 80;
    else if (updates <= 6) wordpressScore = 65;
    else if (updates <= 10) wordpressScore = 50;
    else wordpressScore = 35;
  }

  // Security scoring
  if (content.includes("SSL | ✅ Enabled") || content.includes("SSL Enabled | ✅")) {
    securityScore += 15;
  }
  if (content.includes("DISALLOW_FILE_EDIT | Not set")) {
    securityScore -= 10;
  }
  if (content.includes("admin\" Username Exists | ✅ No")) {
    securityScore += 5;
  }
  securityScore = Math.min(100, Math.max(0, securityScore));

  // Performance scoring
  if (content.includes("Object Cache | ✅ Enabled")) {
    performanceScore += 15;
  }
  if (content.includes("Page Cache | ✅ Enabled")) {
    performanceScore += 10;
  }
  if (content.includes("OPcache | ⚠️ Disabled")) {
    performanceScore -= 10;
  }
  performanceScore = Math.min(100, Math.max(0, performanceScore));

  // Calculate overall score (weighted average)
  const overall = Math.round(
    (analyticsScore * 0.15) +
    (seoScore * 0.25) +
    (wordpressScore * 0.25) +
    (securityScore * 0.20) +
    (performanceScore * 0.15)
  );

  return {
    overall,
    analytics: analyticsScore,
    seo: seoScore,
    wordpress: wordpressScore,
    security: securityScore,
    performance: performanceScore,
  };
}

function parseReportFrontmatter(
  slug: string,
  fileContent: string
): ReportMeta | null {
  try {
    const { data, content } = matter(fileContent);

    let title = data.title;
    if (!title) {
      const h1Match = content.match(/^#\s+(.+)$/m);
      title = h1Match ? h1Match[1] : slug;
    }

    let siteName = data.siteName;
    if (!siteName) {
      const h2Match = content.match(/^##\s+(.+?)(?:\s+-\s+|\s*$)/m);
      siteName = h2Match ? h2Match[1] : "Unknown Site";
    }

    const siteSlug = generateSiteSlug(siteName);
    const healthScore = calculateHealthScore(content);

    return {
      slug,
      siteSlug,
      title: title || "Monthly Report",
      siteName: data.siteName || siteName,
      siteUrl: data.siteUrl || "",
      period: data.period || extractPeriod(content) || "Unknown Period",
      generatedAt: data.generatedAt || extractGeneratedDate(content) || "",
      author: data.author || "Fabian Miranda",
      healthScore,
    };
  } catch {
    return null;
  }
}

function extractPeriod(content: string): string | null {
  const match = content.match(/\*\*Report Period:\*\*\s*(.+)/i);
  return match ? match[1].trim() : null;
}

function extractGeneratedDate(content: string): string | null {
  const match = content.match(/\*\*Generated:\*\*\s*(.+)/i);
  return match ? match[1].trim() : null;
}

function parseJsonReport(slug: string, fileContent: string): ReportMeta | null {
  try {
    const data = JSON.parse(fileContent) as JSONReport;
    const siteSlug = generateSiteSlug(data.metadata.siteName);

    return {
      slug,
      siteSlug,
      title: `${data.metadata.siteName} - ${data.metadata.period}`,
      siteName: data.metadata.siteName,
      siteUrl: data.metadata.siteUrl,
      period: data.metadata.period,
      generatedAt: data.metadata.generatedAt,
      author: data.metadata.author,
      healthScore: data.healthScore,
      isJson: true,
    };
  } catch {
    return null;
  }
}

export async function getAllReports(): Promise<ReportMeta[]> {
  if (!fs.existsSync(REPORTS_DIRECTORY)) {
    return [];
  }

  const files = fs.readdirSync(REPORTS_DIRECTORY);
  const reports: ReportMeta[] = [];

  for (const file of files) {
    const isJson = file.endsWith(".json");
    const isMd = file.endsWith(".md");

    if (!isJson && !isMd) continue;

    const slug = file.replace(/\.(json|md)$/, "");
    const filePath = path.join(REPORTS_DIRECTORY, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");

    let meta: ReportMeta | null = null;

    if (isJson) {
      meta = parseJsonReport(slug, fileContent);
    } else {
      meta = parseReportFrontmatter(slug, fileContent);
    }

    if (meta) {
      reports.push(meta);
    }
  }

  return reports.sort((a, b) => {
    const dateA = new Date(a.generatedAt || 0).getTime();
    const dateB = new Date(b.generatedAt || 0).getTime();
    return dateB - dateA;
  });
}

export async function getAllSites(): Promise<Site[]> {
  const reports = await getAllReports();
  const sitesMap = new Map<string, Site>();

  for (const report of reports) {
    const existing = sitesMap.get(report.siteSlug);

    if (existing) {
      existing.reportsCount++;
      if (!existing.latestReport ||
          new Date(report.generatedAt) > new Date(existing.latestReport.generatedAt)) {
        existing.latestReport = report;
      }
    } else {
      sitesMap.set(report.siteSlug, {
        slug: report.siteSlug,
        name: report.siteName,
        url: report.siteUrl,
        reportsCount: 1,
        latestReport: report,
      });
    }
  }

  return Array.from(sitesMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export async function getSiteBySlug(slug: string): Promise<Site | null> {
  const sites = await getAllSites();
  return sites.find(site => site.slug === slug) || null;
}

export async function getReportsBySiteSlug(siteSlug: string): Promise<ReportMeta[]> {
  const reports = await getAllReports();
  return reports.filter(report => report.siteSlug === siteSlug);
}

export async function getReportBySlug(slug: string): Promise<Report | null> {
  // First try JSON
  const jsonPath = path.join(REPORTS_DIRECTORY, `${slug}.json`);
  if (fs.existsSync(jsonPath)) {
    const fileContent = fs.readFileSync(jsonPath, "utf-8");
    const meta = parseJsonReport(slug, fileContent);
    if (meta) {
      return {
        ...meta,
        content: "", // JSON reports don't use content field
      };
    }
  }

  // Fall back to markdown
  const mdPath = path.join(REPORTS_DIRECTORY, `${slug}.md`);
  if (!fs.existsSync(mdPath)) {
    return null;
  }

  const fileContent = fs.readFileSync(mdPath, "utf-8");
  const { content } = matter(fileContent);
  const meta = parseReportFrontmatter(slug, fileContent);

  if (!meta) {
    return null;
  }

  return {
    ...meta,
    content,
  };
}

export async function getJsonReportBySlug(slug: string): Promise<JSONReport | null> {
  const jsonPath = path.join(REPORTS_DIRECTORY, `${slug}.json`);

  if (!fs.existsSync(jsonPath)) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(jsonPath, "utf-8");
    return JSON.parse(fileContent) as JSONReport;
  } catch {
    return null;
  }
}

export function reportExists(slug: string): boolean {
  const jsonPath = path.join(REPORTS_DIRECTORY, `${slug}.json`);
  const mdPath = path.join(REPORTS_DIRECTORY, `${slug}.md`);
  return fs.existsSync(jsonPath) || fs.existsSync(mdPath);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "green";
  if (score >= 60) return "yellow";
  if (score >= 40) return "orange";
  return "red";
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 70) return "Fair";
  if (score >= 60) return "Needs Attention";
  if (score >= 40) return "Poor";
  return "Critical";
}
