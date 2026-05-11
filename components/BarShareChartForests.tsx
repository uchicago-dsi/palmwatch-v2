import { UmlData } from "@/utils/dataTypes";
import { BarShareChart } from "./BarShareChart";
// s {
//   data: Record<string, unknown>[];
//   bars: {
//     dataKey: string;
//     label: string;
//     stackId?: string;
//     fill?: string;
//   }[];
// }
interface BarShareChartForestProps {
  entry: UmlData;
  totalForestLoss: number;
}

const forestAmountBarConfig = [
  {
    dataKey: "Total Forest Area",
    label: "Total Forest Area",
    fill: "rgb(54, 211, 153)",
  },
  {
    dataKey: "Other Area",
    label: "Other Area",
    fill: "gray",
  },
];

const remainingForestBarConfig = [
  {
    dataKey: "Remaining Forest Area",
    label: "Remaining Forest Area",
    fill: "rgb(54, 211, 153)",
  },
  {
    dataKey: "Lost Forest Area",
    label: "Lost Forest Area",
    fill: "rgb(248, 114, 114)",
  },
];
function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export const BarShareChartForests: React.FC<BarShareChartForestProps> = ({
  entry,
  totalForestLoss,
}) => {
  const kmArea = Number(entry.km_area) || 0;
  const kmForest0 = Number(entry.km_forest_area_00) || 0;
  const summedLoss = Number(totalForestLoss);
  const columnLoss = Number(entry.sum_of_treeloss_km) || 0;
  const sumLoss =
    Number.isFinite(summedLoss) && summedLoss >= 0 ? summedLoss : columnLoss;

  const pctForest =
    kmArea > 0 ? clampPct((kmForest0 / kmArea) * 100) : 0;
  const pctNonForest = clampPct(100 - pctForest);

  // Share of *original* forest that remains vs cumulative loss (both as % of km_forest_area_00).
  const pctForestRemaining =
    kmForest0 > 0
      ? clampPct(((kmForest0 - sumLoss) / kmForest0) * 100)
      : 0;
  const pctForestLost = clampPct(100 - pctForestRemaining);

  const forestAmountData = [
    {
      name: "Composition",
      "Total Forest Area": pctForest,
      "Other Area": pctNonForest,
    },
  ];
  const remainingForestData = [
    {
      name: "Forest loss",
      "Remaining Forest Area": pctForestRemaining,
      "Lost Forest Area": pctForestLost,
    },
  ];
  return (
    <div className="w-full flex flex-col space-y-4 lg:flex-row lg:space-x-10 lg:space-y-0 prose max-w-full">
      <div className="flex-1 min-w-0">
        <h3>Forest and Non-Forest Area Composition (%)</h3>
        <div className="h-40 w-full min-h-[10rem]">
          <BarShareChart
            data={forestAmountData}
            bars={forestAmountBarConfig}
            domain={[0, 100]}
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3>Remaining Forest Area (%)</h3>
        <div className="h-40 w-full min-h-[10rem]">
          <BarShareChart
            data={remainingForestData}
            bars={remainingForestBarConfig}
            domain={[0, 100]}
          />
        </div>
      </div>
    </div>
  );
};
