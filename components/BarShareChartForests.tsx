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
export const BarShareChartForests: React.FC<BarShareChartForestProps> = ({
  entry,
  totalForestLoss,
}) => {
  const pctForest =
    Math.round((entry.km_forest_area_00 / entry.km_area) * 100);
  const pctNonForest = Math.round(100 - pctForest);
  const pctDeforested =
    Math.round(
      ((entry.km_forest_area_00 - entry.sum_of_treeloss_km) /
        entry.km_forest_area_00) *
        100
    );
  const pctRemainingForest = 100 - pctDeforested;
  const forestAmountData = [
    {
      "Total Forest Area": pctForest,
      "Other Area": pctNonForest,
    },
  ];
  const remainingForestData = [
    {
      "Remaining Forest Area": pctDeforested,
      "Lost Forest Area": pctRemainingForest,
    },
  ];
  return (
    <div className="w-full flex flex-col space-y-4 lg:flex-row lg:space-x-10 lg:space-y-0 prose max-w-full">
      <div className="flex-1">
        <h3>Forest and Non-Forest Area Composition (%)</h3>
        <div className="h-30 lg:h-20">
          <BarShareChart data={forestAmountData} bars={forestAmountBarConfig} />
        </div>
      </div>
      <div className="flex-1">
        <h3>Remaining Forest Area (%)</h3>
        <div className="h-30 lg:h-20">
          <BarShareChart
            data={remainingForestData}
            bars={remainingForestBarConfig}
          />
        </div>
      </div>
    </div>
  );
};
