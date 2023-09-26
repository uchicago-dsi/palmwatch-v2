import queryClient from "@/utils/getMillData";
import { NextResponse } from "next/server";

export function GET(req: Request, res: { params: { uml: string } }) {
  const { uml } = res.params;
  if (!uml)
    return NextResponse.json(
      { error: new Error("No uml provided") },
      { status: 400 }
    );
  const brands = queryClient.getBrandUsage(uml);
  const impact = queryClient.getMillImpact(uml).objects();
  return NextResponse.json({ brands, impact }, { status: 200 });
}
