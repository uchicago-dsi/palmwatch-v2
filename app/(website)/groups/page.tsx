import { SearchableListLayout } from "@/components/SearchableListLayout";
import queryClient from "@/utils/getMillData";
import React from "react";
import cmsClient from "@/sanity/lib/client";
import { RichText } from "@/sanity/lib/components";
import path from "path";
export const revalidate = 60;

export default async function Page() {
  const dataDir = path.join(process.cwd(), "public", "data");
  const [_, landingPageContent] = await Promise.all([
    queryClient.init(dataDir),
    cmsClient.getLandingPageContent("groups"),
  ]);
  const options = queryClient.getSearchList()['Mill Groups'];

  return (
    <main className="max-w-3xl mx-auto">
      <section className="prose flex flex-col py-4">
        <h1 className="p-0 m-0">Mill Corporate Groups</h1>
        <RichText value={landingPageContent?.content} />
      </section>
      <div>
        <SearchableListLayout
          // @ts-ignore
          options={options}
          label="Groups"
          columns={2}
          rows={20}
        />
      </div>

      <div className="prose my-4">
        <RichText value={landingPageContent?.disclaimer} />
      </div>
    </main>
  );
}
