export default function WeekSelector({ weekDates, weekOffset, onPrev, onNext }) {
  const start = weekDates[0];
  const end   = weekDates[6];
  const fmt   = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="week-selector">
      <button className="week-nav" onClick={onPrev}>‹</button>
      <span className="week-range">
        {weekOffset === 0 ? 'This Week' : `${fmt(start)} – ${fmt(end)}`}
      </span>
      <button className="week-nav" onClick={onNext}>›</button>
    </div>
  );
}
