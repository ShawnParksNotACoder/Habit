const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function BarChart({ data = [] }) {
  return (
    <div className="bar-chart">
      {data.map((d, i) => {
        const total  = (d.totalHabits + d.totalTasks) || 1;
        const habitH = (d.doneHabits / total) * 100;
        const taskH  = (d.doneTasks  / total) * 100;
        return (
          <div key={i} className="bar-col">
            <div className="bar-track">
              {d.doneHabits > 0 && (
                <div className="bar-segment bar-segment--habits"
                  style={{ height: `${habitH}%`, bottom: 0 }} />
              )}
              {d.doneTasks > 0 && (
                <div className="bar-segment bar-segment--tasks"
                  style={{ height: `${taskH}%`, bottom: `${habitH}%` }} />
              )}
            </div>
            <div className="bar-label">{DAY_LABELS[i]}</div>
          </div>
        );
      })}
      <div className="bar-legend">
        <span className="legend-dot legend-dot--habits" /> Habits
        <span className="legend-dot legend-dot--tasks" /> Tasks
      </div>
    </div>
  );
}
