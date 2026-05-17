import { notFound } from "next/navigation";
import pageStyles from "@/components/page-layout.module.css";
import { MillPageView } from "@/features/mill-detail";
import { loadMillPageModel } from "@/lib/server/mill-page-data";
import { PortableText } from "@/sanity/lib/components";

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
        <MillPageView cmsContent={cmsContent} model={model} />
      </div>
    </main>
  );
}
