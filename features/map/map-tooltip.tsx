"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/components/theme-provider";
import {
  cumulativeLossColumn,
  cumulativeYearRange,
  latestTreelossKmColumn,
} from "@/config/years";
import type { UmlData } from "@/domain";
import { getScoreThreshold } from "@/lib/score-threshold";
import { useTooltipStore } from "./stores/tooltip-store";

function formatKm2(val: number): string {
  if (val >= 100) {
    return `${Math.round(val)} km²`;
  }
  return `${val.toFixed(1)} km²`;
}

function getForestLossValue(
  info: UmlData,
  choroplethColumn: string
): number | null {
  if (choroplethColumn === cumulativeLossColumn) {
    return cumulativeYearRange.reduce((sum, yr) => {
      const val = (info as Record<string, unknown>)[`treeloss_km_${yr}`];
      return sum + (typeof val === "number" ? val : 0);
    }, 0);
  }
  if (choroplethColumn.startsWith("treeloss_km_")) {
    const val = (info as Record<string, unknown>)[choroplethColumn];
    return typeof val === "number" ? val : null;
  }
  const val = (info as Record<string, unknown>)[latestTreelossKmColumn];
  return typeof val === "number" ? val : null;
}

function ArrowUpRight() {
  return (
    <svg aria-hidden fill="none" height="12" viewBox="0 0 12 12" width="12">
      <path
        d="M2 10L10 2M10 2H4M10 2V8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export const MapTooltip = () => {
  const { x, y, id, frozen, choroplethColumn, unfreeze } = useTooltipStore();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data, isLoading } = useQuery<{ info: Array<UmlData> }>(
    [`millonly-${id}`],
    async () =>
      fetch(`/api/mill/${encodeURIComponent(id!)}?millOnly=true`).then((r) =>
        r.json()
      ),
    { enabled: !!id }
  );

  if (!id || x === null || y === null) {
    return null;
  }

  const style: React.CSSProperties = {
    left: x + 14,
    top: y + 14,
    maxWidth: 240,
  };

  if (!data && isLoading) {
    return (
      <div
        className="pointer-events-none absolute z-40 flex items-center justify-center rounded-lg border border-base-content/10 bg-base-100 px-3 py-2.5 shadow-lg"
        style={{ ...style, minWidth: 80 }}
      >
        <progress className="progress w-8" />
      </div>
    );
  }

  const info = data?.info?.[0];
  if (!info) {
    return null;
  }

  const score = Number(info.risk_score_current);
  const validScore = Number.isFinite(score) && score > 0;
  const threshold = validScore ? getScoreThreshold(score) : null;
  const barColor = threshold
    ? isDark
      ? threshold.darkColor
      : threshold.lightColor
    : "currentColor";
  const barPct = validScore ? Math.min(100, Math.round((score / 5) * 100)) : 0;

  const lossVal = getForestLossValue(info, choroplethColumn);

  const province = info.Province || info.District;
  const location = [info.Country, province]
    .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
    .join(" · ");

  const millHref = `/mill/${encodeURIComponent(id!)}`;

  const inner = (
    <>
      {/* Name + link arrow */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-sm leading-snug">
          {info["Mill Name"]}
        </span>
        <span className="mt-0.5 shrink-0 opacity-35">
          <ArrowUpRight />
        </span>
      </div>

      {/* Location */}
      {location && <div className="mt-0.5 text-xs opacity-60">{location}</div>}

      {/* Divider */}
      <div className="my-2 border-base-content/10 border-t" />

      {/* Score row */}
      {validScore && threshold && (
        <div className="mb-1 flex items-center gap-2">
          <span className="w-8 shrink-0 text-[11px] opacity-40">Score</span>
          <div className="h-[5px] w-10 shrink-0 overflow-hidden rounded-full bg-base-content/10">
            <div
              className="h-full rounded-full"
              style={{ width: `${barPct}%`, background: barColor }}
            />
          </div>
          <span className="font-medium text-xs">{score.toFixed(1)}</span>
          <span className="text-[11px]" style={{ color: barColor }}>
            {threshold.label}
          </span>
        </div>
      )}

      {/* Loss row */}
      {lossVal !== null && lossVal > 0 && (
        <div className="flex items-center gap-2">
          <span className="w-8 shrink-0 text-[11px] opacity-40">Loss</span>
          <span className="font-medium text-xs">{formatKm2(lossVal)}</span>
        </div>
      )}
    </>
  );

  if (frozen) {
    return (
      <div className="absolute z-40" style={style}>
        <Link
          className="block rounded-lg border border-base-content/10 bg-base-100 px-3 py-2.5 shadow-lg no-underline transition-opacity hover:opacity-90"
          href={millHref}
        >
          {inner}
        </Link>
        <button
          aria-label="Dismiss"
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-base-content/10 bg-base-100 shadow-sm text-[10px] opacity-70 hover:opacity-100"
          onClick={(e) => { e.stopPropagation(); unfreeze(); }}
          type="button"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute z-40 rounded-lg border border-base-content/10 bg-base-100 px-3 py-2.5 shadow-lg"
      style={style}
    >
      {inner}
    </div>
  );
};
