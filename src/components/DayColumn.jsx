import DonutChart from './DonutChart';
import TaskList from './TaskList';
import { getDayCompletion, getDayStats } from '../utils/progressUtils';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DayColumn({ date, dateStr, tasks, onAddTask, onToggleTask, onDeleteTask, isToday }) {
  const pct = getDayCompletion(tasks);
  const { done, total } = getDayStats(tasks);

  return (
    <div className={`day-column${isToday ? ' day-column--today' : ''}`}>
      <div className="day-header">
        <span className="day-name">{DAY_NAMES[date.getDay()]}</span>
        <span className="day-date">{date.getDate()}</span>
      </div>
      <div className="day-body">
        <div className="donut-center">
          <DonutChart pct={pct} done={done} total={total} />
        </div>
        <TaskList
          tasks={tasks}
          onAdd={(text) => onAddTask(dateStr, text)}
          onToggle={(id) => onToggleTask(dateStr, id)}
          onDelete={(id) => onDeleteTask(dateStr, id)}
        />
      </div>
    </div>
  );
}
