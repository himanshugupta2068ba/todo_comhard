const stages = [
  { key: 'pending', label: 'To Do', color: 'analytics-blue' },
  { key: 'in_progress', label: 'In Progress', color: 'analytics-purple' },
  { key: 'review', label: 'Review', color: 'analytics-yellow' },
  { key: 'completed', label: 'Done', color: 'analytics-green' }
];

const hoursBetween = (start, end) => (new Date(end) - new Date(start)) / 36e5;

const average = (values) => values.length
  ? `${(values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)}h`
  : 'No data';

const isToday = (value) => {
  const date = new Date(value);
  const today = new Date();
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
};

export function SlaAnalytics({ todos }) {
  const activeTodos = [...todos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const transitionTimes = [];
  const completionTimes = [];
  const todayTransitionTimes = [];
  const todayCompletionTimes = [];

  todos.forEach((todo) => {
    const history = todo.statusHistory?.length
      ? todo.statusHistory
      : [{ status: 'pending', enteredAt: todo.createdAt }];
    history.slice(1).forEach((entry, index) => {
      transitionTimes.push(hoursBetween(history[index].enteredAt, entry.enteredAt));
      if (isToday(entry.enteredAt)) {
        todayTransitionTimes.push(hoursBetween(history[index].enteredAt, entry.enteredAt));
      }
    });
    if (todo.status === 'completed') {
      const completedAt = history[history.length - 1].status === 'completed'
        ? history[history.length - 1].enteredAt
        : todo.updatedAt;
      completionTimes.push(hoursBetween(todo.createdAt, completedAt));
      if (isToday(completedAt)) {
        todayCompletionTimes.push(hoursBetween(todo.createdAt, completedAt));
      }
    }
  });

  return (
    <div className="sla-view">
      <div className="sla-heading"><div><span className="auth-kicker">SERVICE LEVEL ANALYTICS</span><h2>SLA tracking</h2><p>Understand how quickly tasks move through your workflow.</p></div></div>
      <div className="sla-metrics">
        <article><span>Total tasks</span><strong>{todos.length}</strong></article>
        <article><span>Pending</span><strong>{todos.filter((todo) => todo.status === 'pending').length}</strong></article>
        <article><span>Completed</span><strong>{todos.filter((todo) => todo.status === 'completed').length}</strong></article>
        <article><span>Avg. stage movement</span><strong>{average(transitionTimes)}</strong></article>
        <article><span>Avg. completion time</span><strong>{average(completionTimes)}</strong></article>
      </div>
      <section className="sla-panel today-sla-panel"><h3>Today&apos;s SLA</h3><p className="sla-help">Movements and completions recorded today.</p><div className="today-sla-metrics"><div><span>Stage movements today</span><strong>{average(todayTransitionTimes)}</strong></div><div><span>Completions today</span><strong>{todayCompletionTimes.length}</strong></div><div><span>Avg. completion today</span><strong>{average(todayCompletionTimes)}</strong></div></div></section>
      <section className="sla-panel"><h3>Task SLA records</h3><div className="sla-stage-summary">{stages.map((stage) => <div className={stage.color} key={stage.key}><span>{stage.label}</span><strong>{todos.filter((todo) => todo.status === stage.key).length}</strong></div>)}</div><div className="sla-task-list">{activeTodos.map((todo) => <article className="sla-task-card" key={todo._id}><div><strong>{todo.title}</strong><small>{todo.tags?.length ? todo.tags.map((tag) => `#${tag.name}`).join(' ') : 'No tags'}</small></div><span className={`sla-status ${todo.status}`}>{stages.find((stage) => stage.key === todo.status)?.label}</span><div className="sla-time"><small>Created<br />{new Date(todo.createdAt).toLocaleString()}</small><small>Due<br />{todo.dueDate ? new Date(todo.dueDate).toLocaleString() : 'Not set'}</small></div></article>)}</div></section>
    </div>
  );
}
