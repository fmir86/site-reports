"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import styles from "@/styles/components/Charts.module.scss";

interface GeoData {
  country: string;
  countryCode: string;
  users: number;
  sessions: number;
  percentage: number;
}

interface GeoMapProps {
  data: GeoData[];
  title?: string;
}

// Country code to country name mapping for ECharts world map
const countryCodeToName: Record<string, string> = {
  US: "United States",
  CN: "China",
  NG: "Nigeria",
  CR: "Costa Rica",
  GH: "Ghana",
  SG: "Singapore",
  KR: "Korea",
  SE: "Sweden",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  JP: "Japan",
  IN: "India",
  BR: "Brazil",
  CA: "Canada",
  AU: "Australia",
  MX: "Mexico",
  ES: "Spain",
  IT: "Italy",
  RU: "Russia",
  NL: "Netherlands",
  PL: "Poland",
  ID: "Indonesia",
  TR: "Turkey",
  SA: "Saudi Arabia",
  AE: "United Arab Emirates",
  TH: "Thailand",
  PH: "Philippines",
  VN: "Vietnam",
  MY: "Malaysia",
  PK: "Pakistan",
  BD: "Bangladesh",
  EG: "Egypt",
  ZA: "South Africa",
  AR: "Argentina",
  CO: "Colombia",
  CL: "Chile",
  PE: "Peru",
  VE: "Venezuela",
  UA: "Ukraine",
  AT: "Austria",
  BE: "Belgium",
  CH: "Switzerland",
  CZ: "Czech Rep.",
  DK: "Denmark",
  FI: "Finland",
  GR: "Greece",
  HU: "Hungary",
  IE: "Ireland",
  IL: "Israel",
  NO: "Norway",
  NZ: "New Zealand",
  PT: "Portugal",
  RO: "Romania",
  SK: "Slovakia",
};

export default function GeoMap({
  data,
  title = "Geographic Distribution",
}: GeoMapProps) {
  const [mapRegistered, setMapRegistered] = useState(false);

  useEffect(() => {
    // Load world map data
    const loadMap = async () => {
      try {
        const response = await fetch(
          "https://cdn.jsdelivr.net/npm/echarts/map/json/world.json"
        );
        const worldJson = await response.json();
        echarts.registerMap("world", worldJson);
        setMapRegistered(true);
      } catch (error) {
        console.error("Failed to load world map:", error);
      }
    };

    if (!echarts.getMap("world")) {
      loadMap();
    } else {
      setMapRegistered(true);
    }
  }, []);

  const maxUsers = Math.max(...data.map((d) => d.users));

  // Convert data to ECharts format
  const mapData = data.map((d) => ({
    name: countryCodeToName[d.countryCode] || d.country,
    value: d.users,
    percentage: d.percentage,
    sessions: d.sessions,
  }));

  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "#1a1a1a",
      borderColor: "#333333",
      textStyle: {
        color: "#ededed",
      },
      formatter: (params: unknown) => {
        const p = params as {
          name: string;
          value: number;
          data?: { percentage: number; sessions: number };
        };
        if (!p.value || !p.data) {
          return `${p.name}: No data`;
        }
        return `<strong>${p.name}</strong><br/>
                Users: ${p.value}<br/>
                Sessions: ${p.data.sessions}<br/>
                Share: ${p.data.percentage.toFixed(1)}%`;
      },
    },
    visualMap: {
      min: 0,
      max: maxUsers,
      left: "left",
      bottom: "10%",
      text: ["High", "Low"],
      textStyle: {
        color: "#888888",
      },
      calculable: false,
      inRange: {
        color: ["#1a1a2e", "#0070f3", "#00d4ff"],
      },
      show: true,
      orient: "vertical",
      itemWidth: 10,
      itemHeight: 80,
    },
    series: [
      {
        name: "Users by Country",
        type: "map",
        map: "world",
        roam: true,
        scaleLimit: {
          min: 1,
          max: 5,
        },
        emphasis: {
          label: {
            show: true,
            color: "#ededed",
          },
          itemStyle: {
            areaColor: "#0070f3",
          },
        },
        select: {
          disabled: true,
        },
        itemStyle: {
          areaColor: "#1a1a1a",
          borderColor: "#333333",
          borderWidth: 0.5,
        },
        label: {
          show: false,
        },
        data: mapData,
      },
    ],
  };

  // Fallback bar chart while map loads
  const barOption: EChartsOption = {
    tooltip: {
      trigger: "item",
      backgroundColor: "#1a1a1a",
      borderColor: "#333333",
      textStyle: { color: "#ededed" },
      formatter: (params: unknown) => {
        const p = params as {
          name: string;
          value: number;
          data: { percentage: number };
        };
        return `${p.name}: ${p.value} users (${p.data.percentage.toFixed(1)}%)`;
      },
    },
    grid: {
      left: "3%",
      right: "10%",
      bottom: "3%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      max: maxUsers,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
    },
    yAxis: {
      type: "category",
      data: [...data].sort((a, b) => b.users - a.users).map((d) => d.country),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#888888",
        fontSize: 12,
        width: 100,
        overflow: "truncate",
      },
      inverse: true,
    },
    series: [
      {
        name: "Users",
        type: "bar",
        barWidth: 16,
        showBackground: true,
        backgroundStyle: {
          color: "rgba(255, 255, 255, 0.03)",
          borderRadius: 8,
        },
        itemStyle: {
          borderRadius: 8,
          color: "#0070f3",
        },
        label: {
          show: true,
          position: "right",
          formatter: "{c}",
          color: "#888888",
          fontSize: 11,
        },
        data: [...data]
          .sort((a, b) => b.users - a.users)
          .map((d) => ({
            value: d.users,
            percentage: d.percentage,
          })),
      },
    ],
  };

  const sortedData = [...data].sort((a, b) => b.users - a.users);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>{title}</h3>
        <span className={styles.chartSubtitle}>{data.length} countries</span>
      </div>
      <div className={styles.chartContainer}>
        {mapRegistered ? (
          <ReactECharts
            option={option}
            style={{ height: 300 }}
            opts={{ renderer: "svg" }}
          />
        ) : (
          <ReactECharts
            option={barOption}
            style={{ height: Math.max(200, data.length * 35) }}
          />
        )}
      </div>

      {/* Country List */}
      <div className={styles.geoCountryList}>
        <table className={styles.geoTable}>
          <thead>
            <tr>
              <th className={styles.geoTableHeader}>Country</th>
              <th className={styles.geoTableHeader}>Users</th>
              <th className={styles.geoTableHeader}>Sessions</th>
              <th className={styles.geoTableHeader}>Share</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr key={item.countryCode} className={styles.geoTableRow}>
                <td className={styles.geoTableCell}>
                  <span className={styles.geoRank}>{index + 1}</span>
                  <span className={styles.geoCountryName}>{item.country}</span>
                </td>
                <td className={styles.geoTableCell}>{item.users}</td>
                <td className={styles.geoTableCell}>{item.sessions}</td>
                <td className={styles.geoTableCell}>
                  <div className={styles.geoPercentBar}>
                    <div
                      className={styles.geoPercentFill}
                      style={{ width: `${item.percentage}%` }}
                    />
                    <span className={styles.geoPercentText}>{item.percentage.toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
