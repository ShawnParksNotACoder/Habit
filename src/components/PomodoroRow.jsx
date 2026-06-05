import { useState } from 'react';
import PomodoroTimer from './PomodoroTimer';

export default function PomodoroRow() {
  const [timers, setTimers] = useState([{ id: Date.now() }]);

  function addTimer() {
    setTimers(prev => [...prev, { id: Date.now() }]);
  }

  function removeTimer(id) {
    setTimers(prev => prev.filter(t => t.id !== id));
  }

  return (
    <section className="section-card pomodoro-section">
      <div className="section-header">
        <h2 className="section-title">Focus Timers</h2>
        <button className="add-timer-btn" onClick={addTimer}>+ Add Timer</button>
      </div>
      <div className="pomodoro-row">
        {timers.map(t => (
          <PomodoroTimer
            key={t.id}
            id={t.id}
            onRemove={timers.length > 1 ? () => removeTimer(t.id) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
