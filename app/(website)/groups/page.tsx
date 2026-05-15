import { emptySearchListPayload } from "@/domain";
import { SearchableListLayout } from "@/features/searchable-list";
import { loadSearchListPayload } from "@/lib/server/search-list-data";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
export const revalidate = 60;

export default async function Page() {
  const [searchListRaw, landingPageContent] = await Promise.all([
    loadSearchListPayload(),
    cmsClient.getLandingPageContent("groups"),
  ]);
  const searchList = searchListRaw ?? emptySearchListPayload;
  const options = searchList["Mill Groups"];

  return (
    <main className="mx-auto max-w-3xl">
      <section className="prose flex flex-col py-4">
        <h1 className="m-0 p-0">Mill Corporate Groups</h1>
        {!!landingPageContent?.content && (
          <div className="prose max-w-none">
            <PortableText value={landingPageContent.content} />
          </div>
        )}
      </section>
      <div>
        <SearchableListLayout
          columns={2}
          label="Groups"
          options={options}
          rows={20}
        />
      </div>

      <div className="prose my-4 max-w-none">
        {!!landingPageContent?.disclaimer && (
          <PortableText value={landingPageContent.disclaimer} />
        )}
      </div>
    </main>
  );
}
