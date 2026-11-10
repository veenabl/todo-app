import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  const redirectTo = window.location.origin

  async function handleGoogle() {
    setMsg(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) setMsg({ type: 'error', text: error.message })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        })
        if (error) throw error
        if (!data.session) {
          setMsg({ type: 'ok', text: 'Check your inbox to confirm your email, then sign in.' })
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
        if (error) throw error
        setMsg({ type: 'ok', text: 'Password reset link sent. Check your inbox.' })
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  const title = { signin: 'Sign in', signup: 'Create account', reset: 'Reset password' }[mode]

  return (
    <div className="card auth">
      <h1>My Todo List</h1>
      <p className="muted">{title}</p>

      {mode !== 'reset' && (
        <>
          <button className="btn google" onClick={handleGoogle} type="button">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>
          <div className="divider"><span>or</span></div>
        </>
      )}

      <form onSubmit={handleSubmit} className="stack">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        {mode !== 'reset' && (
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
        )}
        <button className="btn primary" disabled={busy}>
          {busy ? 'Please wait…' : title}
        </button>
      </form>

      {msg && <p className={`msg ${msg.type}`}>{msg.text}</p>}

      <div className="links">
        {mode === 'signin' && (
          <>
            <button className="link" onClick={() => setMode('signup')}>Create an account</button>
            <button className="link" onClick={() => setMode('reset')}>Forgot password?</button>
          </>
        )}
        {mode !== 'signin' && (
          <button className="link" onClick={() => setMode('signin')}>Back to sign in</button>
        )}
      </div>
    </div>
  )
}
