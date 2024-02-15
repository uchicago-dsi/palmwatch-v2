import { SearchableListLayout } from "@/components/SearchableListLayout";
import queryClient from "@/utils/getMillData";
import React from "react";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";

export const revalidate = 60;

export default async function Page() {
  const [_, landingPageContent] = await Promise.all([
    queryClient.init(),
    cmsClient.getLandingPageContent("groups"),
  ]);
  const options = queryClient.getSearchList()['Mill Groups'];

  return (
    <main className="max-w-3xl mx-auto">
      <section className="prose flex flex-col py-4">
        <h1 className="p-0 m-0">Mill Corporate Groups</h1>
        {!!landingPageContent?.content && <p className="prose"><PortableText value={landingPageContent.content} /></p>}
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

      <p className="prose my-4">
        {!!landingPageContent?.disclaimer && (
          <PortableText value={landingPageContent.disclaimer} />
        )}
      </p>
    </main>
  );
}
