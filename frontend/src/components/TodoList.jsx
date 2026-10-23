import { useMemo, useState } from 'react';

export function TodoList({ todos, tags = [], onStatusChange, onDelete }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [sort, setSort] = useState('created');
  const [query, setQuery] = useState('');

  const visibleTodos = useMemo(() => todos
    .filter((todo) => statusFilter === 'all' || todo.status === statusFilter)
    .filter((todo) => priorityFilter === 'all' || (todo.priority || 'medium') === priorityFilter)
    .filter((todo) => tagFilter === 'all' || todo.tags?.some((tag) => tag._id === tagFilter))
    .filter((todo) => !query.trim() || `${todo.title} ${todo.description || ''}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((first, second) => {
      if (sort === 'due') return new Date(first.dueDate || '9999-12-31') - new Date(second.dueDate || '9999-12-31');
      if (sort === 'priority') {
        const weights = { urgent: 4, high: 3, medium: 2, low: 1 };
        return weights[second.priority || 'medium'] - weights[first.priority || 'medium'];
      }
      return new Date(second.createdAt) - new Date(first.createdAt);
    }), [todos, statusFilter, priorityFilter, tagFilter, sort, query]);

  return (
    <>
      <div className="list-toolbar" aria-label="Task list filters">
        <input className="list-search" type="search" placeholder="Search tasks..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <label>View
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Done</option>
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
        {tags.length > 0 && <label>List
          <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
            <option value="all">All lists</option>
            {tags.map((tag) => <option key={tag._id} value={tag._id}>{tag.name}</option>)}
          </select>
        </label>}
        <label>Sort
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="created">Newest</option>
            <option value="due">Due date</option>
            <option value="priority">Priority</option>
          </select>
        </label>
      </div>
      {!visibleTodos.length ? <p className="empty">{todos.length ? 'No tasks match these filters.' : 'No todos yet.'}</p> : <div className="todo-list">
      {visibleTodos.map((todo) => (
        <article className="todo-card list-card" key={todo._id}>
          <div>
            <div className="list-card-heading"><span className={`priority-badge ${todo.priority || 'medium'}`}>{todo.priority || 'medium'}</span><h3>{todo.title}</h3></div>
            <p>{todo.description || 'No description'}</p>
            <small>{todo.tags?.length ? todo.tags.map((tag) => `#${tag.name}`).join(' ') : 'No tags'}</small>
          </div>
          <div className="todo-actions">
            <select value={todo.status} onChange={(event) => onStatusChange(todo._id, event.target.value)}>
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
            <button type="button" onClick={() => onDelete(todo._id)}>Delete</button>
          </div>
        </article>
      ))}
      </div>}
    </>
  );
}
