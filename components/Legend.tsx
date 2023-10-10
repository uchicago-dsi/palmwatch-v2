import { ColorStop } from "@/utils/colorFunction";
import React from "react";

export const Legend: React.FC<{ colorStops: ColorStop[], label: string}> = ({
  colorStops,
  label
}) => {
  return (
    <div className="absolute left-2 bottom-8 bg-base-100 card p-2">
      <div className="flex flex-col space-y-1">
        <p>{label}</p>
        {colorStops.map((colorStop, i) => {
          return (
            <div key={i} className="flex flex-row">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: `rgb(${colorStop.color.join(",")})`,
                }}
              ></div>
              <div className="pl-2 ">
                <p className="text-xs">{colorStop.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
