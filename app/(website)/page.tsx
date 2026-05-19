import Link from "next/link";
import pageStyles from "@/components/page-layout.module.css";
import { QueryProvider } from "@/components/query-provider";
import { ScrollToButton } from "@/components/scroll-to-button";
import { HomePageMap } from "@/features/map";
import heroStyles from "./home-hero.module.css";
import landingStyles from "./home-landing.module.css";

export default async function Home() {
  return (
    <main className="flex h-auto w-full flex-col">
      <section className={heroStyles.hero}>
        <video autoPlay className={heroStyles.heroVideo} loop muted playsInline>
          <source src="cover-video.mp4" type="video/mp4" />
        </video>
        <div aria-hidden className={heroStyles.heroOverlay} />
        <div className={heroStyles.heroContent}>
          <h1 className={heroStyles.heroTitle}>PalmWatch</h1>
          <h2 className={heroStyles.heroSubtitle}>
            Explore the impact of palm oil production on deforestation
          </h2>
          <div className="mt-10 flex justify-center">
            <ScrollToButton
              className={heroStyles.heroExploreMapCta}
              target="homepage-map"
            >
              Explore the map
            </ScrollToButton>
          </div>
        </div>
        <a
          className={heroStyles.heroCredit}
          href="https://www.youtube.com/watch?v=YKJcN81mZgA"
          rel="noopener noreferrer"
          target="_blank"
        >
          Cover Video by Sum Mayyah Channel | Creative Commons Attribution
        </a>
      </section>

      <section className={pageStyles.pageShell}>
        <div className={pageStyles.pageInner}>
          <div className={landingStyles.intro}>
            <h2 className={landingStyles.introTitle}>About PalmWatch</h2>
            <p>
              PalmWatch is an open-access tool using rigorous data science and
              advanced, low-cost data visualization approaches to create a
              uniquely comprehensive and detailed picture of global palm oil
              supply chains. PalmWatch links 15 major users of palm oil, such as
              Nestlé, PepsiCo and Unilever, to the ground-level impacts of their
              palm oil consumption, including hundreds of thousands of square
              kilometers of deforestation.
            </p>
            <p>
              PalmWatch scrapes information from across the web, including
              corporate disclosures and satellite imagery, to link consumer
              brands to the palm oil mills where the oil they use is processed,
              and then to cultivation areas those mills are likely sourcing
              from.
            </p>
            <p>
              Linking brands to specific palm oil cultivation areas means those
              brands can be more easily held accountable for their contributions
              to the ground-level impacts of oil palm cultivation, including
              deforestation, labor violations and other social and environmental
              harms.
            </p>
            <p>
              PalmWatch was developed by{" "}
              <a
                href="https://www.inclusivedevelopment.net/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Inclusive Development International
              </a>{" "}
              and the{" "}
              <a
                href="https://datascience.uchicago.edu/"
                rel="noopener noreferrer"
                target="_blank"
              >
                University of Chicago Data Science Institute
              </a>{" "}
              as a free and open-source data project, with support from the 11th
              Hour Project, Bread for the World and Heinrich Böll Stiftung
              Southeast Asia Regional Office.
            </p>
          </div>
        </div>
      </section>

      <section className={`${landingStyles.featureSection} bg-base-200`}>
        <div className={landingStyles.featureShell}>
          <div className={pageStyles.pageInner}>
            <div className={landingStyles.featureGrid}>
              <article className={landingStyles.featureCard}>
                <div className={landingStyles.featureIconWrap}>
                  <IconChart className={landingStyles.featureIcon} />
                </div>
                <h3>Track Brands&apos; Impact</h3>
                <p>
                  Explore how consumer brands relate to deforestation through
                  the palm oil mills that they source from.
                </p>
                <Link className={landingStyles.featureCta} href="/brands">
                  See brand impact
                </Link>
              </article>

              <article className={landingStyles.featureCard}>
                <div className={landingStyles.featureIconWrap}>
                  <IconChain className={landingStyles.featureIcon} />
                </div>
                <h3>Explore Supply Chains</h3>
                <p>
                  Browse the full mill directory or dive into parent companies
                  and corporate groups to trace supply chain relationships.
                </p>
                <div className={landingStyles.featureCtaGroup}>
                  <Link className={landingStyles.featureCta} href="/mills">
                    Browse mills
                  </Link>
                  <span className={landingStyles.featureCtaSep}>·</span>
                  <Link className={landingStyles.featureCta} href="/companies">
                    View companies
                  </Link>
                </div>
              </article>

              <article className={landingStyles.featureCard}>
                <div className={landingStyles.featureIconWrap}>
                  <IconList className={landingStyles.featureIcon} />
                </div>
                <h3>Explore by Country</h3>
                <p>
                  Compare deforestation trends, mill counts, and forest loss
                  across palm oil producing countries.
                </p>
                <Link className={landingStyles.featureCta} href="/countries">
                  Browse countries
                </Link>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className={pageStyles.pageShell}>
        <div className={pageStyles.pageInner}>
          <div
            className={`${landingStyles.mapSectionIntro} ${landingStyles.mapScrollAnchor}`}
            id="homepage-map"
          >
            <h2 className={landingStyles.mapSectionTitle}>
              Explore the interactive map
            </h2>
            <div className={landingStyles.mapLeadIn}>
              <p>
                This map shows palm oil mill catchment areas and the tree cover
                loss within them. Colors indicate cumulative forest loss since
                2001. Click on any mill area to open its detail page.
              </p>
              <p>
                Use the layer control to switch between years of tree loss data
                and deforestation scores (past, current, and projected).{" "}
                <Link href="/about">Learn more about our methodology</Link>.
              </p>
            </div>
          </div>
          <QueryProvider>
            <HomePageMap />
            <div className={landingStyles.mapTips}>
              <p>
                <strong>Search</strong> for a province, town, or address using
                the search box. <strong>Zoom</strong> with scroll or the
                navigation buttons. <strong>Hover</strong> (or tap) a mill area
                for a quick summary, and <strong>click</strong> (or tap) to open
                the full mill detail page.
              </p>
            </div>
          </QueryProvider>
        </div>
      </section>
    </main>
  );
}

function IconChart({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M3 20h18M3 20V5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M6 20v-6M10 20v-10M14 20v-4M18 20v-9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function IconChain({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.71 1.71"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconList({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="5.5" cy="6.5" fill="currentColor" r="1.75" />
      <circle cx="5.5" cy="12" fill="currentColor" r="1.75" />
      <circle cx="5.5" cy="17.5" fill="currentColor" r="1.75" />
      <path
        d="M10 6.5h10M10 12h10M10 17.5h8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}
