import queryClient from "@/utils/getMillData";
import { NextResponse, NextRequest } from "next/server";
import path from "path";

export async function GET(req: NextRequest, { params }: { params: Promise<{ uml: string }> }) {
  const { uml } = await params;
  const url = new URL(req.url);
  const millOnly = !!(url.searchParams.get("millOnly"));
  if (!uml)
    return NextResponse.json(
      { error: new Error("No uml provided") },
      { status: 400 }
    );
  const dataDir = path.join(process.cwd(), "public", "data");
  await queryClient.init(dataDir);

  const info = queryClient.getUml(uml).objects();
  const brands = millOnly
    ? []
    : queryClient.getBrandUsageByUml(uml)
  return NextResponse.json({ brands, info });
}
