import { notFound } from "next/navigation";
import { MillsDeforestationMap } from "@/app/(website)/_shell/entity-deforestation-map";
import pageStyles from "@/components/page-layout.module.css";
import { CountryPageView } from "@/features/country-detail";
import { precomputedSlug } from "@/lib/precomputed-slug";
import { loadCountryPagePayload } from "@/server/entity-page-data";

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
  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <CountryPageView
          country={country}
          deforestationMap={
            <MillsDeforestationMap dataTable={pageData.mills} />
          }
          millsTyped={pageData.mills}
          pageData={pageData}
        />
      </div>
    </main>
  );
}
