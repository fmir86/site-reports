import Link from "next/link";
import { getAllSites } from "@/lib/reports";
import LogoutButton from "@/components/LogoutButton";
import HealthScoreCircle from "@/components/HealthScoreCircle";
import styles from "@/styles/pages/Sites.module.scss";

export default async function HomePage() {
  const sites = await getAllSites();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>WP Site Reports</h1>
          <LogoutButton />
        </div>
      </header>

      <main className={styles.main}>
        <h2 className={styles.pageTitle}>Your Sites</h2>
        <p className={styles.pageDescription}>
          Select a site to view its maintenance reports
        </p>

        {sites.length === 0 ? (
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
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            <h3 className={styles.emptyTitle}>No sites yet</h3>
            <p className={styles.emptyDescription}>
              Sites will appear here once reports are published.
            </p>
          </div>
        ) : (
          <div className={styles.sitesGrid}>
            {sites.map((site) => (
              <Link
                key={site.slug}
                href={`/sites/${site.slug}`}
                className={styles.siteLink}
              >
                <article className={styles.siteCard}>
                  {/* Header with icon and health score */}
                  <div className={styles.cardHeader}>
                    <div className={styles.siteIcon}>
                      <svg
                        width="20"
                        height="20"
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
                    <div className={styles.siteInfo}>
                      <h3 className={styles.siteName}>{site.name}</h3>
                      {site.url && (
                        <p className={styles.siteUrl}>{site.url}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className={styles.statsRow}>
                    <div className={styles.statGroup}>
                      <div className={styles.statItem}>
                        <span className={styles.statValue}>
                          {site.reportsCount}
                        </span>
                        <span className={styles.statLabel}>
                          {site.reportsCount === 1 ? "Report" : "Reports"}
                        </span>
                      </div>
                      {site.latestReport && (
                        <div className={styles.statItem}>
                          <span className={styles.statValue}>
                            {site.latestReport.period}
                          </span>
                          <span className={styles.statLabel}>Latest</span>
                        </div>
                      )}
                    </div>
                    {site.latestReport && (
                      <div className={styles.healthScore}>
                        <HealthScoreCircle
                          score={site.latestReport.healthScore.overall}
                          size="small"
                        />
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className={styles.cardFooter}>
                    <span className={styles.lastUpdated}>
                      Updated {site.latestReport?.generatedAt}
                    </span>
                    <span className={styles.viewDetails}>
                      View details
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
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
