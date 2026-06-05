import { useWeekData } from './hooks/useWeekData';
import { getDayBarData } from './utils/progressUtils';
import DayColumn from './components/DayColumn';
import WeekendColumn from './components/WeekendColumn';
import BarChart from './components/BarChart';
import HabitTracker from './components/HabitTracker';
import WeekSelector from './components/WeekSelector';
import DataControls from './components/DataControls';
import PomodoroRow from './components/PomodoroRow';
import './App.css';

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const {
    weekDates, weekDateStrs, weekOffset, setWeekOffset,
    habits, completions, tasks,
    toggleHabit, addHabit,
    addTask, toggleTask, deleteTask,
    exportData, importData,
  } = useWeekData();

  const todayStr = getTodayStr();
  const barData = getDayBarData(weekDateStrs, habits, completions, tasks);

  // weekDates: [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
  const sunDate = weekDates[0]; const sunDateStr = weekDateStrs[0];
  const satDate = weekDates[6]; const satDateStr = weekDateStrs[6];
  const weekdays = weekDates.slice(1, 6);
  const weekdayStrs = weekDateStrs.slice(1, 6);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">ADHD Weekly Habit Tracker</h1>
        <DataControls onExport={exportData} onImport={importData} />
        <WeekSelector
          weekDates={weekDates}
          weekOffset={weekOffset}
          onPrev={() => setWeekOffset(o => o - 1)}
          onNext={() => setWeekOffset(o => o + 1)}
        />
      </header>

      {/* Overall Progress */}
      <section className="section-card progress-section">
        <h2 className="section-title">Overall Progress</h2>
        <BarChart data={barData} />
      </section>

      {/* Habit Tracker */}
      <HabitTracker
        habits={habits}
        completions={completions}
        weekDates={weekDates}
        weekDateStrs={weekDateStrs}
        onToggle={toggleHabit}
        onAddHabit={addHabit}
      />

      {/* Weekly Tasks */}
      <section className="section-card tasks-section">
        <h2 className="section-title">Weekly Tasks</h2>
        <div className="days-grid">
          {weekdays.map((date, i) => {
            const dateStr = weekdayStrs[i];
            return (
              <DayColumn
                key={dateStr}
                date={date}
                dateStr={dateStr}
                tasks={tasks[dateStr] ?? []}
                onAddTask={addTask}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                isToday={dateStr === todayStr}
              />
            );
          })}
          <WeekendColumn
            sunDate={sunDate} sunDateStr={sunDateStr}
            satDate={satDate} satDateStr={satDateStr}
            sunTasks={tasks[sunDateStr] ?? []}
            satTasks={tasks[satDateStr] ?? []}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
          />
        </div>
      </section>

      {/* Pomodoro Focus Timers */}
      <PomodoroRow />
    </div>
  );
}
