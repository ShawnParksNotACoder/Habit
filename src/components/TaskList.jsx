import { useState } from 'react';

export default function TaskList({ tasks = [], onAdd, onToggle, onDelete, hideHeader = false }) {
  const [input, setInput] = useState('');

  function submit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setInput('');
  }

  return (
    <div className="task-list">
      {!hideHeader && <div className="task-list-header">Tasks</div>}
      <ul className="task-items">
        {tasks.map(t => (
          <li key={t.id} className={`task-item${t.done ? ' done' : ''}`}>
            <button className="task-check" onClick={() => onToggle(t.id)} aria-label="toggle">
              {t.done ? '✓' : '○'}
            </button>
            <span className="task-text">{t.text}</span>
            <button className="task-del" onClick={() => onDelete(t.id)} aria-label="delete">×</button>
          </li>
        ))}
      </ul>
      <form className="task-form" onSubmit={submit}>
        <input
          className="task-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add task…"
        />
        <button type="submit" className="task-add-btn">+</button>
      </form>
    </div>
  );
}
