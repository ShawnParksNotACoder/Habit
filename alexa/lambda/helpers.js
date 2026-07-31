function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeHabit(raw) {
  return (raw || '').toLowerCase().trim();
}

function ensureStructure(attrs) {
  if (!attrs.habits) attrs.habits = ['exercise', 'meditation', 'reading'];
  if (!attrs.completions) attrs.completions = {};
  return attrs;
}

function getTodayCompletions(attrs) {
  const today = todayStr();
  if (!attrs.completions[today]) attrs.completions[today] = {};
  return attrs.completions[today];
}

function countDone(attrs) {
  const done = getTodayCompletions(attrs);
  return attrs.habits.filter(h => done[h]).length;
}

function currentStreak(attrs, habit) {
  const name = normalizeHabit(habit);
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10);
    if (attrs.completions[key] && attrs.completions[key][name]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

module.exports = { todayStr, normalizeHabit, ensureStructure, getTodayCompletions, countDone, currentStreak };
