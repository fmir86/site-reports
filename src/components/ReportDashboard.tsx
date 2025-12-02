"use client";

import { useState } from "react";
import type { Report } from "@/types/report";
import styles from "@/styles/pages/Report.module.scss";
import HealthScoreGauge from "@/components/charts/HealthScoreGauge";
import TrafficChart from "@/components/charts/TrafficChart";
import DeviceChart from "@/components/charts/DeviceChart";
import TrafficSourcesChart from "@/components/charts/TrafficSourcesChart";
import GeoMap from "@/components/charts/GeoMap";
import TopPagesTable from "@/components/charts/TopPagesTable";
import IssuesList from "@/components/charts/IssuesList";
import PluginsTable from "@/components/charts/PluginsTable";
import MetricCard from "@/components/charts/MetricCard";
import LighthouseScores from "@/components/charts/LighthouseScores";

interface ReportDashboardProps {
  report: Report;
}

type TabType = "overview" | "analytics" | "seo" | "wordpress" | "performance" | "actions";

export default function ReportDashboard({ report }: ReportDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "seo", label: "SEO" },
    { id: "wordpress", label: "WordPress" },
    { id: "performance", label: "Performance" },
    { id: "actions", label: "Action Items" },
  ];

  const allActionItems = [
    ...report.actionItems.critical,
    ...report.actionItems.high,
    ...report.actionItems.medium,
    ...report.actionItems.low,
  ];

  return (
    <div className={styles.dashboardGrid}>
      {/* Tab Navigation */}
      <nav className={styles.tabNav}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === "overview" && (
          <OverviewTab report={report} allActionItems={allActionItems} />
        )}
        {activeTab === "analytics" && <AnalyticsTab report={report} />}
        {activeTab === "seo" && <SEOTab report={report} />}
        {activeTab === "wordpress" && <WordPressTab report={report} />}
        {activeTab === "performance" && <PerformanceTab report={report} />}
        {activeTab === "actions" && (
          <ActionsTab report={report} allActionItems={allActionItems} />
        )}
      </div>
    </div>
  );
}

function OverviewTab({
  report,
  allActionItems,
}: {
  report: Report;
  allActionItems: Report["actionItems"]["critical"];
}) {
  return (
    <div className={styles.section}>
      {/* Health Score + Key Metrics */}
      <div className={styles.chartsRow}>
        <HealthScoreGauge
          overall={report.healthScore.overall}
          analytics={report.healthScore.analytics}
          seo={report.healthScore.seo}
          wordpress={report.healthScore.wordpress}
          security={report.healthScore.security}
          performance={report.healthScore.performance}
        />
        <div className={styles.metricsGrid}>
          {report.executiveSummary.highlights.map((metric, i) => (
            <MetricCard
              key={i}
              label={metric.label}
              value={metric.value}
              unit={metric.unit}
              change={metric.change}
            />
          ))}
        </div>
      </div>

      {/* Critical Issues */}
      {report.executiveSummary.criticalIssues.length > 0 && (
        <IssuesList
          issues={report.executiveSummary.criticalIssues.map((issue) => ({
            issue: issue.issue,
            severity:
              issue.priority === "critical"
                ? "critical"
                : issue.priority === "high"
                  ? "warning"
                  : "info",
            category: issue.category,
          }))}
          title="Critical Issues"
        />
      )}

      {/* Traffic Overview */}
      {report.analytics.dailyData && report.analytics.dailyData.length > 0 && (
        <TrafficChart data={report.analytics.dailyData} title="Traffic Overview" />
      )}

      {/* Quick Stats Row */}
      <div className={styles.chartsRow}>
        <DeviceChart data={report.analytics.devices} />
        <TrafficSourcesChart data={report.analytics.trafficSources} />
      </div>
    </div>
  );
}

function AnalyticsTab({ report }: { report: Report }) {
  const { analytics } = report;

  return (
    <div className={styles.section}>
      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <MetricCard
          label={analytics.overview.totalUsers.label}
          value={analytics.overview.totalUsers.value}
          change={analytics.overview.totalUsers.change}
        />
        <MetricCard
          label={analytics.overview.sessions.label}
          value={analytics.overview.sessions.value}
          change={analytics.overview.sessions.change}
        />
        <MetricCard
          label={analytics.overview.pageViews.label}
          value={analytics.overview.pageViews.value}
          change={analytics.overview.pageViews.change}
        />
        <MetricCard
          label={analytics.overview.bounceRate.label}
          value={analytics.overview.bounceRate.value}
          unit={analytics.overview.bounceRate.unit}
          change={analytics.overview.bounceRate.change}
          inverseChange
        />
      </div>

      {/* Traffic Chart */}
      {analytics.dailyData && analytics.dailyData.length > 0 && (
        <TrafficChart data={analytics.dailyData} title="Daily Traffic" />
      )}

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        <DeviceChart data={analytics.devices} />
        <TrafficSourcesChart data={analytics.trafficSources} />
      </div>

      {/* Geographic + Top Pages */}
      <div className={styles.chartsRow}>
        <GeoMap data={analytics.geography} />
        <TopPagesTable data={analytics.topPages} />
      </div>

      {/* Additional Metrics */}
      <div className={styles.metricsGrid}>
        <MetricCard
          label={analytics.overview.pagesPerSession.label}
          value={analytics.overview.pagesPerSession.value}
        />
        <MetricCard
          label={analytics.overview.avgSessionDuration.label}
          value={analytics.overview.avgSessionDuration.value}
          unit={analytics.overview.avgSessionDuration.unit}
        />
        <MetricCard
          label={analytics.overview.engagementRate.label}
          value={analytics.overview.engagementRate.value}
          unit={analytics.overview.engagementRate.unit}
        />
        <MetricCard
          label={analytics.overview.newUsers.label}
          value={analytics.overview.newUsers.value}
          change={analytics.overview.newUsers.change}
        />
      </div>
    </div>
  );
}

function SEOTab({ report }: { report: Report }) {
  const { seo } = report;

  return (
    <div className={styles.section}>
      {/* SEO Metrics */}
      <div className={styles.metricsGrid}>
        <MetricCard
          label={seo.overview.totalClicks.label}
          value={seo.overview.totalClicks.value as number}
          status={seo.overview.totalClicks.status}
        />
        <MetricCard
          label={seo.overview.totalImpressions.label}
          value={seo.overview.totalImpressions.value as number}
          status={seo.overview.totalImpressions.status}
        />
        <MetricCard
          label={seo.overview.averageCTR.label}
          value={seo.overview.averageCTR.value as string}
          status={seo.overview.averageCTR.status}
        />
        <MetricCard
          label={seo.overview.averagePosition.label}
          value={seo.overview.averagePosition.value as string}
          status={seo.overview.averagePosition.status}
        />
      </div>

      {/* Indexing Status */}
      <div className={styles.wpCard}>
        <h3 className={styles.wpCardTitle}>Indexing Status</h3>
        <div className={styles.wpInfoGrid}>
          <div className={styles.wpInfoItem}>
            <div className={styles.wpInfoLabel}>Indexed Pages</div>
            <div className={styles.wpInfoValue}>{seo.indexing.indexed}</div>
          </div>
          <div className={styles.wpInfoItem}>
            <div className={styles.wpInfoLabel}>Not Indexed</div>
            <div className={styles.wpInfoValue}>{seo.indexing.notIndexed}</div>
          </div>
          {seo.indexing.reason && (
            <div className={styles.wpInfoItem} style={{ gridColumn: "1 / -1" }}>
              <div className={styles.wpInfoLabel}>Reason</div>
              <div className={styles.wpInfoValue}>{seo.indexing.reason}</div>
            </div>
          )}
        </div>
      </div>

      {/* SEO Issues */}
      {seo.issues.length > 0 && (
        <IssuesList
          issues={seo.issues.map((issue) => ({
            issue: issue.issue,
            severity: issue.severity,
            solution: issue.solution,
          }))}
          title="SEO Issues"
        />
      )}

      {/* Sitemaps */}
      {seo.sitemaps.length > 0 && (
        <div className={styles.wpCard}>
          <h3 className={styles.wpCardTitle}>Sitemaps</h3>
          <table style={{ width: "100%", fontSize: "14px" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e5e5" }}>
                <th style={{ padding: "8px 0" }}>Sitemap</th>
                <th style={{ padding: "8px 0" }}>URLs</th>
                <th style={{ padding: "8px 0" }}>Indexed</th>
              </tr>
            </thead>
            <tbody>
              {seo.sitemaps.map((sitemap, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "8px 0" }}>{sitemap.url}</td>
                  <td style={{ padding: "8px 0" }}>{sitemap.urls}</td>
                  <td style={{ padding: "8px 0" }}>{sitemap.indexed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function WordPressTab({ report }: { report: Report }) {
  const { wordpress } = report;

  return (
    <div className={styles.section}>
      {/* System Info Cards */}
      <div className={styles.wpGrid}>
        {/* Core Info */}
        <div className={styles.wpCard}>
          <h3 className={styles.wpCardTitle}>WordPress Core</h3>
          <div className={styles.wpInfoGrid}>
            <div className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>Version</div>
              <div className={styles.wpInfoValue}>{wordpress.core.version}</div>
            </div>
            <div className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>Update Available</div>
              <div className={styles.wpInfoValue}>
                {wordpress.core.updateAvailable ? "Yes" : "No"}
              </div>
            </div>
            <div className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>Debug Mode</div>
              <div className={styles.wpInfoValue}>
                {wordpress.core.debugMode ? "Enabled" : "Disabled"}
              </div>
            </div>
            <div className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>WP Cron</div>
              <div className={styles.wpInfoValue}>
                {wordpress.core.wpCron ? "Enabled" : "Disabled"}
              </div>
            </div>
          </div>
        </div>

        {/* Server Info */}
        <div className={styles.wpCard}>
          <h3 className={styles.wpCardTitle}>Server Environment</h3>
          <div className={styles.wpInfoGrid}>
            <div className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>Hosting</div>
              <div className={styles.wpInfoValue}>{wordpress.server.hostingProvider}</div>
            </div>
            <div className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>Server</div>
              <div className={styles.wpInfoValue}>{wordpress.server.serverSoftware}</div>
            </div>
            <div className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>PHP Version</div>
              <div className={styles.wpInfoValue}>{wordpress.php.version}</div>
            </div>
            <div className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>Memory Limit</div>
              <div className={styles.wpInfoValue}>{wordpress.php.memoryLimit}</div>
            </div>
          </div>
        </div>

        {/* Database Info */}
        <div className={styles.wpCard}>
          <h3 className={styles.wpCardTitle}>Database</h3>
          <div className={styles.wpInfoGrid}>
            <div className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>Version</div>
              <div className={styles.wpInfoValue}>{wordpress.database.version}</div>
            </div>
            <div className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>Total Size</div>
              <div className={styles.wpInfoValue}>{wordpress.database.totalSize}</div>
            </div>
            <div className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>Tables</div>
              <div className={styles.wpInfoValue}>{wordpress.database.totalTables}</div>
            </div>
            <div className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>Rows</div>
              <div className={styles.wpInfoValue}>
                {wordpress.database.totalRows.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Security Summary */}
        <div className={styles.wpCard}>
          <h3 className={styles.wpCardTitle}>Security</h3>
          <div className={styles.wpInfoGrid}>
            <div className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>SSL</div>
              <div className={styles.wpInfoValue}>
                {wordpress.security.ssl.enabled ? "Enabled" : "Disabled"}
              </div>
            </div>
            <div className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>Users</div>
              <div className={styles.wpInfoValue}>{wordpress.security.users.total}</div>
            </div>
            <div className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>Admins</div>
              <div className={styles.wpInfoValue}>
                {wordpress.security.users.administrators}
              </div>
            </div>
            <div className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>&quot;admin&quot; Username</div>
              <div className={styles.wpInfoValue}>
                {wordpress.security.users.adminUsernameExists ? "Yes" : "No"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plugins */}
      <PluginsTable
        plugins={wordpress.plugins.list}
        title={`Plugins (${wordpress.plugins.active} active, ${wordpress.plugins.updatesAvailable} updates)`}
        updatedThisMonth={wordpress.plugins.updatedThisMonth}
        installedThisMonth={wordpress.plugins.installedThisMonth}
        removedThisMonth={wordpress.plugins.removedThisMonth}
      />

      {/* Caching */}
      <div className={styles.wpCard}>
        <h3 className={styles.wpCardTitle}>Caching</h3>
        <div className={styles.wpInfoGrid}>
          {wordpress.performance.caching.map((cache, i) => (
            <div key={i} className={styles.wpInfoItem}>
              <div className={styles.wpInfoLabel}>{cache.type}</div>
              <div className={styles.wpInfoValue}>
                {cache.enabled ? "Enabled" : "Disabled"}
                {cache.details && ` (${cache.details})`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Checks */}
      {wordpress.security.settings.length > 0 && (
        <IssuesList
          issues={wordpress.security.settings
            .filter((s) => s.status !== "pass")
            .map((setting) => ({
              issue: `${setting.check}: ${setting.value}`,
              severity: setting.status === "fail" ? "critical" : "warning",
              solution: setting.recommendation,
            }))}
          title="Security Checks"
        />
      )}
    </div>
  );
}

function PerformanceTab({ report }: { report: Report }) {
  return (
    <div className={styles.section}>
      <LighthouseScores
        mobile={report.lighthouse?.mobile}
        desktop={report.lighthouse?.desktop}
      />
    </div>
  );
}

function ActionsTab({
  report,
}: {
  report: Report;
  allActionItems: Report["actionItems"]["critical"];
}) {
  const priorityConfig = {
    critical: { label: "Critical", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" },
    high: { label: "High Priority", color: "#f97316", bg: "rgba(249, 115, 22, 0.15)" },
    medium: { label: "Medium Priority", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
    low: { label: "Low Priority", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" },
  };

  const sections: { key: keyof typeof report.actionItems; items: typeof report.actionItems.critical }[] = [
    { key: "critical", items: report.actionItems.critical },
    { key: "high", items: report.actionItems.high },
    { key: "medium", items: report.actionItems.medium },
    { key: "low", items: report.actionItems.low },
  ];

  return (
    <div className={styles.section}>
      <div className={styles.actionItemsGrid}>
        {sections.map(
          ({ key, items }) =>
            items.length > 0 && (
              <div key={key} className={styles.actionPrioritySection}>
                <div className={styles.actionPriorityHeader}>
                  <span
                    className={styles.actionPriorityBadge}
                    style={{
                      backgroundColor: priorityConfig[key].bg,
                      color: priorityConfig[key].color,
                    }}
                  >
                    {items.length}
                  </span>
                  <span className={styles.actionPriorityTitle}>
                    {priorityConfig[key].label}
                  </span>
                </div>
                <div className={styles.actionList}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={styles.actionItem}
                      style={{ borderLeftColor: priorityConfig[key].color }}
                    >
                      <div className={styles.actionText}>
                        <span className={styles.actionTask}>{item.task}</span>
                        <span className={styles.actionDetails}>
                          {item.details}
                        </span>
                        <span
                          className={styles.actionCategory}
                          style={{
                            backgroundColor: priorityConfig[key].bg,
                            color: priorityConfig[key].color,
                          }}
                        >
                          {item.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
