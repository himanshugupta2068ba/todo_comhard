const sections = [
  { key: 'pending', title: 'To Do', tone: 'blue' },
  { key: 'in_progress', title: 'In Progress', tone: 'purple' },
  { key: 'review', title: 'Review', tone: 'yellow' },
  { key: 'completed', title: 'Done', tone: 'green' }
];

export function SectionView({ todos, onStatusChange, onDelete }) {
  return (
    <div className="section-view">
      {sections.map((section) => {
        const sectionTodos = todos.filter((todo) => todo.status === section.key);
        return (
          <section className={`task-section ${section.tone}`} key={section.key}>
            <header>
              <h2><span className="column-dot" />{section.title}</h2>
              <span>{sectionTodos.length}</span>
            </header>
            {sectionTodos.length ? sectionTodos.map((todo) => (
              <article className="section-task" key={todo._id}>
                <div>
                  <strong>{todo.title}</strong>
                  <small>
                    {todo.tags?.length ? todo.tags.map((tag) => `#${tag.name}`).join(' ') : 'No tags'}
                  </small>
                </div>
                <span className={`priority-badge ${todo.priority || 'medium'}`}>{todo.priority || 'medium'}</span>
                <small>{todo.dueDate ? `Due ${new Date(todo.dueDate).toLocaleDateString()}` : 'No due date'}</small>
                <div className="section-task-actions">
                  {section.key !== 'completed' && <button type="button" onClick={() => onStatusChange(todo._id, sections[sections.findIndex((item) => item.key === todo.status) + 1].key)}>Next →</button>}
                  <button className="delete-task" type="button" onClick={() => onDelete(todo._id)}>Delete</button>
                </div>
              </article>
            )) : <p className="section-empty">No tasks in this section.</p>}
          </section>
        );
      })}
    </div>
  );
}
