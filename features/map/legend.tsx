import type React from "react";
import type { ColorStop } from "@/lib/color-function";

export const Legend: React.FC<{ colorStops: ColorStop[]; label: string }> = ({
  colorStops,
  label,
}) => (
  <div className="card absolute bottom-8 left-2 bg-base-100 p-2">
    <div className="flex flex-col space-y-1">
      <p>{label}</p>
      {colorStops.map((colorStop, i) => (
        <div className="flex flex-row" key={i}>
          <div
            className="h-4 w-4 rounded-full"
            style={{
              backgroundColor: `rgb(${colorStop.color.join(",")})`,
            }}
          />
          <div className="pl-2">
            <p className="text-xs">{colorStop.label}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
