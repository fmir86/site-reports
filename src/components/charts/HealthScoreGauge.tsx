"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import styles from "@/styles/components/Charts.module.scss";

interface HealthScoreGaugeProps {
  overall: number;
  analytics: number;
  seo: number;
  wordpress: number;
  security: number;
  performance: number;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 70) return "Fair";
  if (score >= 60) return "Needs Attention";
  if (score >= 40) return "Poor";
  return "Critical";
}

export default function HealthScoreGauge({
  overall,
  analytics,
  seo,
  wordpress,
  security,
  performance,
}: HealthScoreGaugeProps) {
  const color = getScoreColor(overall);

  const gaugeOption: EChartsOption = {
    series: [
      {
        type: "gauge",
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 10,
        itemStyle: {
          color: color,
        },
        progress: {
          show: true,
          width: 20,
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: color },
                { offset: 1, color: color },
              ],
            },
          },
        },
        pointer: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [[1, "#222222"]],
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        anchor: {
          show: false,
        },
        title: {
          show: false,
        },
        detail: {
          valueAnimation: true,
          width: "60%",
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, "-5%"],
          fontSize: 40,
          fontWeight: "bold",
          formatter: "{value}",
          color: color,
        },
        data: [{ value: overall }],
      },
    ],
  };

  const categories = [
    { label: "Analytics", value: analytics },
    { label: "SEO", value: seo },
    { label: "WordPress", value: wordpress },
    { label: "Security", value: security },
    { label: "Performance", value: performance },
  ];

  const radarOption: EChartsOption = {
    radar: {
      indicator: categories.map((c) => ({ name: c.label, max: 100 })),
      shape: "polygon",
      splitNumber: 4,
      axisName: {
        color: "#888888",
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: "#333333",
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ["rgba(0, 112, 243, 0.02)", "rgba(0, 112, 243, 0.05)"],
        },
      },
      axisLine: {
        lineStyle: {
          color: "#333333",
        },
      },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: categories.map((c) => c.value),
            name: "Health Score",
            areaStyle: {
              color: "rgba(0, 112, 243, 0.2)",
            },
            lineStyle: {
              color: "#0070f3",
              width: 2,
            },
            itemStyle: {
              color: "#0070f3",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Site Health Score</h3>
        <span
          className={`${styles.statusBadge}`}
          style={{
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          {getScoreLabel(overall)}
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        <div>
          <ReactECharts option={gaugeOption} style={{ height: 200 }} />
        </div>
        <div>
          <ReactECharts option={radarOption} style={{ height: 200 }} />
        </div>
      </div>
      <div className={styles.legendWrapper}>
        {categories.map((cat) => (
          <div key={cat.label} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: getScoreColor(cat.value) }}
            />
            <span className={styles.legendLabel}>{cat.label}</span>
            <span
              className={styles.legendValue}
              style={{ color: getScoreColor(cat.value) }}
            >
              {cat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
