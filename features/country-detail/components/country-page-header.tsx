import Link from "next/link";
import styles from "../country.module.css";

export function CountryPageHeader({ country }: { country: string }) {
  return (
    <div>
      <nav className={styles.breadcrumb}>
        <Link className={styles.breadcrumbLink} href="/countries">
          Countries
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span>{country}</span>
      </nav>
      <h1 className={styles.countryName}>{country}</h1>
    </div>
  );
}
