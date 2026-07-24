import clsx from "clsx";

type MetricCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color?: "primary" | "secondary" | "danger" | "success" | "purple";
  change?: string;
  trend?: "up" | "down" | "neutral";
  progress?: number;
};

const colorMap: Record<string, string> = {
  primary: "border-l-4 border-primary/50 bg-primary/5 text-primary",
  secondary: "border-l-4 border-secondary/50 bg-secondary/5 text-secondary",
  success: "border-l-4 border-success/50 bg-success/5 text-success",
  danger: "border-l-4 border-error/50 bg-error/5 text-error",
  purple: "border-l-4 border-accent/50 bg-accent/5 text-accent",
};

const progressColorMap: Record<string, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-success",
  danger: "bg-error",
  purple: "bg-accent",
};

const trendMap: Record<string, string> = {
  up: "text-green-600 dark:text-green-400",
  down: "text-red-600 dark:text-red-400",
  neutral: "text-gray-500 dark:text-gray-400",
};

const trendIcon: Record<string, string> = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

export default function MetricCard({
  icon,
  title,
  value,
  color = "primary",
  change,
  trend = "neutral",
  progress,
}: MetricCardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-white/40 p-6 shadow-md backdrop-blur-md transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700",
        colorMap[color]
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/60 text-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</h3>
            {change && <p className="text-xs text-gray-500 dark:text-gray-400">{change}</p>}
          </div>
        </div>
        <span className={clsx("text-xs font-medium", trendMap[trend])}>
          {trendIcon[trend]}
        </span>
      </div>

      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={clsx("h-2.5 rounded-full transition-all duration-500", progressColorMap[color])}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{progress}% utilizado</p>
        </div>
      )}
    </div>
  );
}