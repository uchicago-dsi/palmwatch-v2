import queryClient from "@/utils/getMillData";
import { NextResponse } from "next/server";

const range = (start: number, end: number) => {
  const length = end - start;
  return Array.from({ length }, (_, i) => start + i);
};
const cols = range(1, 23).map((i) => `km_${i}`);

export function GET(_req: Request, res: { params: { brand: string } }) {
  const { brand } = res.params;
  if (!brand)
    return NextResponse.json(
      { error: new Error("No brand provided") },
      { status: 400 }
    );
  const data = queryClient.getBrandInfo(brand, cols);
  return NextResponse.json({ ...data }, { status: 200 });
}