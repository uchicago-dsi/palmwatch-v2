import styles from "./loading-dots.module.css";

const LoadingDots = ({ color = "#000" }: { color?: string }) => (
  <span className={styles.loading}>
    <span style={{ backgroundColor: color }} />
    <span style={{ backgroundColor: color }} />
    <span style={{ backgroundColor: color }} />
  </span>
);

export default LoadingDots;
