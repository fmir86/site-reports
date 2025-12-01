import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSiteBySlug,
  getReportsBySiteSlug,
  getAllSites,
} from "@/lib/reports";
import HealthScoreCircle from "@/components/HealthScoreCircle";
import styles from "@/styles/pages/SiteDetail.module.scss";

interface SitePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const sites = await getAllSites();
  return sites.map((site) => ({
    slug: site.slug,
  }));
}

export async function generateMetadata({ params }: SitePageProps) {
  const { slug } = await params;
  const site = await getSiteBySlug(slug);

  if (!site) {
    return { title: "Site Not Found" };
  }

  return {
    title: `${site.name} Reports | WP Site Reports`,
    description: `Monthly maintenance reports for ${site.name}`,
  };
}

export default async function SitePage({ params }: SitePageProps) {
  const { slug } = await params;
  const site = await getSiteBySlug(slug);

  if (!site) {
    notFound();
  }

  const reports = await getReportsBySiteSlug(slug);
  const latestReport = reports[0];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <nav className={styles.breadcrumb}>
              <Link href="/" className={styles.breadcrumbLink}>
                Sites
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>{site.name}</span>
            </nav>
            <h1 className={styles.headerTitle}>{site.name}</h1>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Site Info Card */}
        <div className={styles.siteCard}>
          <div className={styles.siteCardHeader}>
            <div className={styles.siteIcon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div className={styles.siteMainInfo}>
              <h2 className={styles.siteName}>{site.name}</h2>
              {site.url && (
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.siteUrl}
                >
                  {site.url}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          <div className={styles.siteStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Reports</span>
              <span className={styles.statValue}>{reports.length}</span>
            </div>
            <div className={styles.statDivider} />
            {latestReport && (
              <>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Latest Report</span>
                  <span className={styles.statValue}>{latestReport.period}</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Current Health</span>
                  <HealthScoreCircle
                    score={latestReport.healthScore.overall}
                    size="small"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reports Section */}
        <div className={styles.reportsSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Maintenance Reports</h3>
          </div>

          {reports.length === 0 ? (
            <div className={styles.emptyState}>
              <svg
                className={styles.emptyIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className={styles.emptyTitle}>No reports yet</h3>
              <p className={styles.emptyDescription}>
                Reports for this site will appear here once they are published.
              </p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.tableHeadCell}>Period</th>
                    <th className={styles.tableHeadCell}>Generated</th>
                    <th className={styles.tableHeadCell}>Author</th>
                    <th className={styles.tableHeadCell}>Health Score</th>
                    <th className={styles.tableHeadCell}>Action</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {reports.map((report) => (
                    <tr key={report.slug} className={styles.tableRow}>
                      <td className={styles.tableCell}>
                        <div className={styles.reportPeriod}>{report.period}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.reportDate}>
                          {report.generatedAt}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={styles.authorName}>{report.author}</span>
                      </td>
                      <td className={styles.tableCell}>
                        <HealthScoreCircle
                          score={report.healthScore.overall}
                          size="small"
                        />
                      </td>
                      <td className={styles.tableCell}>
                        <Link
                          href={`/reports/${report.slug}`}
                          className={styles.viewLink}
                        >
                          View Report
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
