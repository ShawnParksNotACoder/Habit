// Tasks-only for day donuts
export function getDayCompletion(tasks) {
  const total = tasks.length;
  if (total === 0) return 0;
  return Math.round((tasks.filter(t => t.done).length / total) * 100);
}

export function getDayStats(tasks) {
  return {
    done: tasks.filter(t => t.done).length,
    total: tasks.length,
  };
}

// Overall progress includes both habits + tasks
export function getDayBarData(weekDates, habits, completions, tasks) {
  return weekDates.map(dateStr => {
    const habitCompletions = completions?.[dateStr] ?? {};
    const dayTasks = tasks?.[dateStr] ?? [];
    const doneHabits  = habits.filter(h => habitCompletions[h.id]).length;
    const doneTasks   = dayTasks.filter(t => t.done).length;
    const totalHabits = habits.length;
    const totalTasks  = dayTasks.length;
    return { doneHabits, doneTasks, totalHabits, totalTasks };
  });
}
