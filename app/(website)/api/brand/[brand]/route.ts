import queryClient from "@/utils/getMillData";
import { NextResponse } from "next/server";
import path from "path";
import { unparse } from "papaparse";
import { timestamp } from "@/utils/timestamp";
import { readFileSync } from "fs";
import { fullYearRangeColumns } from "@/config/years";
import { cleanLossData, cleanUnparse } from "@/utils/renameOutputColumns";
import removeAccents from 'remove-accents';

export async function GET(req: Request, res: { params: { brand: string } }) {
  const { brand } = res.params;
  const output = new URL(req.url).searchParams.get("output");
  if (!brand)
    return NextResponse.json(
      { error: new Error("No brand provided") },
      { status: 400 }
    );
  const dataDir = path.join(process.cwd(), "public", "data");
  await queryClient.init(dataDir);
  const data = queryClient.getBrandInfo(brand, fullYearRangeColumns);
  const sanitizedBrand = removeAccents(brand);
  switch (output) {
    case "geo":
      const geoDataRaw = await readFileSync(
        path.join(dataDir, "mill-catchment.geojson"),
        "utf8"
      );
      const geoData = JSON.parse(geoDataRaw);
      const features = [];
      for (const row of data.umlInfo) {
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
            "Content-Disposition": `attachment; filename="${sanitizedBrand}-Mills-${timestamp}.geojson"`,
          },
        }
      );
    case "loss":
      const lossDataRaw = data.timeseries
      const cleanedLossData = cleanLossData(lossDataRaw)
      return new NextResponse(cleanUnparse(cleanedLossData), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${sanitizedBrand}-Mills-${timestamp}.csv"`,
        },
      });
    case "mills":
      return new NextResponse(cleanUnparse(data.umlInfo), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${sanitizedBrand}-Mills-${timestamp}.csv"`,
        },
      });
    case "owners":
      return new NextResponse(cleanUnparse(data.owners), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${sanitizedBrand}-Mills-${timestamp}.csv"`,
        },
      });
    default:
      return NextResponse.json({ ...data }, { status: 200 });
  }
}
