import { useEffect, useState } from 'react';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard.jsx';
import { KanbanBoard } from '../components/KanbanBoard.jsx';
import { SectionView } from '../components/SectionView.jsx';
import { SlaAnalytics } from '../components/SlaAnalytics.jsx';
import { TodoList } from '../components/TodoList.jsx';
import { request } from '../services/api.js';
import { AuthPage } from './AuthPage.jsx';

export function Dashboard({ user, onLogin, onLogout, authOpen, onCloseAuth, onAuthenticated }) {
  const [todos, setTodos] = useState([]);
  const [tags, setTags] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium', tagIds: [] });
  const [newTag, setNewTag] = useState('');
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('kanban');
  const [trashTodos, setTrashTodos] = useState([]);

  const minDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const completedTasks = todos.filter((todo) => todo.status === 'completed');
  const loadTodos = async () => setTodos((await request('/todos')).todos);
  const loadTrash = async () => setTrashTodos((await request('/todos/trash')).todos);
  const loadTags = async () => setTags((await request('/tags')).tags);

  useEffect(() => {
    if (!user) return;
    loadTodos().catch((requestError) => setError(requestError.message));
    loadTrash().catch((requestError) => setError(requestError.message));
    loadTags().catch((requestError) => setError(requestError.message));
  }, [user]);

  const addTodo = async (event) => {
    event.preventDefault();
    if (!user) return onLogin();
    try {
      await request('/todos', { method: 'POST', body: JSON.stringify({ ...form, tags: form.tagIds }) });
      setForm({ title: '', description: '', dueDate: '', priority: 'medium', tagIds: [] });
      await loadTodos();
    } catch (requestError) { setError(requestError.message); }
  };

  const updateStatus = async (id, status) => {
    try { await request(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); await loadTodos(); }
    catch (requestError) { setError(requestError.message); }
  };

  const deleteTodo = async (id) => {
    try { await request(`/todos/${id}`, { method: 'DELETE' }); await loadTodos(); await loadTrash(); }
    catch (requestError) { setError(requestError.message); }
  };

  const createTag = async (event) => {
    event.preventDefault();
    try { await request('/tags', { method: 'POST', body: JSON.stringify({ name: newTag }) }); setNewTag(''); setTagModalOpen(false); await loadTags(); }
    catch (requestError) { setError(requestError.message); }
  };

  const taskActions = { onStatusChange: user ? updateStatus : onLogin, onDelete: user ? deleteTodo : onLogin };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">✓</span><span>taskly</span></div>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} type="button" onClick={() => setView('dashboard')}><span>⌂</span> Dashboard</button>
          <button className={`nav-item ${['list', 'kanban'].includes(view) ? 'active' : ''}`} type="button" onClick={() => setView('kanban')}><span>▣</span> Tasks <b>{todos.filter((todo) => todo.status !== 'completed').length || ''}</b></button>
          <button className={`nav-item ${view === 'sections' ? 'active' : ''}`} type="button" onClick={() => setView('sections')}><span>☰</span> Sections</button>
          <button className={`nav-item ${view === 'sla' ? 'active' : ''}`} type="button" onClick={() => setView('sla')}><span>◷</span> SLA analytics</button>
        </nav>
        <div className="sidebar-section">
          <div className="sidebar-heading">Lists <button type="button" onClick={() => setTagModalOpen(true)}>+</button></div>
          {tags.map((tag) => <button className="list-item" type="button" key={tag._id} onClick={() => setView(`tag:${tag._id}`)}><span>#</span> {tag.name}</button>)}
          {!tags.length && <p className="sidebar-empty">Create tags like workout or office work.</p>}
        </div>
        <div className="sidebar-bottom">
          <button className={`nav-item ${view === 'completed' ? 'active' : ''}`} type="button" onClick={() => setView('completed')}><span>✓</span> Completed <b>{completedTasks.length || ''}</b></button>
          <button className={`nav-item ${view === 'trash' ? 'active' : ''}`} type="button" onClick={() => setView('trash')}><span>♜</span> Trash <b>{trashTodos.length || ''}</b></button>
        </div>
      </aside>
      <main className="workspace">
        <header className="workspace-header"><div className="workspace-title"><span className="menu-icon">☰</span><h1>My tasks</h1></div><div className="header-actions">{user ? <button className="profile-button" type="button" onClick={onLogout}><span>{user.name.charAt(0).toUpperCase()}</span>{user.name}<small>Log out</small></button> : <button className="corner-login" type="button" onClick={onLogin}>Log in / Register</button>}</div></header>
        <section className="content-column">
          {view === 'dashboard' && <AnalyticsDashboard todos={todos} />}
          {view === 'sla' && <SlaAnalytics todos={todos} />}
          {view === 'trash' && <><div className="section-header"><h2>Trash <span>{trashTodos.length || ''}</span></h2></div><section className="task-panel trash-panel">{trashTodos.length ? trashTodos.map((todo) => <article className="trash-card" key={todo._id}><strong>{todo.title}</strong><small>Deleted {new Date(todo.deletedAt).toLocaleString()}</small></article>) : <p className="empty">Deleted tasks will appear here.</p>}</section></>}
          {view === 'completed' && <><div className="section-header"><h2>Completed <span>{completedTasks.length || ''}</span></h2></div><section className="task-panel completed-panel">{completedTasks.length ? <TodoList todos={completedTasks} {...taskActions} /> : <p className="empty">Completed tasks will appear here.</p>}</section></>}
          {['kanban', 'list', 'sections'].includes(view) && <TaskWorkspace view={view} todos={todos} tags={tags} form={form} setForm={setForm} addTodo={addTodo} minDateTime={minDateTime} {...taskActions} onViewChange={setView} />}
          {view.startsWith('tag:') && <TaskWorkspace view="kanban" todos={todos.filter((todo) => todo.tags?.some((tag) => tag._id === view.slice(4)))} tags={tags} form={form} setForm={setForm} addTodo={addTodo} minDateTime={minDateTime} {...taskActions} onViewChange={setView} />}
          {error && <p className="error">{error}</p>}
        </section>
      </main>
      {tagModalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setTagModalOpen(false)}><main className="auth-card" role="dialog" aria-modal="true"><button className="modal-close" type="button" onClick={() => setTagModalOpen(false)}>×</button><span className="auth-kicker">NEW LIST TAG</span><h1>Create a tag</h1><p>Use tags to organize tasks like workout or office work.</p><form onSubmit={createTag}><input required maxLength="40" placeholder="Tag name" value={newTag} onChange={(event) => setNewTag(event.target.value)} /><button type="submit">Create tag</button></form></main></div>}
      {authOpen && <AuthPage onAuthenticated={onAuthenticated} onClose={onCloseAuth} />}
    </div>
  );
}

function TaskWorkspace({ view, todos, tags, form, setForm, addTodo, minDateTime, onStatusChange, onDelete, onViewChange }) {
  return (
    <>
      <div className="section-header"><h2>Tasks · {view === 'kanban' ? 'Kanban' : view === 'sections' ? 'Sections' : 'List'} <span>{todos.length || ''}</span></h2><div className="view-switcher"><button className={view === 'list' ? 'active' : ''} type="button" onClick={() => onViewChange('list')}>List</button><button className={view === 'sections' ? 'active' : ''} type="button" onClick={() => onViewChange('sections')}>Sections</button><button className={view === 'kanban' ? 'active' : ''} type="button" onClick={() => onViewChange('kanban')}>Kanban</button></div></div>
      <section className="task-composer panel"><form className="todo-form" onSubmit={addTodo}><input required placeholder="Task name" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><input placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><label className="form-field"><span>Due date & time</span><input required type="datetime-local" min={minDateTime} value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label><label className="form-field"><span>Priority</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label><label className="form-field"><span>Tag</span><select value={form.tagIds[0] || ''} onChange={(event) => setForm({ ...form, tagIds: event.target.value ? [event.target.value] : [] })}><option value="">No tag</option>{tags.map((tag) => <option key={tag._id} value={tag._id}>{tag.name}</option>)}</select></label><button type="submit" className="add-task-button">＋ Add task</button></form></section>
      <section className="task-panel">{view === 'kanban' ? <KanbanBoard todos={todos} onStatusChange={onStatusChange} onDelete={onDelete} /> : view === 'sections' ? <SectionView todos={todos} onStatusChange={onStatusChange} onDelete={onDelete} /> : <TodoList todos={todos} onStatusChange={onStatusChange} onDelete={onDelete} />}</section>
    </>
  );
}
