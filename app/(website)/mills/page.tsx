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

  const {
    forestLossByYear,
    totalForestArea,
    totalForestLoss,
    millCount,
    rspoCertified,
  } = millStats;

  const forestLossPct =
    totalForestArea > 0 ? (totalForestLoss / totalForestArea) * 100 : 0;

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <MillsClient
          forestLossByYear={forestLossByYear ?? []}
          forestLossKm2={totalForestLoss}
          forestLossPct={forestLossPct}
          millCount={millCount ?? 0}
          mills={millDirectory ?? []}
          rspoCertified={rspoCertified}
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
