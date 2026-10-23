import { useState } from 'react';

const columns = [
  { key: 'pending', title: 'To Do', tone: 'blue' },
  { key: 'in_progress', title: 'In Progress', tone: 'purple' },
  { key: 'review', title: 'Review', tone: 'yellow' },
  { key: 'completed', title: 'Done', tone: 'green' }
];

export function KanbanBoard({ todos, onStatusChange, onDelete }) {
  const [openDescription, setOpenDescription] = useState(null);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sort, setSort] = useState('dueDate');
  const isToday = (value) => {
    if (!value) return false;
    const date = new Date(value);
    const today = new Date();
    return date.getFullYear() === today.getFullYear()
      && date.getMonth() === today.getMonth()
      && date.getDate() === today.getDate();
  };
  const visibleTodos = todos
    .filter((todo) => filter === 'all'
      || (filter === 'today' && isToday(todo.createdAt))
      || (filter === 'high' && ['high', 'urgent'].includes(todo.priority))
      || (filter === 'mine' && true))
    .filter((todo) => priorityFilter === 'all' || (todo.priority || 'medium') === priorityFilter)
    .sort((first, second) => {
      if (sort === 'priority') {
        const weights = { urgent: 4, high: 3, medium: 2, low: 1 };
        return weights[second.priority || 'medium'] - weights[first.priority || 'medium'];
      }
      return new Date(first.dueDate || '9999-12-31') - new Date(second.dueDate || '9999-12-31');
    });

  const formatDueDate = (date) => date
    ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'No due date';

  return (
    <>
      <div className="board-toolbar">
        <div className="board-tabs">
          <button className={filter === 'all' ? 'selected' : ''} type="button" onClick={() => setFilter('all')}>All Tasks <b>{todos.length}</b></button>
          <button className={filter === 'today' ? 'selected' : ''} type="button" onClick={() => setFilter('today')}>Today <b>{todos.filter((todo) => isToday(todo.createdAt)).length}</b></button>
          <button className={filter === 'high' ? 'selected' : ''} type="button" onClick={() => setFilter('high')}>High Priority <b>{todos.filter((todo) => ['high', 'urgent'].includes(todo.priority)).length}</b></button>
          <button className={filter === 'mine' ? 'selected' : ''} type="button" onClick={() => setFilter('mine')}>My Tasks <b>{todos.length}</b></button>
        </div>
        <div className="board-controls">
          <label>Filter
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="all">All tasks</option>
              <option value="today">Today</option>
              <option value="high">High + urgent</option>
              <option value="mine">My tasks</option>
            </select>
          </label>
          <label>Priority
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
              <option value="all">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
          <label>Sort
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
            </select>
          </label>
          <span className="group-control">▤ Group by: Status</span>
        </div>
      </div>
      <div className="kanban-board">
      {columns.map((column) => {
        const columnTodos = visibleTodos.filter((todo) => todo.status === column.key);
        return (
          <section className={`kanban-column ${column.tone}`} key={column.key}>
            <header className="kanban-column-header">
              <h2><span className="column-dot" />{column.title}</h2>
              <span>{columnTodos.length}</span>
            </header>
            <div className="kanban-cards">
              {columnTodos.map((todo) => (
                <article className="kanban-card" key={todo._id}>
                  <div className="kanban-card-title"><span className="card-title-text">{todo.title}</span><span className={`priority-badge ${todo.priority || 'medium'}`}>{todo.priority || 'medium'}</span><button className="card-menu" type="button" onClick={() => setOpenDescription(openDescription === todo._id ? null : todo._id)} aria-label={`Show details for ${todo.title}`}>⋮</button></div>
                  {openDescription === todo._id && <div className="kanban-description">{todo.description || 'No description added.'}</div>}
                  {todo.tags?.length > 0 && <small className="kanban-assignee">{todo.tags.map((tag) => `#${tag.name}`).join(' ')}</small>}
                  <small className="kanban-date">Due {formatDueDate(todo.dueDate)}</small>
                  <div className="kanban-card-footer">
                    {column.key !== 'completed' && <button className="next-status" type="button" onClick={() => onStatusChange(todo._id, columns[columns.findIndex((item) => item.key === todo.status) + 1].key)}>Move to {columns[columns.findIndex((item) => item.key === todo.status) + 1].title} →</button>}
                    <button className="delete-task" type="button" onClick={() => onDelete(todo._id)} aria-label={`Delete ${todo.title}`}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
      </div>
    </>
  );
}
