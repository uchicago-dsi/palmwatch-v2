"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  cumulativeLossColumn,
  cumulativeLossPctColumn,
  cumulativeYearRange,
  latestTreelossKmColumn,
} from "@/config/years";
import type { UmlData } from "@/domain";
import { umlRowField } from "@/lib/data-row";
import { useTooltipStore } from "./stores/tooltip-store";

function formatKm2(val: number): string {
  if (val >= 100) {
    return `${Math.round(val)} km²`;
  }
  return `${val.toFixed(1)} km²`;
}

function getCumulativeLossKm2(info: UmlData): number {
  return cumulativeYearRange.reduce((sum, yr) => {
    const val = umlRowField(info, `treeloss_km_${yr}`);
    return sum + (typeof val === "number" ? val : 0);
  }, 0);
}

function getForestLossValue(
  info: UmlData,
  choroplethColumn: string
): number | null {
  if (choroplethColumn === cumulativeLossPctColumn) {
    const forestArea = Number(info.km_forest_area_00) || 0;
    if (forestArea <= 0) {
      return 0;
    }
    const cumLoss = getCumulativeLossKm2(info);
    return Math.min((cumLoss / forestArea) * 100, 100);
  }
  if (choroplethColumn === cumulativeLossColumn) {
    return getCumulativeLossKm2(info);
  }
  if (choroplethColumn.startsWith("treeloss_km_")) {
    const val = umlRowField(info, choroplethColumn);
    return typeof val === "number" ? val : null;
  }
  const val = umlRowField(info, latestTreelossKmColumn);
  return typeof val === "number" ? val : null;
}

function ArrowUpRight() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="12"
      viewBox="0 0 12 12"
      width="12"
    >
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
  const { data, isLoading } = useQuery<{ info: UmlData[] }>(
    [`millonly-${id}`],
    async () =>
      fetch(`/api/mill/${encodeURIComponent(id as string)}?millOnly=true`).then(
        (r) => r.json()
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

  const millHref = `/mill/${encodeURIComponent(id)}`;

  const lossVal = getForestLossValue(info, choroplethColumn);
  const isPctColumn = choroplethColumn === cumulativeLossPctColumn;

  const scoreRows = [
    { label: "Recent score", value: Number(info.risk_score_current) },
    { label: "Past score", value: Number(info.risk_score_past) },
    { label: "Future risk score", value: Number(info.risk_score_future) },
  ];

  const inner = (
    <>
      {/* Name + link arrow */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-sm uppercase leading-snug">
          {info["Mill Name"]}
        </span>
        <span className="mt-0.5 shrink-0 opacity-35">
          <ArrowUpRight />
        </span>
      </div>

      {/* UML ID */}
      <div className="mt-0.5 text-[11px] opacity-40">{info["UML ID"]}</div>

      {/* Country / Province */}
      {(info.Country || info.Province) && (
        <div className="mt-0.5 text-xs opacity-60">
          {[info.Country, info.Province].filter(Boolean).join(" · ")}
        </div>
      )}

      {/* Divider */}
      <div className="my-2 border-base-content/10 border-t" />

      {/* Layer value */}
      {lossVal !== null && (isPctColumn || lossVal > 0) && (
        <div className="mb-1 flex items-center justify-between gap-6">
          <span className="text-[11px] opacity-40">
            {isPctColumn ? "Forest loss (%)" : "Forest loss"}
          </span>
          <span className="font-medium text-xs tabular-nums">
            {isPctColumn ? `${lossVal.toFixed(1)}%` : formatKm2(lossVal)}
          </span>
        </div>
      )}

      {/* Score rows */}
      <div className="flex flex-col gap-1">
        {scoreRows.map(({ label, value }) => (
          <div className="flex items-center justify-between gap-6" key={label}>
            <span className="text-[11px] opacity-40">{label}</span>
            <span className="font-medium text-xs tabular-nums">
              {Number.isFinite(value) ? value.toFixed(2) : "—"}
            </span>
          </div>
        ))}
      </div>
    </>
  );

  if (frozen) {
    return (
      <div className="absolute z-40" style={style}>
        <Link
          className="block rounded-lg border border-base-content/10 bg-base-100 px-3 py-2.5 no-underline shadow-lg transition-opacity hover:opacity-90"
          href={millHref}
        >
          {inner}
        </Link>
        <button
          aria-label="Dismiss"
          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border border-base-content/10 bg-base-100 text-[10px] opacity-70 shadow-sm hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            unfreeze();
          }}
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
