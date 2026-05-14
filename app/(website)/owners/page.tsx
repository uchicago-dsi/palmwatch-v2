import { SearchableListLayout } from "@/components/SearchableListLayout";

import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import type { SearchListPayload } from "@/types/searchList";
import { loadPrecomputedJson } from "@/utils/loadPrecomputed";
export const revalidate = 60;

export default async function Page() {
  const [searchList, landingPageContent] = await Promise.all([
    loadPrecomputedJson<SearchListPayload>("search-list.json"),
    cmsClient.getLandingPageContent("owners"),
  ]);
  const options = searchList["Mill Owners"];

  return (
    <main className="mx-auto max-w-3xl">
      <section className="prose flex flex-col py-4">
        <h1 className="m-0 p-0">Mill Companies</h1>
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
          // @ts-expect-error
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
