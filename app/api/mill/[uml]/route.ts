import queryClient from "@/utils/getMillData";
import { NextResponse } from "next/server";

export function GET(_req: Request, res: { params: { uml: string } }) {
  const { uml } = res.params;
  if (!uml)
    return NextResponse.json(
      { error: new Error("No uml provided") },
      { status: 400 }
    );
  const brands = queryClient.getBrandUsage(uml);
  const info = queryClient.getUml(uml).objects();
  return NextResponse.json({ brands, info }, { status: 200 });
}