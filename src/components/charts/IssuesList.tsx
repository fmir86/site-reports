"use client";

import styles from "@/styles/components/Charts.module.scss";

interface Issue {
  issue: string;
  severity: "critical" | "warning" | "info";
  category?: string;
  solution?: string;
}

interface IssuesListProps {
  issues: Issue[];
  title?: string;
}

const severityStyles: Record<string, string> = {
  critical: styles.statusCritical,
  warning: styles.statusWarning,
  info: styles.statusNeutral,
};

const severityLabels: Record<string, string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
};

export default function IssuesList({
  issues,
  title = "Issues",
}: IssuesListProps) {
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>{title}</h3>
        <span className={styles.chartSubtitle}>
          {issues.length} {issues.length === 1 ? "issue" : "issues"}
        </span>
      </div>
      <div className={styles.chartContainer}>
        <table className={styles.dataTable}>
          <thead className={styles.dataTableHead}>
            <tr>
              <th className={styles.dataTableHeadCell}>#</th>
              <th className={styles.dataTableHeadCell}>Issue</th>
              <th className={styles.dataTableHeadCell}>Severity</th>
              {issues.some((i) => i.category) && (
                <th className={styles.dataTableHeadCell}>Category</th>
              )}
            </tr>
          </thead>
          <tbody className={styles.dataTableBody}>
            {issues.map((issue, index) => (
              <tr key={index} className={styles.dataTableRow}>
                <td className={styles.dataTableCell}>{index + 1}</td>
                <td className={`${styles.dataTableCell} ${styles.dataTableCellBold}`}>
                  <div>{issue.issue}</div>
                  {issue.solution && (
                    <div style={{ fontSize: "12px", color: "#737373", marginTop: "4px" }}>
                      {issue.solution}
                    </div>
                  )}
                </td>
                <td className={styles.dataTableCell}>
                  <span
                    className={`${styles.statusBadge} ${
                      severityStyles[issue.severity]
                    }`}
                  >
                    {severityLabels[issue.severity]}
                  </span>
                </td>
                {issues.some((i) => i.category) && (
                  <td className={styles.dataTableCell}>{issue.category || "-"}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
