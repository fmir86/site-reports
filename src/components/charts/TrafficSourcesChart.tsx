"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import styles from "@/styles/components/Charts.module.scss";

interface TrafficSource {
  channel: string;
  users: number;
  sessions: number;
  percentage: number;
}

interface TrafficSourcesChartProps {
  data: TrafficSource[];
  title?: string;
}

export default function TrafficSourcesChart({
  data,
  title = "Traffic Sources",
}: TrafficSourcesChartProps) {
  const sortedData = [...data].sort((a, b) => b.users - a.users);

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: unknown) => {
        const p = params as { name: string; value: number }[];
        return `${p[0].name}: ${p[0].value.toLocaleString()} users`;
      },
    },
    grid: {
      left: "3%",
      right: "8%",
      bottom: "3%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: {
          color: "#222222",
          type: "dashed",
        },
      },
      axisLabel: {
        color: "#888888",
        fontSize: 11,
      },
    },
    yAxis: {
      type: "category",
      data: sortedData.map((d) => d.channel),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#888888",
        fontSize: 12,
      },
    },
    series: [
      {
        name: "Users",
        type: "bar",
        barWidth: "60%",
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: "#0070f3" },
              { offset: 1, color: "#3291ff" },
            ],
          },
        },
        data: sortedData.map((d) => d.users),
      },
    ],
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>{title}</h3>
      </div>
      <div className={styles.chartContainer}>
        <ReactECharts option={option} style={{ height: 220 }} />
      </div>
    </div>
  );
}
