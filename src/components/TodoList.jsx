import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const FILTERS = ['all', 'active', 'done']

export default function TodoList({ session }) {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const user = session.user

  useEffect(() => {
    loadTodos()
  }, [])

  async function loadTodos() {
    setLoading(true)
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setTodos(data)
    setLoading(false)
  }

  async function addTodo(e) {
    e.preventDefault()
    const text = title.trim()
    if (!text) return
    const { data, error } = await supabase
      .from('todos')
      .insert({ title: text, user_id: user.id })
      .select()
      .single()
    if (error) return setError(error.message)
    setTodos((t) => [data, ...t])
    setTitle('')
  }

  async function toggleTodo(todo) {
    const is_complete = !todo.is_complete
    setTodos((t) => t.map((x) => (x.id === todo.id ? { ...x, is_complete } : x)))
    const { error } = await supabase.from('todos').update({ is_complete }).eq('id', todo.id)
    if (error) {
      setError(error.message)
      loadTodos()
    }
  }

  async function saveEdit(todo) {
    const text = editText.trim()
    setEditingId(null)
    if (!text || text === todo.title) return
    setTodos((t) => t.map((x) => (x.id === todo.id ? { ...x, title: text } : x)))
    const { error } = await supabase.from('todos').update({ title: text }).eq('id', todo.id)
    if (error) {
      setError(error.message)
      loadTodos()
    }
  }

  async function deleteTodo(id) {
    setTodos((t) => t.filter((x) => x.id !== id))
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) {
      setError(error.message)
      loadTodos()
    }
  }

  async function clearCompleted() {
    const ids = todos.filter((t) => t.is_complete).map((t) => t.id)
    if (!ids.length) return
    setTodos((t) => t.filter((x) => !x.is_complete))
    const { error } = await supabase.from('todos').delete().in('id', ids)
    if (error) {
      setError(error.message)
      loadTodos()
    }
  }

  const visible = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.is_complete)
    if (filter === 'done') return todos.filter((t) => t.is_complete)
    return todos
  }, [todos, filter])

  const remaining = todos.filter((t) => !t.is_complete).length

  return (
    <div className="card">
      <header className="top">
        <div>
          <h1>My Todo List</h1>
          <p className="muted small">{user.email}</p>
        </div>
        <button className="btn ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </header>

      <form onSubmit={addTodo} className="row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          maxLength={500}
          autoFocus
        />
        <button className="btn primary">Add</button>
      </form>

      {error && (
        <p className="msg error" onClick={() => setError(null)} title="Click to dismiss">
          {error}
        </p>
      )}

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted center">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="muted center">Nothing here yet.</p>
      ) : (
        <ul className="todos">
          {visible.map((todo) => (
            <li key={todo.id} className={todo.is_complete ? 'done' : ''}>
              <input
                type="checkbox"
                checked={todo.is_complete}
                onChange={() => toggleTodo(todo)}
                aria-label="Toggle complete"
              />
              {editingId === todo.id ? (
                <input
                  className="edit"
                  value={editText}
                  autoFocus
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => saveEdit(todo)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(todo)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                />
              ) : (
                <span
                  className="title"
                  onDoubleClick={() => {
                    setEditingId(todo.id)
                    setEditText(todo.title)
                  }}
                  title="Double-click to edit"
                >
                  {todo.title}
                </span>
              )}
              <button className="icon" onClick={() => deleteTodo(todo.id)} aria-label="Delete">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer className="bottom muted small">
        <span>{remaining} item{remaining === 1 ? '' : 's'} left</span>
        <button className="link" onClick={clearCompleted}>Clear completed</button>
      </footer>
    </div>
  )
}
