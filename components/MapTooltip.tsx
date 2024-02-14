import { useTooltipStore } from "@/stores/tooltipStore";
import { UmlData } from "@/utils/dataTypes";
import { useQuery } from "@tanstack/react-query";

const TOOLTIP_CONFIG: Array<{
  label: string;
  column: keyof UmlData;
}> = [
  {
    label: "Mill Name",
    column: "Mill Name",
  },
  {
    label: "UML ID",
    column: "UML ID",
  },
  {
    label: "Country",
    column: "Country",
  },
  {
    label: "Forest Loss 2022 (km2)",
    column: "treeloss_km_2022",
  },
  {
    label: "Recent Deforestation Score",
    column: "risk_score_current",
  },
  {
    label: "Past Deforestation Score",
    column: "risk_score_past",
  },
  {
    label: "Future Deforestation Risk Score",
    column: "risk_score_future",
  },
];

export const MapTooltip = () => {
  const tooltipStore = useTooltipStore();
  const { x, y, id } = tooltipStore;

  const { data, isLoading, error } = useQuery<{ info: Array<UmlData> }>(
    [`millonly-${id}`],
    async () =>
      id
        ? fetch(`/api/mill/${id}?millOnly=true`).then((res) => res.json())
        : null
  );

  const _info = data?.info?.[0];
  if (!id || x === null || y === null || (!_info && !isLoading)) {
    return null;
  }
  const info = _info!;

  return (
    <div
      className="absolute max-w-96 bg-base-100 shadow-xl rounded-xl px-4 pointer-events-none prose z-40"
      style={{ left: x + 10, top: y + 10 }}
    >
      {isLoading ? (
        <div className="flex align-center py-4 justify-center">
          <progress className="progress w-10" />
        </div>
      ) : (<>
      
      <table className="table table-xs m-0">
              <thead>
                <tr>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {TOOLTIP_CONFIG.map(({ label, column }) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td>{info[column]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs p-0 pb-1">Click area on map to learn more</p>
            </>
      )}
    </div>
  );
};
