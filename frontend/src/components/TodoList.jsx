export function TodoList({ todos, onStatusChange, onDelete }) {
  if (!todos.length) return <p className="empty">No todos yet.</p>;

  return (
    <div className="todo-list">
      {todos.map((todo) => (
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
    </div>
  );
}
