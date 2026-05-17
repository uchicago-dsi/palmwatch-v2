"use client";
import styles from "./show-more-button.module.css";

interface Props {
  expanded: boolean;
  hiddenCount: number;
  onToggle: () => void;
}

/** Toggle to reveal rows hidden by `useShowMore`. */
export function ShowMoreButton({ expanded, hiddenCount, onToggle }: Props) {
  if (hiddenCount === 0) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <button className={styles.button} onClick={onToggle} type="button">
        {expanded ? "Show less" : `Show more (${hiddenCount})`}
      </button>
    </div>
  );
}
