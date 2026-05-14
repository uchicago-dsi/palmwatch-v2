import { type NextRequest, NextResponse } from "next/server";
import removeAccents from "remove-accents";
import { loadPrecomputedJson } from "@/utils/loadPrecomputed";
import { precomputedSlug } from "@/utils/precomputedSlug";
import { readMillDataText } from "@/utils/readMillDataText";
import { cleanLossData, cleanUnparse } from "@/utils/renameOutputColumns";
import { resolveMillDataBase } from "@/utils/resolveMillDataBase";
import { timestamp } from "@/utils/timestamp";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brand: string }> }
) {
  const { brand } = await params;
  const output = new URL(req.url).searchParams.get("output");
  if (!brand) {
    return NextResponse.json(
      { error: new Error("No brand provided") },
      { status: 400 }
    );
  }
  const dataDir = await resolveMillDataBase(req);
  const slug = precomputedSlug(decodeURIComponent(brand));
  const data = await loadPrecomputedJson<{
    umlInfo: unknown[];
    timeseries: unknown[];
    owners: unknown[];
    brandStats?: unknown;
  }>(`brand/${slug}.json`, req);
  const sanitizedBrand = removeAccents(brand);
  switch (output) {
    case "geo": {
      const geoDataRaw = await readMillDataText(
        dataDir,
        "mill-catchment.geojson"
      );
      const geoData = JSON.parse(geoDataRaw);
      const features = [];
      for (const row of data.umlInfo as Record<string, unknown>[]) {
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
            "Content-Disposition": `attachment; filename="${sanitizedBrand}-Mills-${timestamp}.geojson"`,
          },
        }
      );
    }
    case "loss": {
      const lossDataRaw = data.timeseries;
      const cleanedLossData = cleanLossData(lossDataRaw);
      return new NextResponse(cleanUnparse(cleanedLossData), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${sanitizedBrand}-Mill-Forest-Loss-${timestamp}.csv"`,
        },
      });
    }
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
          "Content-Disposition": `attachment; filename="${sanitizedBrand}-Mill-Owners-${timestamp}.csv"`,
        },
      });
    default:
      return NextResponse.json({ ...data }, { status: 200 });
  }
}
