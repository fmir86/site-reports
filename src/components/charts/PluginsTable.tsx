"use client";

import styles from "@/styles/components/Charts.module.scss";

interface PluginInfo {
  name: string;
  slug: string;
  version: string;
  author: string;
  active: boolean;
  updateAvailable: boolean;
  latestVersion?: string;
  autoUpdate: boolean;
}

interface PluginsTableProps {
  plugins: PluginInfo[];
  title?: string;
  showOnlyUpdates?: boolean;
}

export default function PluginsTable({
  plugins,
  title = "Plugins",
  showOnlyUpdates = false,
}: PluginsTableProps) {
  const displayPlugins = showOnlyUpdates
    ? plugins.filter((p) => p.updateAvailable)
    : plugins;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>{title}</h3>
        <span className={styles.chartSubtitle}>
          {displayPlugins.length} {displayPlugins.length === 1 ? "plugin" : "plugins"}
        </span>
      </div>
      <div className={styles.chartContainer} style={{ maxHeight: 400, overflow: "auto" }}>
        <table className={styles.dataTable}>
          <thead className={styles.dataTableHead}>
            <tr>
              <th className={styles.dataTableHeadCell}>Plugin</th>
              <th className={styles.dataTableHeadCell}>Current</th>
              <th className={styles.dataTableHeadCell}>Latest</th>
              <th className={styles.dataTableHeadCell}>Status</th>
            </tr>
          </thead>
          <tbody className={styles.dataTableBody}>
            {displayPlugins.map((plugin) => (
              <tr key={plugin.slug} className={styles.dataTableRow}>
                <td className={styles.dataTableCell}>
                  <div className={styles.dataTableCellBold}>{plugin.name}</div>
                  <div style={{ fontSize: "12px", color: "#737373" }}>
                    by {plugin.author}
                  </div>
                </td>
                <td className={styles.dataTableCell}>{plugin.version}</td>
                <td className={styles.dataTableCell}>
                  {plugin.updateAvailable ? (
                    <span style={{ color: "#f59e0b", fontWeight: 500 }}>
                      {plugin.latestVersion}
                    </span>
                  ) : (
                    <span style={{ color: "#10b981" }}>Up to date</span>
                  )}
                </td>
                <td className={styles.dataTableCell}>
                  <span
                    className={`${styles.statusBadge} ${
                      plugin.active ? styles.statusGood : styles.statusNeutral
                    }`}
                  >
                    {plugin.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
