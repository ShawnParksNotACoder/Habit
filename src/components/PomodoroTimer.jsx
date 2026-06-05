import { useState, useEffect, useRef } from 'react';

const DEFAULT_AFFIRMATIONS = [
  "You've got this! One task at a time.",
  "Progress, not perfection.",
  "Small steps lead to big wins.",
  "Stay focused, stay strong.",
  "Every minute counts. Make it matter.",
  "You are capable of amazing things.",
  "Keep going — you're closer than you think.",
];

function TimerRing({ pct, timeStr, mode, size = 120, strokeWidth = 10 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  // Color shifts from teal (#0ea5e9) toward red (#ef4444) as time depletes
  const hue = Math.round(195 - (1 - pct / 100) * 195); // 195=teal, 0=red
  const color = pct > 15 ? '#0ea5e9' : '#ef4444';
  const textColor = pct > 15 ? '#1e293b' : '#ef4444';

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        lineHeight: 1.1,
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: textColor, fontVariantNumeric: 'tabular-nums' }}>
          {timeStr}
        </span>
        <span style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>
          {mode === 'timer' ? 'Left' : 'Elapsed'}
        </span>
      </div>
    </div>
  );
}

export default function PomodoroTimer({ id, onRemove }) {
  const [title, setTitle]             = useState('Get Stuff Done');
  const [editingTitle, setEditingTitle] = useState(false);
  const [mode, setMode]               = useState('timer'); // 'timer' | 'stopwatch'
  const [durationMin, setDurationMin] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning]         = useState(false);
  const [notes, setNotes]             = useState('');
  const [affirmIdx, setAffirmIdx]     = useState(0);
  const intervalRef  = useRef(null);
  const marqueeRef   = useRef(null);

  const totalSeconds = mode === 'timer' ? durationMin * 60 : null;
  const elapsed      = mode === 'timer'
    ? (durationMin * 60) - secondsLeft
    : secondsLeft; // reused as elapsed in stopwatch
  const pct = mode === 'timer'
    ? Math.max(0, (secondsLeft / (durationMin * 60)) * 100)
    : 100; // ring stays full in stopwatch

  const displaySec = mode === 'timer' ? secondsLeft : secondsLeft;
  const mm = String(Math.floor(displaySec / 60)).padStart(2, '0');
  const ss = String(displaySec % 60).padStart(2, '0');
  const timeStr = `${mm}:${ss}`;

  // Tick
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (mode === 'timer') {
          if (prev <= 1) { setRunning(false); return 0; }
          return prev - 1;
        } else {
          return prev + 1; // count up
        }
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  // Rotate affirmations every 5 seconds
  useEffect(() => {
    const t = setInterval(() => {
      setAffirmIdx(i => (i + 1) % DEFAULT_AFFIRMATIONS.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  function reset() {
    setRunning(false);
    setSecondsLeft(mode === 'timer' ? durationMin * 60 : 0);
  }

  function toggleMode(dir) {
    // dir: 'up' = timer, 'down' = stopwatch
    const next = dir === 'up' ? 'timer' : 'stopwatch';
    setMode(next);
    setRunning(false);
    setSecondsLeft(next === 'timer' ? durationMin * 60 : 0);
  }

  function changeDuration(delta) {
    if (running) return;
    const next = Math.max(1, Math.min(120, durationMin + delta));
    setDurationMin(next);
    if (mode === 'timer') setSecondsLeft(next * 60);
  }

  return (
    <div className="pomodoro-card">
      {/* Header */}
      <div className="pomodoro-header">
        {editingTitle ? (
          <input
            className="pomodoro-title-input"
            value={title}
            autoFocus
            onChange={e => setTitle(e.target.value)}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
          />
        ) : (
          <span className="pomodoro-title" onClick={() => setEditingTitle(true)} title="Click to rename">
            {title}
          </span>
        )}
        {onRemove && (
          <button className="pomodoro-remove" onClick={onRemove} title="Remove timer">×</button>
        )}
      </div>

      {/* Body */}
      <div className="pomodoro-body">
        {/* Controls row: chevrons | ring | play */}
        <div className="pomodoro-controls">
          {/* Mode chevrons */}
          <div className="pomodoro-chevrons">
            <button
              className={`chevron-btn${mode === 'timer' ? ' active' : ''}`}
              onClick={() => toggleMode('up')}
              title="Countdown timer"
            >∧</button>
            <button
              className={`chevron-btn${mode === 'stopwatch' ? ' active' : ''}`}
              onClick={() => toggleMode('down')}
              title="Stopwatch"
            >∨</button>
          </div>

          {/* Ring + duration control */}
          <div className="pomodoro-ring-wrap">
            {mode === 'timer' && !running && (
              <div className="duration-controls">
                <button onClick={() => changeDuration(1)}>+</button>
                <button onClick={() => changeDuration(-1)}>−</button>
              </div>
            )}
            <TimerRing pct={pct} timeStr={timeStr} mode={mode} size={120} />
          </div>

          {/* Play/pause + reset */}
          <div className="pomodoro-actions">
            <button className="play-btn" onClick={() => setRunning(r => !r)}>
              {running ? '⏸' : '▶'}
            </button>
            <button className="reset-btn" onClick={reset} title="Reset">↺</button>
          </div>
        </div>

        {/* Affirmations ticker */}
        <div className="affirmations-bar">
          <span
            key={affirmIdx}
            className="affirmation-text"
          >
            {DEFAULT_AFFIRMATIONS[affirmIdx]}
          </span>
        </div>

        {/* Notes area */}
        <textarea
          className="pomodoro-notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add notes, tasks, or motivation for this session…"
          rows={3}
        />
      </div>
    </div>
  );
}
