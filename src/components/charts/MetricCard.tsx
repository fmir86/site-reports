"use client";

import styles from "@/styles/components/Charts.module.scss";

interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  change?: number;
  previousValue?: number;
  inverseChange?: boolean;
  status?: "good" | "warning" | "critical" | "neutral";
}

export default function MetricCard({
  label,
  value,
  unit,
  change,
  inverseChange,
  status,
}: MetricCardProps) {
  const formattedValue =
    typeof value === "number"
      ? value.toLocaleString()
      : value;

  const getChangeClass = () => {
    if (change === undefined) return "";
    const isPositive = inverseChange ? change < 0 : change > 0;
    const isNegative = inverseChange ? change > 0 : change < 0;
    if (isPositive) return styles.metricChangePositive;
    if (isNegative) return styles.metricChangeNegative;
    return styles.metricChangeNeutral;
  };

  const getStatusClass = () => {
    if (!status) return "";
    switch (status) {
      case "good": return styles.metricStatusGood;
      case "warning": return styles.metricStatusWarning;
      case "critical": return styles.metricStatusCritical;
      default: return "";
    }
  };

  const changeClass = getChangeClass();
  const statusClass = getStatusClass();

  return (
    <div className={`${styles.metricCard} ${statusClass}`}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>
        {formattedValue}
        {unit && <span className={styles.metricLabel}> {unit}</span>}
      </p>
      {change !== undefined && (
        <p className={`${styles.metricChange} ${changeClass}`}>
          {change > 0 ? "+" : ""}
          {change}%
        </p>
      )}
    </div>
  );
}
