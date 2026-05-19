export interface ScoreThreshold {
  darkColor: string;
  label: "Low risk" | "Moderate" | "High risk";
  lightColor: string;
}

export function getScoreThreshold(score: number): ScoreThreshold {
  if (score > 3.05) {
    return { label: "High risk", lightColor: "#E24B4A", darkColor: "#F09595" };
  }
  if (score >= 2.85) {
    return { label: "Moderate", lightColor: "#EF9F27", darkColor: "#FAC775" };
  }
  return { label: "Low risk", lightColor: "#1D9E75", darkColor: "#5DCAA5" };
}

export function scoreColor(score: number, theme: "light" | "dark"): string {
  const t = getScoreThreshold(score);
  return theme === "dark" ? t.darkColor : t.lightColor;
}
