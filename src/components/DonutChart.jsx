export default function DonutChart({
  pct = 0,
  size = 90,
  strokeWidth = 10,
  color = '#4d7c3f',
  trackColor = '#e0e0e0',
  done,
  total,
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const showCounts = done !== undefined && total !== undefined;

  return (
    <div className="donut-wrap" style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        lineHeight: 1.1,
      }}>
        {showCounts ? (
          <span className="donut-label donut-label--counts" style={{ fontSize: size * 0.2 }}>
            {done}<span style={{ fontSize: size * 0.15, opacity: 0.6 }}>/{total}</span>
          </span>
        ) : (
          <span className="donut-label" style={{ fontSize: size * 0.22 }}>{pct}%</span>
        )}
      </div>
    </div>
  );
}
