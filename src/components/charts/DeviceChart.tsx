"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import styles from "@/styles/components/Charts.module.scss";

interface DeviceData {
  device: string;
  users: number;
  sessions: number;
  percentage: number;
}

interface DeviceChartProps {
  data: DeviceData[];
  title?: string;
}

const COLORS = ["#0070f3", "#8b5cf6", "#f59e0b", "#10b981"];

export default function DeviceChart({
  data,
  title = "Traffic by Device",
}: DeviceChartProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} users ({d}%)",
    },
    legend: {
      orient: "vertical",
      right: "5%",
      top: "center",
      textStyle: {
        color: "#888888",
      },
    },
    series: [
      {
        name: "Devices",
        type: "pie",
        radius: ["50%", "75%"],
        center: ["35%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: "#111111",
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((d, i) => ({
          value: d.users,
          name: d.device,
          itemStyle: { color: COLORS[i % COLORS.length] },
        })),
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
