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

type ConsolidatedPlugin = {
  name: string;
  author?: string;
  slug?: string;
  currentVersion: string;
  previousVersion?: string;
  status: "installed" | "updated" | "unchanged" | "removed" | "pending";
  isActive?: boolean;
  reason?: string;
  licenseIssue?: boolean;
  blockedReason?: string;
  latestVersion?: string;
};

export default function PluginsTable({
  plugins,
  title = "Plugins",
  updatedThisMonth = [],
  installedThisMonth = [],
  removedThisMonth = [],
}: PluginsTableProps) {
  // Build consolidated list
  const consolidatedPlugins: ConsolidatedPlugin[] = [];

  // Create a map of updated plugins by name for quick lookup
  const updatedMap = new Map(updatedThisMonth.map((p) => [p.name, p]));
  const installedNames = new Set(installedThisMonth.map((p) => p.name));

  // 1. Add installed plugins (new this month)
  installedThisMonth.forEach((plugin) => {
    // Find current info if available
    const currentInfo = plugins.find(
      (p) => p.name === plugin.name || p.slug === plugin.name
    );
    consolidatedPlugins.push({
      name: plugin.name,
      author: currentInfo?.author,
      slug: currentInfo?.slug,
      currentVersion: plugin.version || currentInfo?.version || "—",
      status: "installed",
      isActive: currentInfo?.active,
    });
  });

  // 2. Add updated plugins
  updatedThisMonth.forEach((plugin) => {
    // Skip if already added as installed
    if (installedNames.has(plugin.name)) return;

    const currentInfo = plugins.find(
      (p) => p.name === plugin.name || p.slug === plugin.name
    );
    consolidatedPlugins.push({
      name: plugin.name,
      author: currentInfo?.author,
      slug: currentInfo?.slug,
      currentVersion: plugin.to,
      previousVersion: plugin.from,
      status: "updated",
      isActive: currentInfo?.active,
    });
  });

  // 3. Add plugins with pending updates (license issues)
  plugins
    .filter((p) => p.updateAvailable && p.licenseIssue)
    .forEach((plugin) => {
      // Skip if already added
      if (
        consolidatedPlugins.some(
          (cp) => cp.name === plugin.name || cp.slug === plugin.slug
        )
      )
        return;

      consolidatedPlugins.push({
        name: plugin.name,
        author: plugin.author,
        slug: plugin.slug,
        currentVersion: plugin.version,
        latestVersion: plugin.latestVersion,
        status: "pending",
        isActive: plugin.active,
        licenseIssue: plugin.licenseIssue,
        blockedReason: plugin.blockedReason,
      });
    });

  // 4. Add unchanged plugins (not in updated, installed, or pending)
  plugins.forEach((plugin) => {
    const wasUpdated = updatedMap.has(plugin.name);
    const wasInstalled = installedNames.has(plugin.name);
    const isPending = plugin.updateAvailable && plugin.licenseIssue;

    if (!wasUpdated && !wasInstalled && !isPending) {
      consolidatedPlugins.push({
        name: plugin.name,
        author: plugin.author,
        slug: plugin.slug,
        currentVersion: plugin.version,
        status: "unchanged",
        isActive: plugin.active,
      });
    }
  });

  // 5. Add removed plugins
  removedThisMonth.forEach((plugin) => {
    consolidatedPlugins.push({
      name: plugin.name,
      currentVersion: plugin.version || "—",
      status: "removed",
      reason: plugin.reason,
    });
  });

  // Calculate counts
  const installedCount = consolidatedPlugins.filter(
    (p) => p.status === "installed"
  ).length;
  const updatedCount = consolidatedPlugins.filter(
    (p) => p.status === "updated"
  ).length;
  const unchangedCount = consolidatedPlugins.filter(
    (p) => p.status === "unchanged"
  ).length;
  const removedCount = consolidatedPlugins.filter(
    (p) => p.status === "removed"
  ).length;
  const pendingCount = consolidatedPlugins.filter(
    (p) => p.status === "pending"
  ).length;

  // Build subtitle
  const subtitleParts: string[] = [];
  if (installedCount > 0) subtitleParts.push(`${installedCount} new`);
  if (updatedCount > 0) subtitleParts.push(`${updatedCount} updated`);
  if (pendingCount > 0) subtitleParts.push(`${pendingCount} pending`);
  if (removedCount > 0) subtitleParts.push(`${removedCount} removed`);
  if (unchangedCount > 0) subtitleParts.push(`${unchangedCount} unchanged`);

  const getStatusBadge = (plugin: ConsolidatedPlugin) => {
    switch (plugin.status) {
      case "installed":
        return (
          <span
            className={styles.statusBadge}
            style={{ backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#10b981" }}
          >
            New
          </span>
        );
      case "updated":
        return (
          <span
            className={styles.statusBadge}
            style={{ backgroundColor: "rgba(59, 130, 246, 0.2)", color: "#3b82f6" }}
          >
            Updated
          </span>
        );
      case "pending":
        return (
          <span
            className={styles.statusBadge}
            style={{ backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#f59e0b" }}
          >
            Pending
          </span>
        );
      case "removed":
        return (
          <span
            className={styles.statusBadge}
            style={{ backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#ef4444" }}
          >
            Removed
          </span>
        );
      default:
        return (
          <span className={`${styles.statusBadge} ${styles.statusNeutral}`}>
            No changes
          </span>
        );
    }
  };

  const getVersionDisplay = (plugin: ConsolidatedPlugin) => {
    if (plugin.status === "updated" && plugin.previousVersion) {
      return (
        <span>
          <span style={{ color: "#666666", textDecoration: "line-through" }}>
            {plugin.previousVersion}
          </span>
          <span style={{ color: "#666666", margin: "0 4px" }}>→</span>
          <span style={{ color: "#10b981", fontWeight: 500 }}>
            {plugin.currentVersion}
          </span>
        </span>
      );
    }

    if (plugin.status === "pending" && plugin.latestVersion) {
      return (
        <span>
          <span>{plugin.currentVersion}</span>
          <span style={{ color: "#666666", margin: "0 4px" }}>→</span>
          <span style={{ color: "#f59e0b", fontWeight: 500 }}>
            {plugin.latestVersion}
          </span>
        </span>
      );
    }

    if (plugin.status === "removed") {
      return (
        <span style={{ color: "#666666" }}>
          {plugin.currentVersion}
        </span>
      );
    }

    return <span>{plugin.currentVersion}</span>;
  };

  return (
    <div className={styles.pluginsSection}>
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>{title}</h3>
          <span className={styles.chartSubtitle}>
            {subtitleParts.join(" · ")}
          </span>
        </div>
        <div
          className={styles.chartContainer}
          style={{ maxHeight: 500, overflow: "auto" }}
        >
          <table className={styles.dataTable}>
            <thead className={styles.dataTableHead}>
              <tr>
                <th className={styles.dataTableHeadCell}>Plugin</th>
                <th className={styles.dataTableHeadCell}>Version</th>
                <th className={styles.dataTableHeadCell}>Status</th>
                <th className={styles.dataTableHeadCell}>Notes</th>
              </tr>
            </thead>
            <tbody className={styles.dataTableBody}>
              {consolidatedPlugins.map((plugin, index) => (
                <tr
                  key={`${plugin.slug || plugin.name}-${index}`}
                  className={styles.dataTableRow}
                  style={{
                    opacity: plugin.status === "removed" ? 0.6 : 1,
                  }}
                >
                  <td className={styles.dataTableCell}>
                    <div
                      className={styles.dataTableCellBold}
                      style={{
                        textDecoration:
                          plugin.status === "removed" ? "line-through" : "none",
                      }}
                    >
                      {plugin.name}
                    </div>
                    {plugin.author && (
                      <div style={{ fontSize: "12px", color: "#737373" }}>
                        by {plugin.author}
                      </div>
                    )}
                  </td>
                  <td
                    className={styles.dataTableCell}
                    style={{ fontFamily: "monospace", fontSize: "13px" }}
                  >
                    {getVersionDisplay(plugin)}
                  </td>
                  <td className={styles.dataTableCell}>
                    {getStatusBadge(plugin)}
                  </td>
                  <td className={styles.dataTableCell}>
                    {plugin.status === "pending" && (
                      <span style={{ color: "#f59e0b", fontSize: "12px" }}>
                        {plugin.blockedReason || "Manual update required"}
                      </span>
                    )}
                    {plugin.status === "removed" && plugin.reason && (
                      <span style={{ color: "#888888", fontSize: "12px", fontStyle: "italic" }}>
                        {plugin.reason}
                      </span>
                    )}
                    {plugin.status === "unchanged" && plugin.isActive === false && (
                      <span style={{ color: "#666666", fontSize: "12px" }}>
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
