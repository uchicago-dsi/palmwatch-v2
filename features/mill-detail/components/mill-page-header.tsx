import Link from "next/link";
import styles from "../mill.module.css";

export interface MillPageHeaderProps {
  altName?: string | null;
  country?: string;
  formatTitle: (value: string) => string;
  groupName?: string;
  millName: string;
  parentCompany?: string;
  province?: string;
}

export function MillPageHeader({
  millName,
  altName,
  parentCompany,
  groupName,
  province,
  country,
  formatTitle,
}: MillPageHeaderProps) {
  const hasParent = parentCompany?.trim();
  const hasGroup =
    groupName?.trim() &&
    groupName.trim().toUpperCase() !== "UNKNOWN" &&
    groupName.trim() !== parentCompany?.trim();

  return (
    <div>
      <nav className={styles.breadcrumb}>
        <Link className={styles.breadcrumbLink} href="/mills">
          Mills
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{millName}</span>
      </nav>

      <h1 className={styles.millName}>{millName}</h1>
      {altName ? (
        <p className={styles.altName}>Also known as {altName}</p>
      ) : null}

      <div className={styles.metaRow}>
        {hasParent ? (
          <span>
            Owned by{" "}
            <Link
              className={styles.metaLink}
              href={`/owner/${encodeURIComponent(parentCompany ?? "")}`}
            >
              {formatTitle(parentCompany ?? "")}
            </Link>
          </span>
        ) : null}

        {hasGroup ? (
          <>
            <span className={styles.metaSep}>·</span>
            <span>
              Group:{" "}
              <Link
                className={styles.metaLink}
                href={`/group/${encodeURIComponent(groupName ?? "")}`}
              >
                {formatTitle(groupName ?? "")}
              </Link>
            </span>
          </>
        ) : null}

        {province || country ? (
          <>
            <span className={styles.metaSep}>·</span>
            <span>{[province, country].filter(Boolean).join(", ")}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}
