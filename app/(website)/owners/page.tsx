import { SearchableListLayout } from "@/components/SearchableListLayout";
import React from "react";

import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import { loadPrecomputedJson } from "@/utils/loadPrecomputed";
import type { SearchListPayload } from "@/types/searchList";
export const revalidate = 60;

export default async function Page() {
  const [searchList, landingPageContent] = await Promise.all([
    loadPrecomputedJson<SearchListPayload>("search-list.json"),
    cmsClient.getLandingPageContent("owners"),
  ]);
  const options = searchList["Mill Owners"];

  return (
    <main className="max-w-3xl mx-auto">
      <section className="prose flex flex-col py-4">
        <h1 className="p-0 m-0">Mill Companies</h1>
        {!!landingPageContent?.content && (
          <div className="prose max-w-none">
            <PortableText value={landingPageContent.content} />
          </div>
        )}

      </section>
      <div>
        <SearchableListLayout
        // @ts-ignore
          options={options}
          label="Mill Owners"
          columns={2}
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
