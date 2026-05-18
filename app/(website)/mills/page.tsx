import pageStyles from "@/components/page-layout.module.css";
import { loadMillSummaryStats } from "@/lib/server/aggregates-data";
import { loadMillDirectory } from "@/lib/server/mill-directory-data";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import styles from "./mills.module.css";
import { MillsClient } from "./mills-client";

export const revalidate = 60;

export default async function Page() {
  const [millStats, millDirectory, landingPageContent] = await Promise.all([
    loadMillSummaryStats(),
    loadMillDirectory(),
    cmsClient.getLandingPageContent("mills"),
  ]);

  if (!millStats) {
    return (
      <main className={pageStyles.pageShell}>
        <div className={pageStyles.pageInner}>
          <p>Could not load statistics. Please try again later.</p>
        </div>
      </main>
    );
  }

  const { millCount, rspoCertified, totalArea, totalForestArea, totalForestLoss } = millStats;

  const mills = millDirectory ?? [];

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <MillsClient
          millCount={millCount ?? 0}
          mills={mills}
          rspoCertified={rspoCertified}
          totalArea={totalArea}
          totalForestArea={totalForestArea}
          totalForestLoss={totalForestLoss}
        />
        {!!landingPageContent?.disclaimer && (
          <div className={styles.disclaimer}>
            <PortableText value={landingPageContent.disclaimer} />
          </div>
        )}
      </div>
    </main>
  );
}
