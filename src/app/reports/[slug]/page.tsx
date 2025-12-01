import Link from "next/link";
import { notFound } from "next/navigation";
import { getReportBySlug, getJsonReportBySlug, getAllReports } from "@/lib/reports";
import MarkdownContent from "@/components/MarkdownContent";
import ReportDashboard from "@/components/ReportDashboard";
import HealthScoreCircle from "@/components/HealthScoreCircle";
import styles from "@/styles/pages/Report.module.scss";

interface ReportPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const reports = await getAllReports();
  return reports.map((report) => ({
    slug: report.slug,
  }));
}

export async function generateMetadata({ params }: ReportPageProps) {
  const { slug } = await params;
  const report = await getReportBySlug(slug);

  if (!report) {
    return { title: "Report Not Found" };
  }

  return {
    title: `${report.siteName} - ${report.period} | WP Site Reports`,
    description: `Monthly maintenance report for ${report.siteName}`,
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { slug } = await params;
  const report = await getReportBySlug(slug);

  if (!report) {
    notFound();
  }

  // Check if this is a JSON report
  const jsonReport = report.isJson ? await getJsonReportBySlug(slug) : null;

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
              <Link
                href={`/sites/${report.siteSlug}`}
                className={styles.breadcrumbLink}
              >
                {report.siteName}
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>{report.period}</span>
            </nav>
            <div className={styles.healthScoreHeader}>
              <h1 className={styles.headerTitle}>
                {report.period} Report
              </h1>
              <HealthScoreCircle
                score={report.healthScore.overall}
                showLabel
              />
            </div>
            <p className={styles.headerMeta}>
              Generated {report.generatedAt} by {report.author}
            </p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {jsonReport ? (
          <ReportDashboard report={jsonReport} />
        ) : (
          <article className={styles.reportContent}>
            <MarkdownContent content={report.content} />
          </article>
        )}
      </main>
    </div>
  );
}
