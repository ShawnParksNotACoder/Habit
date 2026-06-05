import { useState } from 'react';

export default function HabitTracker({ habits, completions, weekDateStrs, weekDates, onToggle, onAddHabit }) {
  const [newHabit, setNewHabit] = useState('');
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function submit(e) {
    e.preventDefault();
    const t = newHabit.trim();
    if (!t) return;
    onAddHabit(t);
    setNewHabit('');
  }

  return (
    <section className="section-card habit-section">
      <div className="section-header">
        <h2 className="section-title">Habit Tracker</h2>
      </div>
      <div className="habit-table-wrap">
        <table className="habit-table">
          <thead>
            <tr>
              <th className="habit-name-col">Habit</th>
              {weekDates.map((d, i) => (
                <th key={i} className="habit-day-col">
                  {DAY_NAMES[d.getDay()]}<br />
                  <span style={{ fontSize: '0.75em', fontWeight: 400 }}>{d.getDate()}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map(h => (
              <tr key={h.id}>
                <td className="habit-name-cell">
                  {h.icon && <span className="habit-icon">{h.icon}</span>}
                  {h.name}
                </td>
                {weekDateStrs.map(dateStr => {
                  const done = !!(completions?.[dateStr]?.[h.id]);
                  return (
                    <td key={dateStr} className="habit-check-cell">
                      <button
                        className={`habit-check${done ? ' checked' : ''}`}
                        onClick={() => onToggle(h.id, dateStr)}
                        aria-label={done ? 'Unmark' : 'Mark'}
                      >
                        {done ? '✓' : ''}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form className="add-habit-form" onSubmit={submit}>
        <input
          className="add-habit-input"
          value={newHabit}
          onChange={e => setNewHabit(e.target.value)}
          placeholder="Add new habit…"
        />
        <button type="submit" className="add-habit-btn">+ Add</button>
      </form>
    </section>
  );
}
