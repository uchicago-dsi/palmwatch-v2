import pageStyles from "@/components/page-layout.module.css";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";

export const revalidate = 60;

export default async function Page() {
  const content = await cmsClient.getContactPage();
  return (
    <main className={pageStyles.pageShell}>
      <div className={`prose ${pageStyles.pageInnerNarrow}`}>
        <PortableText value={content.content} />
      </div>
    </main>
  );
}
