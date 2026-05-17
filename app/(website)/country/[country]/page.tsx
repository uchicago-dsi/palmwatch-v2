import { notFound } from "next/navigation";
import pageStyles from "@/components/page-layout.module.css";
import type { UmlData } from "@/domain";
import { CountryPageView } from "@/features/country-detail";
import { precomputedSlug } from "@/lib/precomputed-slug";
import { loadCountryPagePayload } from "@/lib/server/entity-page-data";

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: _country } = await params;
  const country = decodeURIComponent(_country);
  const pageData = await loadCountryPagePayload(precomputedSlug(country));
  if (!pageData) {
    notFound();
  }
  const millsTyped = pageData.mills as UmlData[];

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <CountryPageView
          country={country}
          millsTyped={millsTyped}
          pageData={pageData}
        />
      </div>
    </main>
  );
}
