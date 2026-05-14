import { NextResponse } from "next/server";
import { mergeFullShards } from "@/utils/bboxCompute";
import { readMillDataText } from "@/utils/readMillDataText";
import { cleanUnparse } from "@/utils/renameOutputColumns";
import { resolveMillDataBase } from "@/utils/resolveMillDataBase";
import { timestamp } from "@/utils/timestamp";

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
          // @ts-expect-error
          (f: any) => f.properties["UML ID"] === row["UML ID"]
        );
        if (feature) {
          features.push({
            type: "Feature",
            geometry: feature.geometry,
            properties: {
              ...row,
              // @ts-expect-error
              "Current Deforestation Score": row.risk_score_current,
              // @ts-expect-error
              "Past Deforestation Score": row.risk_score_past,
              // @ts-expect-error
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
