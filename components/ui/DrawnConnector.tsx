"use client";

import { forwardRef } from "react";

const WIDTH = 1400;
const HEIGHT = 120;

// One gentle up/down hump per stop — an organic, hand-drawn-feeling line (not
// procedurally jittered) connecting the panels, echoing Lusion's "Featured Work"
// connector. preserveAspectRatio="none" lets this abstract viewBox stretch to fit
// whatever pixel width the parent gives it, so no runtime measurement is needed.
function buildWavePath(humps: number) {
  const segment = WIDTH / humps;
  const midY = HEIGHT / 2;
  const amp = HEIGHT * 0.32;
  let d = `M0 ${midY}`;
  for (let i = 0; i < humps; i++) {
    const x1 = i * segment + segment / 2;
    const x2 = (i + 1) * segment;
    const y = i % 2 === 0 ? midY - amp : midY + amp;
    d += ` Q ${x1} ${y} ${x2} ${midY}`;
  }
  return d;
}

interface DrawnConnectorProps {
  humps: number;
  className?: string;
}

const DrawnConnector = forwardRef<SVGPathElement, DrawnConnectorProps>(
  ({ humps, className }, ref) => {
    const d = buildWavePath(humps);

    return (
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className={className}
        aria-hidden
      >
        <path
          ref={ref}
          d={d}
          fill="none"
          stroke="var(--color-steel)"
          strokeWidth={2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity={0.55}
        />
      </svg>
    );
  }
);

DrawnConnector.displayName = "DrawnConnector";

export default DrawnConnector;
