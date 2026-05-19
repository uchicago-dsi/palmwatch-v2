import { maxYear } from "@/config/years";
import styles from "../company.module.css";

export interface CompanyStatsGridProps {
  averageCurrentRisk: number;
  forestLossSince2001: number;
  formatKm2: (v: number) => string;
  uniqueCountries: number;
  uniqueMills: number;
}

/** Top stat cards on owner/group entity pages. */
export function CompanyStatsGrid({
  uniqueMills,
  uniqueCountries,
  averageCurrentRisk,
  forestLossSince2001,
  formatKm2,
}: CompanyStatsGridProps) {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Mills</span>
        <div className={styles.statValueRow}>
          <span className={styles.statValue}>{uniqueMills}</span>
        </div>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Countries</span>
        <div className={styles.statValueRow}>
          <span className={styles.statValue}>{uniqueCountries}</span>
        </div>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>
          Average recent deforestation score
        </span>
        <div className={styles.statValueRow}>
          <span className={styles.statValue}>
            {averageCurrentRisk.toFixed(2)}
          </span>
        </div>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>
          Total forest loss (2001–{maxYear})
        </span>
        <div className={styles.statValueRow}>
          <span className={styles.statValue}>
            {formatKm2(forestLossSince2001)} km²
          </span>
        </div>
      </div>
    </div>
  );
}
