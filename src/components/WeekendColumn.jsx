import DonutChart from './DonutChart';
import TaskList from './TaskList';
import { getDayCompletion, getDayStats } from '../utils/progressUtils';

export default function WeekendColumn({
  sunDate, sunDateStr, satDate, satDateStr,
  sunTasks, satTasks,
  onAddTask, onToggleTask, onDeleteTask,
}) {
  const sunStats = getDayStats(sunTasks);
  const satStats = getDayStats(satTasks);
  const combinedDone  = sunStats.done  + satStats.done;
  const combinedTotal = sunStats.total + satStats.total;
  const combinedPct   = combinedTotal === 0 ? 0 : Math.round((combinedDone / combinedTotal) * 100);

  return (
    <div className="day-column weekend-column">
      <div className="day-header">
        <span className="day-name">Weekend</span>
      </div>
      <div className="day-body">
        <div className="donut-center">
          <DonutChart pct={combinedPct} done={combinedDone} total={combinedTotal} />
        </div>
        <div className="task-list-header">Tasks</div>
        <div className="weekend-day-label">Sun {sunDate.getDate()}</div>
        <TaskList
          tasks={sunTasks}
          onAdd={(text) => onAddTask(sunDateStr, text)}
          onToggle={(id) => onToggleTask(sunDateStr, id)}
          onDelete={(id) => onDeleteTask(sunDateStr, id)}
          hideHeader
        />
        <div className="weekend-day-label">Sat {satDate.getDate()}</div>
        <TaskList
          tasks={satTasks}
          onAdd={(text) => onAddTask(satDateStr, text)}
          onToggle={(id) => onToggleTask(satDateStr, id)}
          onDelete={(id) => onDeleteTask(satDateStr, id)}
          hideHeader
        />
      </div>
    </div>
  );
}
