import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  /** Tailwind stroke-* class for the filled arc. */
  ringClassName: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

/**
 * Circular 0–100 readout used for waste risk and match scores. The number is
 * always rendered inside the ring, so the value never depends on reading an
 * arc length or a colour.
 */
export function ScoreRing({
  score,
  ringClassName,
  size = 96,
  strokeWidth = 8,
  label,
  sublabel,
  className,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const dash = (clamped / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label ?? "Score"}: ${clamped} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          className={cn("transition-[stroke-dasharray] duration-1000 ease-out", ringClassName)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="tabular font-semibold leading-none"
          style={{ fontSize: size * 0.3 }}
        >
          {clamped}
        </span>
        {sublabel ? (
          <span
            className="mt-0.5 font-medium uppercase tracking-wide text-muted-foreground"
            style={{ fontSize: Math.max(9, size * 0.11) }}
          >
            {sublabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
