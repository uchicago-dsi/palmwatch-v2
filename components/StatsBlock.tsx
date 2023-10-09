import React from "react";
interface StatsBlockProps {
  stats: Array<{
    title: string;
    stat: string;
    className: string;
    description?: string;
  }>;
}
export const StatsBlock: React.FC<StatsBlockProps> = ({ stats }) => {
  return (
    <div className="stats">
      {stats.map(({ title, stat, className, description }) => (
        <div className="stat" key={title}>
          <div className="stat-title">{title}</div>
          <div className={`stat-value ${className}`}>{stat}</div>
          {!!description && <div className="stat-desc">{description}</div>}
        </div>
      ))}
    </div>
  );
};
