import { notFound } from "next/navigation";
import { MillsDeforestationMap } from "@/app/(website)/_shell/entity-deforestation-map";
import pageStyles from "@/components/page-layout.module.css";
import { CompanyPageView } from "@/features/company-detail";
import { precomputedSlug } from "@/lib/precomputed-slug";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import { loadGroupPagePayload } from "@/server/entity-page-data";

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group: _group } = await params;
  const group = decodeURIComponent(_group);

  const [groupInfo, pageData] = await Promise.all([
    cmsClient.getGroupInfo(group),
    loadGroupPagePayload(precomputedSlug(group)),
  ]);

  if (!pageData) {
    notFound();
  }

  const aboutContent =
    groupInfo?.description || groupInfo?.content ? (
      <>
        {groupInfo.description && (
          <p>
            {groupInfo.description}
            {groupInfo.externalLink && (
              <>
                {" "}
                <a
                  href={groupInfo.externalLink}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  More info
                </a>
              </>
            )}
          </p>
        )}
        {groupInfo.content && <PortableText value={groupInfo.content} />}
      </>
    ) : undefined;

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <CompanyPageView
          aboutContent={aboutContent}
          deforestationMap={
            <MillsDeforestationMap dataTable={pageData.mills} />
          }
          millsTyped={pageData.mills}
          name={group}
          pageData={pageData}
          type="group"
        />
      </div>
    </main>
  );
}
