import pageStyles from "@/components/page-layout.module.css";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import styles from "./about.module.css";

export const revalidate = 60;

export default async function Page() {
  const aboutPageContent = await cmsClient.getAboutPage();
  return (
    <main className={pageStyles.pageShell}>
      <div className="mx-auto max-w-3xl">
        {/* Main prose content (Overview + Methodology) */}
        <div
          className={`prose mb-4 max-w-none rounded-[10px] border border-base-content/10 bg-base-100 p-6 ${styles.proseContent}`}
          id="overview"
        >
          <PortableText value={aboutPageContent.content} />
        </div>

        {/* FAQ */}
        {!!aboutPageContent?.faq?.length && (
          <div
            className="mb-4 rounded-[10px] border border-base-content/10 bg-base-100 p-6"
            id="faq"
          >
            <p className="mb-4 font-medium text-base">FAQ</p>
            <div>
              {aboutPageContent.faq.map((item: any, index: number) => (
                <div
                  className={`collapse-arrow collapse rounded-none ${
                    index < aboutPageContent.faq.length - 1
                      ? "border-base-content/10 border-b"
                      : ""
                  }`}
                  key={index}
                >
                  <input name="faq-accordion" type="radio" />
                  <div className="collapse-title px-0 py-3 font-medium text-sm">
                    {item.heading}
                  </div>
                  <div
                    className={`collapse-content prose max-w-none px-0 text-sm ${styles.proseContent}`}
                  >
                    <PortableText value={item.body} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contributors */}
        {!!aboutPageContent?.contributors && (
          <div
            className={`prose mb-4 max-w-none rounded-[10px] border border-base-content/10 bg-base-100 p-6 ${styles.proseContent}`}
            id="contributors"
          >
            <PortableText value={aboutPageContent.contributors} />
          </div>
        )}

        {/* Contact */}
        <div
          className={`prose mb-4 max-w-none rounded-[10px] border border-base-content/10 bg-base-100 p-6 ${styles.proseContent}`}
          id="contact"
        >
          <h2>Contact</h2>
          <p>
            Have a suggestion, correction, or question about PalmWatch? Reach
            out at{" "}
            <a href="mailto:palmwatch@inclusivedevelopment.net">
              <strong>palmwatch@inclusivedevelopment.net</strong>
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
