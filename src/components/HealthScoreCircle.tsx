import { getScoreColor, getScoreLabel } from "@/lib/reports";
import styles from "@/styles/components/HealthScore.module.scss";

interface HealthScoreCircleProps {
  score: number;
  size?: "small" | "large";
  showLabel?: boolean;
}

export default function HealthScoreCircle({
  score,
  size = "small",
  showLabel = false,
}: HealthScoreCircleProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  const radius = size === "large" ? 36 : 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorClass =
    color === "green"
      ? styles.scoreGreen
      : color === "yellow"
      ? styles.scoreYellow
      : color === "orange"
      ? styles.scoreOrange
      : styles.scoreRed;

  const labelColorClass =
    color === "green"
      ? styles.scoreLabelGreen
      : color === "yellow"
      ? styles.scoreLabelYellow
      : color === "orange"
      ? styles.scoreLabelOrange
      : styles.scoreLabelRed;

  return (
    <div className={styles.scoreWrapper}>
      <div
        className={`${styles.scoreCircle} ${
          size === "large" ? styles.scoreCircleLarge : ""
        }`}
      >
        <svg className={styles.scoreSvg} viewBox="0 0 80 80">
          <circle
            className={styles.scoreBackground}
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            strokeWidth={size === "large" ? 6 : 4}
          />
          <circle
            className={`${styles.scoreProgress} ${colorClass}`}
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            strokeWidth={size === "large" ? 6 : 4}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <span
          className={`${styles.scoreValue} ${
            size === "large" ? styles.scoreValueLarge : ""
          }`}
        >
          {score}
        </span>
      </div>
      {showLabel && (
        <span className={`${styles.scoreLabel} ${labelColorClass}`}>
          {label}
        </span>
      )}
    </div>
  );
}
