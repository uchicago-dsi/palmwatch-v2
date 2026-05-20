import { notFound } from "next/navigation";
import { MillsDeforestationMap } from "@/app/(website)/_shell/entity-deforestation-map";
import pageStyles from "@/components/page-layout.module.css";
import { SupplierPageView } from "@/features/supplier-detail";
import { precomputedSlug } from "@/lib/precomputed-slug";
import { loadOwnerPagePayload } from "@/server/entity-page-data";

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: Promise<{ owner: string }>;
}) {
  const { owner: _owner } = await params;
  const owner = decodeURIComponent(_owner);
  const pageData = await loadOwnerPagePayload(precomputedSlug(owner));
  if (!pageData) {
    notFound();
  }
  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <SupplierPageView
          deforestationMap={
            <MillsDeforestationMap dataTable={pageData.mills} />
          }
          millsTyped={pageData.mills}
          name={owner}
          pageData={pageData}
          type="owner"
        />
      </div>
    </main>
  );
}
