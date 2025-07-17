import queryClient from "@/utils/getMillData";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country } = await params;
  if (!country)
    return NextResponse.json(
      { error: new Error("No brand provided") },
      { status: 400 }
    );
  const dataDir = path.join(process.cwd(), "public", "data");
  await queryClient.init(dataDir);
  const data = queryClient.getCountryData(country);
  return NextResponse.json({ ...data }, { status: 200 });
}
