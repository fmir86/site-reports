"use client";

import { useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { LighthouseData } from "@/types/report";
import styles from "@/styles/components/Charts.module.scss";

interface LighthouseScoresProps {
  mobile?: LighthouseData;
  desktop?: LighthouseData;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "#0cce6b"; // Green
  if (score >= 50) return "#ffa400"; // Orange
  return "#ff4e42"; // Red
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const option: EChartsOption = {
    series: [
      {
        type: "gauge",
        startAngle: 90,
        endAngle: -270,
        min: 0,
        max: 100,
        splitNumber: 10,
        radius: "100%",
        center: ["50%", "50%"],
        pointer: { show: false },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: {
            color: getScoreColor(score),
          },
        },
        axisLine: {
          lineStyle: {
            width: 8,
            color: [[1, "#222222"]],
          },
        },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        detail: {
          fontSize: 24,
          fontWeight: "bold",
          color: "#ededed",
          offsetCenter: [0, 0],
          formatter: "{value}",
        },
        data: [{ value: score }],
      },
    ],
  };

  return (
    <div className={styles.lighthouseGauge}>
      <ReactECharts
        option={option}
        style={{ height: 100, width: 100 }}
        opts={{ renderer: "svg" }}
      />
      <span className={styles.lighthouseLabel}>{label}</span>
    </div>
  );
}

function CoreWebVitalsTable({ data }: { data: LighthouseData }) {
  const vitals = [
    { label: "First Contentful Paint", value: data.coreWebVitals.fcp, key: "fcp" },
    { label: "Largest Contentful Paint", value: data.coreWebVitals.lcp, key: "lcp" },
    { label: "Cumulative Layout Shift", value: data.coreWebVitals.cls, key: "cls" },
    { label: "Total Blocking Time", value: data.coreWebVitals.tbt, key: "tbt" },
    { label: "Speed Index", value: data.coreWebVitals.si, key: "si" },
  ].filter((v) => v.value);

  return (
    <div className={styles.webVitalsTable}>
      {vitals.map((vital) => (
        <div key={vital.key} className={styles.webVitalRow}>
          <span className={styles.webVitalLabel}>{vital.label}</span>
          <span className={styles.webVitalValue}>{vital.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function LighthouseScores({
  mobile,
  desktop,
}: LighthouseScoresProps) {
  // Default to mobile if available, otherwise desktop
  const [activeStrategy, setActiveStrategy] = useState<"mobile" | "desktop">(
    mobile ? "mobile" : "desktop"
  );

  const data = activeStrategy === "mobile" ? mobile : desktop;

  if (!mobile && !desktop) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Lighthouse Scores</h3>
        </div>
        <div className={styles.emptyState}>
          <p>No Lighthouse data available</p>
        </div>
      </div>
    );
  }

  // If current strategy data doesn't exist, switch to the other
  const currentData = data || (activeStrategy === "mobile" ? desktop : mobile);

  if (!currentData) {
    return null;
  }

  return (
    <div className={styles.lighthouseContainer}>
      {/* Scores Card */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Lighthouse Scores</h3>
          <div className={styles.strategyTabs}>
            <button
              className={`${styles.strategyTab} ${activeStrategy === "mobile" ? styles.strategyTabActive : ""} ${!mobile ? styles.strategyTabDisabled : ""}`}
              onClick={() => mobile && setActiveStrategy("mobile")}
              disabled={!mobile}
              title={mobile ? "View Mobile scores" : "Mobile data not available"}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              Mobile
            </button>
            <button
              className={`${styles.strategyTab} ${activeStrategy === "desktop" ? styles.strategyTabActive : ""} ${!desktop ? styles.strategyTabDisabled : ""}`}
              onClick={() => desktop && setActiveStrategy("desktop")}
              disabled={!desktop}
              title={desktop ? "View Desktop scores" : "Desktop data not available"}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Desktop
            </button>
          </div>
        </div>
        <div className={styles.lighthouseScoresGrid}>
          <ScoreGauge score={currentData.scores.performance} label="Performance" />
          <ScoreGauge score={currentData.scores.accessibility} label="Accessibility" />
          <ScoreGauge score={currentData.scores.bestPractices} label="Best Practices" />
          <ScoreGauge score={currentData.scores.seo} label="SEO" />
        </div>
        <div className={styles.lighthouseLegend}>
          <span className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: "#0cce6b" }}
            />
            90-100 Good
          </span>
          <span className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: "#ffa400" }}
            />
            50-89 Needs Work
          </span>
          <span className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: "#ff4e42" }}
            />
            0-49 Poor
          </span>
        </div>
      </div>

      {/* Core Web Vitals Card */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Core Web Vitals</h3>
          <span className={styles.chartSubtitle}>
            {currentData.strategy === "mobile" ? "Mobile" : "Desktop"}
          </span>
        </div>
        <CoreWebVitalsTable data={currentData} />
        <div className={styles.fetchTime}>
          Tested on {currentData.fetchTime}
        </div>
      </div>
    </div>
  );
}
