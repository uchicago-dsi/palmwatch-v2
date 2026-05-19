import { NextResponse } from "next/server";
import { cleanUnparse } from "@/lib/rename-output-columns";
import { timestamp } from "@/lib/timestamp";
import { mergeFullShards } from "@/server/bbox-compute";
import { readMillDataText } from "@/server/read-mill-data-text";
import { resolveMillDataBase } from "@/server/resolve-mill-data-base";

export async function GET(req: Request) {
  const output = new URL(req.url).searchParams.get("output");
  const dataDir = await resolveMillDataBase(req);
  const data = await mergeFullShards(req);
  console.log(data.length, "mills");
  switch (output) {
    case "geo": {
      const geoDataRaw = await readMillDataText(
        dataDir,
        "mill-catchment.geojson"
      );
      const geoData = JSON.parse(geoDataRaw);
      const features = [];
      for (const row of data as Record<string, unknown>[]) {
        const feature = geoData.features.find(
          (f: { properties: Record<string, unknown> }) =>
            f.properties["UML ID"] === row["UML ID"]
        );
        if (feature) {
          features.push({
            type: "Feature",
            geometry: feature.geometry,
            properties: {
              ...row,
              "Current Deforestation Score": row.risk_score_current,
              "Past Deforestation Score": row.risk_score_past,
              "Future Risk Score": row.risk_score_future,
              risk_score_current: undefined,
              risk_score_past: undefined,
              risk_score_future: undefined,
            },
          });
        }
      }
      return NextResponse.json(
        { type: "FeatureCollection", features },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="Mills-${timestamp}.geojson"`,
          },
        }
      );
    }
    case "mills":
      return new NextResponse(cleanUnparse(data), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="Mills-${timestamp}.csv"`,
        },
      });
    default:
      return NextResponse.json({ ...data }, { status: 200 });
  }
}
