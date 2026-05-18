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

  const { millCount, rspoCertified } = millStats;

  const mills = millDirectory ?? [];
  let lower = 0;
  let moderate = 0;
  let higher = 0;
  for (const mill of mills) {
    const s = mill.riskScore;
    if (s === null) {
      continue;
    }
    if (s < 2.85) {
      lower++;
    } else if (s <= 3.05) {
      moderate++;
    } else {
      higher++;
    }
  }

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <MillsClient
          millCount={millCount ?? 0}
          mills={mills}
          riskDistribution={{ lower, moderate, higher, total: mills.length }}
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
