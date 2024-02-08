import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@portabletext/react";

export default async function Page() {
  const aboutPageContent = await cmsClient.getAboutPage();
  return (
    <div className="prose max-w-3xl mx-auto py-4">
      <PortableText value={aboutPageContent.content} />
      <div>
        {!!aboutPageContent?.faq?.length && (
          <>
            <h3>FAQ</h3>
            {aboutPageContent.faq.map((item, index) => (
              <div key={index} className="collapse bg-base-200 my-4 shadow-xl">
                <input type="radio" name={`faq-accordion`} />
                <div className="collapse-title text-xl font-medium">
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
    </div>
  );
}
