import queryClient from "@/utils/getMillData";
import { NextResponse } from "next/server";
import path from "path";
import { timestamp } from "@/utils/timestamp";
import { readFileSync } from "fs";
import { cleanUnparse } from "@/utils/renameOutputColumns";

export async function GET(req: Request) {
  const output = new URL(req.url).searchParams.get("output");
  const dataDir = path.join(process.cwd(), "public", "data");
  await queryClient.init(dataDir);
  const data = queryClient.getFullMillInfo().objects()
  console.log(data)
  switch (output) {
    case "geo":
      const geoDataRaw = await readFileSync(
        path.join(dataDir, "mill-catchment.geojson"),
        "utf8"
      );
      const geoData = JSON.parse(geoDataRaw);
      const features = [];
      for (const row of data) {
        const feature = geoData.features.find(
          // @ts-ignore
          (f: any) => f.properties["UML ID"] === row["UML ID"]
        );
        if (feature) {
          features.push({
            type: "Feature",
            geometry: feature.geometry,
            properties: {
              ...row,
              // @ts-ignore
              'Current Deforestation Score': row.risk_score_current,
              // @ts-ignore
              'Past Deforestation Score': row.risk_score_past,
              // @ts-ignore
              'Future Risk Score': row.risk_score_future,
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
