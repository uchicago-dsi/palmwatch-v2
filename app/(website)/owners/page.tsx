import pageStyles from "@/components/page-layout.module.css";
import { emptySearchListPayload } from "@/domain";
import { SearchableListLayout } from "@/features/searchable-list";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import { loadSearchListPayload } from "@/server/search-list-data";
export const revalidate = 60;

export default async function Page() {
  const [searchListRaw, landingPageContent] = await Promise.all([
    loadSearchListPayload(),
    cmsClient.getLandingPageContent("owners"),
  ]);
  const searchList = searchListRaw ?? emptySearchListPayload;
  const options = searchList["Mill Owners"];

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <section className="prose flex max-w-none flex-col pb-4">
          <h1 className="m-0 p-0">Mill owners</h1>
          {!!landingPageContent?.content && (
            <div className="prose max-w-none">
              <PortableText value={landingPageContent.content} />
            </div>
          )}
        </section>
        <div>
          <SearchableListLayout
            columns={2}
            label="Mill Owners"
            options={options}
            rows={20}
          />
        </div>
        <div className="prose my-4 max-w-none">
          {!!landingPageContent?.disclaimer && (
            <PortableText value={landingPageContent.disclaimer} />
          )}
        </div>
      </div>
    </main>
  );
}
