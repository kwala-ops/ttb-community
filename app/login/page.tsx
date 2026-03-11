'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Incorrect password.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r)',
        padding: '40px',
        width: '100%',
        maxWidth: '380px',
      }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', letterSpacing: '-0.3px', marginBottom: '4px' }}>
            The Network
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            Muslim Entrepreneurs · Toronto
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoFocus
            style={{
              width: '100%',
              padding: '10px 14px',
              border: `1px solid ${error ? '#c0392b' : 'var(--border)'}`,
              borderRadius: '8px',
              fontSize: '15px',
              background: 'var(--bg)',
              color: 'var(--fg)',
              outline: 'none',
            }}
          />
          {error && (
            <div style={{ fontSize: '13px', color: '#c0392b' }}>{error}</div>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              opacity: loading || !password ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Entering…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
