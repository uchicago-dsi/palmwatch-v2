import { type NextRequest, NextResponse } from "next/server";
import removeAccents from "remove-accents";
import { precomputedSlug } from "@/lib/precomputed-slug";
import {
  cleanLossData,
  cleanUnparse,
  type LossTimeseriesRow,
} from "@/lib/rename-output-columns";
import { timestamp } from "@/lib/timestamp";
import { loadBrandPrecomputedPayload } from "@/server/brand-precomputed-data";
import { readMillDataText } from "@/server/read-mill-data-text";
import { resolveMillDataBase } from "@/server/resolve-mill-data-base";

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
  const data = await loadBrandPrecomputedPayload(slug, req);
  if (!data) {
    return NextResponse.json(
      { error: "Brand data not found" },
      { status: 404 }
    );
  }
  const sanitizedBrand = removeAccents(brand);
  switch (output) {
    case "geo": {
      const geoDataRaw = await readMillDataText(
        dataDir,
        "mill-catchment.geojson"
      );
      const geoData = JSON.parse(geoDataRaw);
      const features = [];
      for (const row of (data.umlInfo ?? []) as Record<string, unknown>[]) {
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
            "Content-Disposition": `attachment; filename="${sanitizedBrand}-Mills-${timestamp}.geojson"`,
          },
        }
      );
    }
    case "loss": {
      const lossDataRaw = (data.timeseries ?? []) as LossTimeseriesRow[];
      const cleanedLossData = cleanLossData(lossDataRaw);
      return new NextResponse(cleanUnparse(cleanedLossData), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${sanitizedBrand}-Mill-Forest-Loss-${timestamp}.csv"`,
        },
      });
    }
    case "mills":
      return new NextResponse(cleanUnparse(data.umlInfo ?? []), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${sanitizedBrand}-Mills-${timestamp}.csv"`,
        },
      });
    case "owners":
      return new NextResponse(cleanUnparse(data.owners ?? []), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${sanitizedBrand}-Mill-Owners-${timestamp}.csv"`,
        },
      });
    default:
      return NextResponse.json({ ...data }, { status: 200 });
  }
}
