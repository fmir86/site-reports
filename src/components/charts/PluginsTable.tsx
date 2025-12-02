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
  licenseIssue?: boolean;
  blockedReason?: string;
}

interface PluginUpdate {
  name: string;
  from: string;
  to: string;
}

interface PluginChange {
  name: string;
  reason?: string;
  version?: string;
}

interface PluginsTableProps {
  plugins: PluginInfo[];
  title?: string;
  showOnlyUpdates?: boolean;
  updatedThisMonth?: PluginUpdate[];
  installedThisMonth?: PluginChange[];
  removedThisMonth?: PluginChange[];
}

export default function PluginsTable({
  plugins,
  title = "Plugins",
  showOnlyUpdates = false,
  updatedThisMonth = [],
  installedThisMonth = [],
  removedThisMonth = [],
}: PluginsTableProps) {
  const displayPlugins = showOnlyUpdates
    ? plugins.filter((p) => p.updateAvailable)
    : plugins;

  // Plugins with blocked updates (license issues)
  const blockedUpdates = plugins.filter((p) => p.updateAvailable && p.licenseIssue);

  return (
    <div className={styles.pluginsSection}>
      {/* Main Plugins List */}
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
                        {plugin.licenseIssue && (
                          <span style={{ display: "block", fontSize: "11px", color: "#ef4444" }}>
                            License issue
                          </span>
                        )}
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

      {/* Blocked Updates (License Issues) */}
      {blockedUpdates.length > 0 && (
        <div className={styles.chartCard} style={{ borderColor: "rgba(239, 68, 68, 0.3)" }}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>
              <span style={{ color: "#ef4444" }}>⚠</span> Blocked Updates
            </h3>
            <span className={styles.chartSubtitle}>
              {blockedUpdates.length} {blockedUpdates.length === 1 ? "plugin requires" : "plugins require"} attention
            </span>
          </div>
          <div className={styles.chartContainer}>
            <table className={styles.dataTable}>
              <thead className={styles.dataTableHead}>
                <tr>
                  <th className={styles.dataTableHeadCell}>Plugin</th>
                  <th className={styles.dataTableHeadCell}>Current</th>
                  <th className={styles.dataTableHeadCell}>Available</th>
                  <th className={styles.dataTableHeadCell}>Reason</th>
                </tr>
              </thead>
              <tbody className={styles.dataTableBody}>
                {blockedUpdates.map((plugin) => (
                  <tr key={`blocked-${plugin.slug}`} className={styles.dataTableRow}>
                    <td className={`${styles.dataTableCell} ${styles.dataTableCellBold}`}>
                      {plugin.name}
                    </td>
                    <td className={styles.dataTableCell}>{plugin.version}</td>
                    <td className={styles.dataTableCell}>
                      <span style={{ color: "#f59e0b", fontWeight: 500 }}>
                        {plugin.latestVersion}
                      </span>
                    </td>
                    <td className={styles.dataTableCell}>
                      <span style={{ color: "#ef4444", fontSize: "12px" }}>
                        {plugin.blockedReason || "License or subscription required"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Updates This Month */}
      {updatedThisMonth.length > 0 && (
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Updated This Month</h3>
            <span className={styles.chartSubtitle}>
              {updatedThisMonth.length} {updatedThisMonth.length === 1 ? "plugin" : "plugins"}
            </span>
          </div>
          <div className={styles.chartContainer}>
            <table className={styles.dataTable}>
              <thead className={styles.dataTableHead}>
                <tr>
                  <th className={styles.dataTableHeadCell}>Plugin</th>
                  <th className={styles.dataTableHeadCell}>Previous Version</th>
                  <th className={styles.dataTableHeadCell}>New Version</th>
                </tr>
              </thead>
              <tbody className={styles.dataTableBody}>
                {updatedThisMonth.map((plugin, index) => (
                  <tr key={`${plugin.name}-${index}`} className={styles.dataTableRow}>
                    <td className={`${styles.dataTableCell} ${styles.dataTableCellBold}`}>
                      {plugin.name}
                    </td>
                    <td className={styles.dataTableCell}>
                      <span style={{ color: "#888888" }}>{plugin.from}</span>
                    </td>
                    <td className={styles.dataTableCell}>
                      <span style={{ color: "#10b981", fontWeight: 500 }}>
                        {plugin.to}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Installed & Removed This Month - Side by Side */}
      {(installedThisMonth.length > 0 || removedThisMonth.length > 0) && (
        <div className={styles.pluginChangesGrid}>
          {/* Installed This Month */}
          {installedThisMonth.length > 0 && (
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>
                  <span style={{ color: "#10b981" }}>+</span> Installed
                </h3>
                <span className={styles.chartSubtitle}>
                  {installedThisMonth.length} new
                </span>
              </div>
              <div className={styles.chartContainer}>
                <ul className={styles.pluginChangeList}>
                  {installedThisMonth.map((plugin, index) => (
                    <li key={`installed-${index}`} className={styles.pluginChangeItem}>
                      <span className={styles.pluginChangeName}>{plugin.name}</span>
                      {plugin.version && (
                        <span className={styles.pluginChangeVersion}>v{plugin.version}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Removed This Month */}
          {removedThisMonth.length > 0 && (
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>
                  <span style={{ color: "#ef4444" }}>−</span> Removed
                </h3>
                <span className={styles.chartSubtitle}>
                  {removedThisMonth.length} removed
                </span>
              </div>
              <div className={styles.chartContainer}>
                <ul className={styles.pluginChangeList}>
                  {removedThisMonth.map((plugin, index) => (
                    <li key={`removed-${index}`} className={styles.pluginChangeItem}>
                      <span className={styles.pluginChangeName}>{plugin.name}</span>
                      {plugin.reason && (
                        <span className={styles.pluginChangeReason}>{plugin.reason}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
