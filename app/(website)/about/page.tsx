import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";

export const revalidate = 60;

export default async function Page() {
  const aboutPageContent = await cmsClient.getAboutPage();
  return (
    <div className="prose mx-auto max-w-3xl py-4">
      <PortableText value={aboutPageContent.content} />
      <div>
        {!!aboutPageContent?.faq?.length && (
          <>
            <h3>FAQ</h3>
            {aboutPageContent.faq.map((item: any, index: number) => (
              <div className="collapse my-4 bg-base-200 shadow-xl" key={index}>
                <input name={"faq-accordion"} type="radio" />
                <div className="collapse-title font-medium text-xl">
                  {item.heading}
                </div>
                <div className="collapse-content">
                  <PortableText value={item.body} />
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {!!aboutPageContent?.contributors && (
        <PortableText value={aboutPageContent.contributors} />
      )}
    </div>
  );
}
