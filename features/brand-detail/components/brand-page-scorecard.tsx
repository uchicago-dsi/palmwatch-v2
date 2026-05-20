import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import styles from "../brand.module.css";
import type { RankingEntry } from "../types";

function scoreColor(score: number, theme: "dark" | "light"): string {
  if (score > 3.05) {
    return theme === "dark" ? "#F87171" : "#DC2626";
  }
  if (score >= 2.85) {
    return theme === "dark" ? "#FB923C" : "#EA580C";
  }
  return theme === "dark" ? "#FDE047" : "#CA8A04";
}

function RankingStrip({
  ranking,
  currentBrand,
}: {
  ranking: RankingEntry[];
  currentBrand: string;
}) {
  const { theme } = useTheme();
  const scores = ranking.map((r) => r.averageCurrentRisk);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = maxScore - minScore || 0.01;

  const currentIdx = ranking.findIndex(
    (r) => r.consumer_brand === currentBrand
  );
  const currentScore = ranking[currentIdx]?.averageCurrentRisk ?? scores[0];
  const rank = currentIdx + 1;

  const getXPct = (score: number) => ((score - minScore) / range) * 100;
  const currentX = Math.max(2, Math.min(98, getXPct(currentScore)));
  const dotColor = scoreColor(currentScore, theme);

  return (
    <div className={styles.rankingWrap}>
      <div className={styles.rankingLabelRow}>
        <div
          className={styles.rankingScorePin}
          style={{ left: `${currentX}%` }}
        >
          <span className={styles.rankingScoreText} style={{ color: dotColor }}>
            {currentScore.toFixed(2)}
          </span>
        </div>
      </div>

      <div className={styles.rankingTrack}>
        {ranking.map((r) => {
          const isCurrent = r.consumer_brand === currentBrand;
          const isMin = r.averageCurrentRisk === minScore;
          const isMax = r.averageCurrentRisk === maxScore;
          if (!(isCurrent || isMin || isMax)) {
            return null;
          }
          const pos = Math.max(1, Math.min(99, getXPct(r.averageCurrentRisk)));
          return (
            <div
              className={
                isCurrent ? styles.rankingDotCurrent : styles.rankingDot
              }
              key={r.consumer_brand}
              style={{
                left: `${pos}%`,
                ...(isCurrent ? { background: dotColor } : {}),
              }}
            />
          );
        })}
      </div>

      <div className={styles.rankingEndLabels}>
        <span className={styles.rankingEndLabel}>Lower risk</span>
        <span className={styles.rankingEndLabel}>Higher risk</span>
      </div>

      <div className={styles.rankingRankRow}>
        <div className={styles.rankingRankPin} style={{ left: `${currentX}%` }}>
          <span className={styles.rankingRankText}>
            #{rank} of {ranking.length} brands
          </span>
        </div>
      </div>
    </div>
  );
}

export interface BrandPageScorecardProps {
  altName?: string;
  brand: string;
  ranking: RankingEntry[];
}

/** Brand breadcrumb, title, and ranking strip (section 1). */
export function BrandPageScorecard({
  brand,
  altName,
  ranking,
}: BrandPageScorecardProps) {
  return (
    <section>
      <div className={styles.breadcrumb}>
        <Link className={styles.breadcrumbLink} href="/brands">
          Consumer brands
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span>{brand}</span>
      </div>
      <h1 className={styles.brandName}>
        {brand}
        {altName ? <span className={styles.altName}>({altName})</span> : null}
      </h1>

      <div className={styles.rankingCard}>
        <p className={styles.rankingTitle}>
          Recent deforestation score — where {brand} falls among tracked brands
        </p>
        <RankingStrip currentBrand={brand} ranking={ranking} />
      </div>
    </section>
  );
}
