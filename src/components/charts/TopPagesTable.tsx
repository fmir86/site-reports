"use client";

import styles from "@/styles/components/Charts.module.scss";

interface PageData {
  path: string;
  title?: string;
  views: number;
  avgTimeOnPage: number;
  bounceRate?: number;
}

interface TopPagesTableProps {
  data: PageData[];
  title?: string;
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export default function TopPagesTable({
  data,
  title = "Top Pages",
}: TopPagesTableProps) {
  const maxViews = Math.max(...data.map((p) => p.views));

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>{title}</h3>
      </div>
      <div className={styles.chartContainer}>
        <table className={styles.dataTable}>
          <thead className={styles.dataTableHead}>
            <tr>
              <th className={styles.dataTableHeadCell}>Page</th>
              <th className={styles.dataTableHeadCell} style={{ width: "100px" }}>
                Views
              </th>
              <th className={styles.dataTableHeadCell} style={{ width: "120px" }}>
                Avg. Time
              </th>
            </tr>
          </thead>
          <tbody className={styles.dataTableBody}>
            {data.map((page) => (
              <tr key={page.path} className={styles.dataTableRow}>
                <td className={styles.dataTableCell}>
                  <div className={styles.dataTableCellBold}>
                    {page.title || page.path}
                  </div>
                  <div style={{ fontSize: "12px", color: "#737373" }}>
                    {page.path}
                  </div>
                </td>
                <td className={styles.dataTableCell}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className={styles.dataTableCellBold}>
                      {page.views.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.progressBar} style={{ marginTop: "4px" }}>
                    <div
                      className={`${styles.progressFill} ${styles.progressBlue}`}
                      style={{ width: `${(page.views / maxViews) * 100}%` }}
                    />
                  </div>
                </td>
                <td className={styles.dataTableCell}>
                  {formatTime(page.avgTimeOnPage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
