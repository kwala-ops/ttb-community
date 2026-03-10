'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Member, Company } from '@/lib/types'

export default function AdminPage() {
  const [authed, setAuthed]       = useState(false)
  const [password, setPassword]   = useState('')
  const [pwError, setPwError]     = useState('')
  const [tab, setTab]             = useState<'members'|'companies'>('members')
  const [members,   setMembers]   = useState<Member[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading]     = useState(false)
  const [filter, setFilter]       = useState<'pending'|'approved'|'rejected'>('pending')

  function login() {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'changeme123') {
      setAuthed(true)
      load()
    } else {
      setPwError('Wrong password.')
    }
  }

  async function load() {
    setLoading(true)
    const [{ data: m }, { data: c }] = await Promise.all([
      supabase.from('members').select('*').order('created_at', { ascending: false }),
      supabase.from('companies').select('*').order('created_at', { ascending: false }),
    ])
    setMembers(m || [])
    setCompanies(c || [])
    setLoading(false)
  }

  async function updateMember(id: string, status: string) {
    await supabase.from('members').update({ status }).eq('id', id)
    setMembers(ms => ms.map(m => m.id === id ? { ...m, status: status as Member['status'] } : m))
  }

  async function updateCompany(id: string, status: string) {
    await supabase.from('companies').update({ status }).eq('id', id)
    setCompanies(cs => cs.map(c => c.id === id ? { ...c, status: status as Company['status'] } : c))
  }

  const filteredMembers   = members.filter(m => m.status === filter)
  const filteredCompanies = companies.filter(c => c.status === filter)

  const pendingMCount = members.filter(m => m.status === 'pending').length
  const pendingCCount = companies.filter(c => c.status === 'pending').length

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 16, padding: 40, width: 360 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 6 }}>Admin</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 24 }}>The Network · Directory management</div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Enter admin password"
              autoFocus
            />
            {pwError && <div style={{ fontSize: 12, color: '#B5451B', marginTop: 4 }}>{pwError}</div>}
          </div>
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={login}>Enter →</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <header className="header">
        <div className="header-inner">
          <div className="wordmark">
            <span className="wordmark-main">The Network</span>
            <span className="wordmark-sub">Admin · Directory management</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <a href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', alignSelf: 'center' }}>← Back to directory</a>
            <button className="header-cta" onClick={load}>Refresh</button>
          </div>
        </div>
      </header>

      <div className="admin-wrap">
        <div className="admin-title">Submissions</div>
        <div className="admin-sub">
          {pendingMCount + pendingCCount} pending · {members.filter(m=>m.status==='approved').length + companies.filter(c=>c.status==='approved').length} approved
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['pending','approved','rejected'] as const).map(s => (
            <button key={s} className={`chip${filter===s?' active':''}`} onClick={() => setFilter(s)} style={{ textTransform: 'capitalize' }}>{s}</button>
          ))}
        </div>

        {/* Tab: Members / Companies */}
        <div className="admin-tabs">
          <button className={`admin-tab${tab==='members'?  ' active':''}`} onClick={()=>setTab('members')}>
            Members {tab==='members' && `(${filteredMembers.length})`}
          </button>
          <button className={`admin-tab${tab==='companies'?' active':''}`} onClick={()=>setTab('companies')}>
            Companies {tab==='companies' && `(${filteredCompanies.length})`}
          </button>
        </div>

        {loading && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>Loading…</div>}

        {/* MEMBERS */}
        {tab === 'members' && filteredMembers.map(m => (
          <div key={m.id} className="submission-card">
            <div className="submission-header">
              <div>
                <div className="submission-name">{`${m.first_name} ${m.last_name}`}</div>
                <div className="submission-meta">{m.role} · {m.city} · {new Date(m.created_at).toLocaleDateString()}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', marginTop: 3 }}>✉ {m.email}</div>
              </div>
              <span className={`status-badge status-${m.status}`}>{m.status}</span>
            </div>
            <div className="submission-bio">{m.bio_work}</div>
            {m.bio_personal && <div className="submission-bio" style={{ marginTop: 6, fontStyle: 'italic' }}>{m.bio_personal}</div>}
            {m.tags?.length > 0 && (
              <div className="tags" style={{ marginBottom: 12 }}>
                {m.tags.map((t:string) => <span key={t} className="tag">{t}</span>)}
              </div>
            )}
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
              Open to: {(m.open_to||[]).join(', ') || '—'}
            </div>
            {m.linkedin  && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>{m.linkedin}</div>}
            {m.one_percent && <div style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--fg)', marginBottom: 14, borderLeft: '3px solid var(--accent)', paddingLeft: 12 }}>{m.one_percent}</div>}
            {m.photo_url && <img src={m.photo_url} alt={`${m.first_name} ${m.last_name}`} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginBottom: 14 }}/>}
            <div className="submission-actions">
              {m.status !== 'approved' && <button className="approve-btn" onClick={() => updateMember(m.id, 'approved')}>✓ Approve</button>}
              {m.status !== 'rejected' && <button className="reject-btn"  onClick={() => updateMember(m.id, 'rejected')}>✕ Reject</button>}
              {m.status !== 'pending'  && <button className="chip"        onClick={() => updateMember(m.id, 'pending')}>Move to pending</button>}
            </div>
          </div>
        ))}

        {tab === 'members' && filteredMembers.length === 0 && !loading && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', padding: '32px 0' }}>No {filter} member submissions.</div>
        )}

        {/* COMPANIES */}
        {tab === 'companies' && filteredCompanies.map(c => (
          <div key={c.id} className="submission-card">
            <div className="submission-header">
              <div>
                <div className="submission-name">{c.name}</div>
                <div className="submission-meta">{c.industry||'No industry'} · {c.stage||'No stage'} · {new Date(c.created_at).toLocaleDateString()}</div>
              </div>
              <span className={`status-badge status-${c.status}`}>{c.status}</span>
            </div>
            <div className="submission-bio">{c.bio || <em style={{ color: 'var(--muted)' }}>No bio yet</em>}</div>
            {c.website && <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 14 }}>{c.website}</div>}
            <div className="submission-actions">
              {c.status !== 'approved' && <button className="approve-btn" onClick={() => updateCompany(c.id, 'approved')}>✓ Approve</button>}
              {c.status !== 'rejected' && <button className="reject-btn"  onClick={() => updateCompany(c.id, 'rejected')}>✕ Reject</button>}
              {c.status !== 'pending'  && <button className="chip"        onClick={() => updateCompany(c.id, 'pending')}>Move to pending</button>}
            </div>
          </div>
        ))}

        {tab === 'companies' && filteredCompanies.length === 0 && !loading && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', padding: '32px 0' }}>No {filter} company submissions.</div>
        )}
      </div>
    </div>
  )
}
