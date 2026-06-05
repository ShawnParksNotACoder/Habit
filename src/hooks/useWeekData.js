import { useState, useCallback } from 'react';
import { DEFAULT_HABITS } from '../data/habits';

const STORAGE_KEY = 'adhd-habit-tracker';

function getWeekDates(anchorDate = new Date()) {
  const d = new Date(anchorDate);
  const day = d.getDay(); // 0=Sun
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(sunday);
    dd.setDate(sunday.getDate() + i);
    return dd;
  });
}

function fmt(date) {
  return date.toISOString().slice(0, 10);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useWeekData() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [state, setState] = useState(() => {
    const saved = loadState();
    return saved || {
      habits: DEFAULT_HABITS,
      completions: {},
      tasks: {},
    };
  });

  const anchor = new Date();
  anchor.setDate(anchor.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(anchor);
  const weekDateStrs = weekDates.map(fmt);

  const update = useCallback((updater) => {
    setState(prev => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const toggleHabit = useCallback((habitId, dateStr) => {
    update(prev => ({
      ...prev,
      completions: {
        ...prev.completions,
        [dateStr]: {
          ...(prev.completions[dateStr] ?? {}),
          [habitId]: !(prev.completions[dateStr]?.[habitId] ?? false),
        },
      },
    }));
  }, [update]);

  const addHabit = useCallback((name) => {
    const id = 'h' + Date.now();
    update(prev => ({ ...prev, habits: [...prev.habits, { id, name }] }));
  }, [update]);

  const addTask = useCallback((dateStr, text) => {
    const id = 't' + Date.now();
    update(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [dateStr]: [...(prev.tasks[dateStr] ?? []), { id, text, done: false }],
      },
    }));
  }, [update]);

  const toggleTask = useCallback((dateStr, taskId) => {
    update(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [dateStr]: (prev.tasks[dateStr] ?? []).map(t =>
          t.id === taskId ? { ...t, done: !t.done } : t
        ),
      },
    }));
  }, [update]);

  const deleteTask = useCallback((dateStr, taskId) => {
    update(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [dateStr]: (prev.tasks[dateStr] ?? []).filter(t => t.id !== taskId),
      },
    }));
  }, [update]);

  const exportData = useCallback(() => {
    const raw = localStorage.getItem(STORAGE_KEY) ?? '{}';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        window.location.reload();
      } catch {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    weekDates,
    weekDateStrs,
    weekOffset,
    setWeekOffset,
    habits: state.habits,
    completions: state.completions,
    tasks: state.tasks,
    toggleHabit,
    addHabit,
    addTask,
    toggleTask,
    deleteTask,
    exportData,
    importData,
  };
}
