import pageStyles from "@/components/page-layout.module.css";
import { MillsClient } from "@/features/mills-directory";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";
import { loadMillSummaryStats } from "@/server/aggregates-data";
import {
  loadMillDirectory,
  loadMillForestLossQuartiles,
} from "@/server/mill-directory-data";

export const revalidate = 60;

export default async function Page() {
  const [millStats, millDirectory, landingPageContent, lossQuartiles] =
    await Promise.all([
      loadMillSummaryStats(),
      loadMillDirectory(),
      cmsClient.getLandingPageContent("mills"),
      loadMillForestLossQuartiles(),
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
    millCount,
    rspoCertified,
    totalArea,
    totalForestArea,
    totalForestLoss,
    countryCount,
    forestLossByYear,
  } = millStats;

  const disclaimer = landingPageContent?.disclaimer ? (
    <PortableText value={landingPageContent.disclaimer} />
  ) : undefined;

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <MillsClient
          countryCount={countryCount ?? 0}
          disclaimer={disclaimer}
          forestLossByYear={forestLossByYear}
          forestLossQuartiles={lossQuartiles ?? undefined}
          millCount={millCount ?? 0}
          mills={millDirectory ?? []}
          rspoCertified={rspoCertified}
          totalArea={totalArea}
          totalForestArea={totalForestArea}
          totalForestLoss={totalForestLoss}
        />
      </div>
    </main>
  );
}
