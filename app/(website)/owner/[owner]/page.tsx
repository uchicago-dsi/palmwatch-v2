import { notFound } from "next/navigation";
import pageStyles from "@/components/page-layout.module.css";
import type { UmlData } from "@/domain";
import { CompanyPageView } from "@/features/company-detail";
import { precomputedSlug } from "@/lib/precomputed-slug";
import { loadOwnerPagePayload } from "@/lib/server/entity-page-data";

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
  const millsTyped = pageData.mills as UmlData[];

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <CompanyPageView
          millsTyped={millsTyped}
          name={owner}
          pageData={pageData}
          type="owner"
        />
      </div>
    </main>
  );
}
