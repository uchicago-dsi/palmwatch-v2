import Link from "next/link";
import styles from "../brand.module.css";

export interface BrandPageScorecardProps {
  altName?: string;
  brand: string;
}

/** Brand breadcrumb and title (section 1). */
export function BrandPageScorecard({
  brand,
  altName,
}: BrandPageScorecardProps) {
  return (
    <section>
      <div className={styles.breadcrumb}>
        <Link className={styles.breadcrumbLink} href="/brands">
          Consumer brands
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span>{brand}</span>
      </div>
      <h1 className={styles.brandName}>
        {brand}
        {altName ? <span className={styles.altName}>({altName})</span> : null}
      </h1>
    </section>
  );
}
