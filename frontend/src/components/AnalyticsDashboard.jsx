const statuses = [
  { key: 'pending', label: 'To Do', className: 'analytics-blue' },
  { key: 'in_progress', label: 'In Progress', className: 'analytics-purple' },
  { key: 'review', label: 'Review', className: 'analytics-yellow' },
  { key: 'completed', label: 'Done', className: 'analytics-green' }
];

const isToday = (date) => {
  const value = new Date(date);
  const today = new Date();
  return value.toDateString() === today.toDateString();
};

function StatCard({ label, value, detail, className }) {
  return <article className={`stat-card ${className}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

export function AnalyticsDashboard({ todos }) {
  const todayTodos = todos.filter((todo) => isToday(todo.createdAt));
  const completed = todos.filter((todo) => todo.status === 'completed').length;
  return (
    <div className="analytics-view">
      <div className="analytics-heading"><div><span className="auth-kicker">OVERVIEW</span><h2>Dashboard analytics</h2><p>Track your tasks and workflow at a glance.</p></div></div>
      <h3 className="analytics-section-title">Today</h3>
      <div className="stats-grid">
        <StatCard label="Today&apos;s tasks" value={todayTodos.length} detail="Created today" className="analytics-blue" />
        <StatCard label="Completed today" value={todayTodos.filter((todo) => todo.status === 'completed').length} detail="Finished today" className="analytics-green" />
        <StatCard label="In progress" value={todayTodos.filter((todo) => todo.status === 'in_progress').length} detail="Working now" className="analytics-purple" />
        <StatCard label="Review" value={todayTodos.filter((todo) => todo.status === 'review').length} detail="Need review" className="analytics-yellow" />
      </div>
      <h3 className="analytics-section-title">All tasks</h3>
      <div className="stats-grid">
        <StatCard label="Total tasks" value={todos.length} detail="All tasks" className="analytics-blue" />
        <StatCard label="Completed" value={completed} detail={`${todos.length ? Math.round((completed / todos.length) * 100) : 0}% completion`} className="analytics-green" />
        <StatCard label="Progress" value={todos.length - completed} detail="Not completed" className="analytics-purple" />
        <StatCard label="Review" value={todos.filter((todo) => todo.status === 'review').length} detail="Awaiting review" className="analytics-yellow" />
      </div>
      <section className="analytics-panel analytics-breakdown"><h3>Task breakdown</h3>{statuses.map((status) => { const count = todos.filter((todo) => todo.status === status.key).length; const width = todos.length ? `${(count / todos.length) * 100}%` : '0%'; return <div className="breakdown-row" key={status.key}><div><span className={`breakdown-dot ${status.className}`} />{status.label}<b>{count}</b></div><div className="breakdown-track"><span className={status.className} style={{ width }} /></div></div>; })}</section>
    </div>
  );
}
