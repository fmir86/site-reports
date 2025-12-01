"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import styles from "@/styles/components/Charts.module.scss";

interface DailyData {
  date: string;
  users: number;
  sessions: number;
  pageViews: number;
}

interface TrafficChartProps {
  data: DailyData[];
  title?: string;
}

export default function TrafficChart({
  data,
  title = "Daily Traffic",
}: TrafficChartProps) {
  const dates = data.map((item) =>
    new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  );

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
    },
    legend: {
      data: ["Users", "Sessions", "Page Views"],
      bottom: 0,
      textStyle: {
        color: "#888888",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: dates,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#888888",
        fontSize: 11,
      },
    },
    yAxis: {
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
    series: [
      {
        name: "Users",
        type: "line",
        smooth: true,
        lineStyle: { width: 2, color: "#0070f3" },
        showSymbol: false,
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(0, 112, 243, 0.3)" },
              { offset: 1, color: "rgba(0, 112, 243, 0)" },
            ],
          },
        },
        data: data.map((d) => d.users),
      },
      {
        name: "Sessions",
        type: "line",
        smooth: true,
        lineStyle: { width: 2, color: "#8b5cf6" },
        showSymbol: false,
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(139, 92, 246, 0.3)" },
              { offset: 1, color: "rgba(139, 92, 246, 0)" },
            ],
          },
        },
        data: data.map((d) => d.sessions),
      },
      {
        name: "Page Views",
        type: "line",
        smooth: true,
        lineStyle: { width: 2, color: "#10b981" },
        showSymbol: false,
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16, 185, 129, 0.3)" },
              { offset: 1, color: "rgba(16, 185, 129, 0)" },
            ],
          },
        },
        data: data.map((d) => d.pageViews),
      },
    ],
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>{title}</h3>
      </div>
      <div className={styles.chartContainer}>
        <ReactECharts option={option} style={{ height: 300 }} />
      </div>
    </div>
  );
}
