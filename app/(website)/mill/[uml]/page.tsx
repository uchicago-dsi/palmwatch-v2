import { notFound } from "next/navigation";
import { MillsDeforestationMap } from "@/app/(website)/_shell/entity-deforestation-map";
import pageStyles from "@/components/page-layout.module.css";
import { MillPageView } from "@/features/mill-detail";
import { PortableText } from "@/sanity/lib/components";
import { loadMillPageModel } from "@/server/mill-page-data";

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: Promise<{ uml: string }>;
}) {
  const { uml: _uml } = await params;
  const uml = decodeURIComponent(_uml);
  const model = await loadMillPageModel(uml);
  if (!model) {
    notFound();
  }

  const cmsContent = model.millContent?.content ? (
    <PortableText value={model.millContent.content} />
  ) : undefined;

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <MillPageView
          cmsContent={cmsContent}
          deforestationMap={
            <MillsDeforestationMap
              dataTable={model.millPayload.info}
              noFlyMap={false}
            />
          }
          model={model}
        />
      </div>
    </main>
  );
}
