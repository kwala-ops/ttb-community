'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Member, Company } from '@/lib/types'
import PersonModal from '@/components/PersonModal'
import CompanyModal from '@/components/CompanyModal'
import JoinModal from '@/components/JoinModal'
import Avatar from '@/components/Avatar'

const COLORS = ['#2D6A4F','#40916C','#52B788','#C8935A','#B5451B','#6D4C41','#1B4F72','#4A235A','#7D6608','#1A5276']
const memberColor = (id: string) => COLORS[parseInt(id.replace(/-/g,'').slice(0,8), 16) % COLORS.length]
const coColor     = (id: string) => COLORS[(parseInt(id.replace(/-/g,'').slice(0,8), 16) + 3) % COLORS.length]

const CITIES     = ['Toronto','Mississauga','Ottawa','Waterloo','Hamilton','Remote']
const OPEN_TO    = ['Hiring','Investing','Mentorship','Referrals','Coffee chats']
const INDUSTRIES = ['Fintech','HealthTech','Consumer','Design','Venture','Agency','SaaS','Other']

const fullName = (m: Member) => `${m.first_name} ${m.last_name}`
const initials = (m: Member) => `${m.first_name[0]}${m.last_name[0]}`
const coInitials = (name: string) => name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')

export default function Home() {
  const [page, setPage]           = useState<'people'|'companies'>('people')
  const [members, setMembers]     = useState<Member[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading]     = useState(true)

  const [pSearch, setPSearch] = useState('')
  const [pCity,   setPCity]   = useState('all')
  const [pOpen,   setPOpen]   = useState('all')

  const [cSearch, setCSearch] = useState('')
  const [cInd,    setCInd]    = useState('all')

  const [selectedMember,  setSelectedMember]  = useState<Member|null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company|null>(null)
  const [showJoin,        setShowJoin]         = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: m }, { data: c }] = await Promise.all([
        supabase
          .from('members')
          .select('id,first_name,last_name,role,company_id,city,bio_work,bio_personal,tags,open_to,linkedin,twitter,instagram,github,website,contact,photo_url,one_percent,status,created_at,last_updated_at')
          .eq('status', 'approved')
          .order('last_name'),
        supabase.from('companies').select('*').eq('status', 'approved').order('name'),
      ])
      setMembers(m || [])
      setCompanies(c || [])
      setLoading(false)
    }
    load()
  }, [])

  const getCompany = useCallback((id: string | null) => companies.find(c => c.id === id) || null, [companies])
  const getTeam    = useCallback((coId: string)      => members.filter(m => m.company_id === coId), [members])

  const filteredMembers = members.filter(m => {
    const co = m.company_id ? getCompany(m.company_id) : null
    const s  = pSearch.toLowerCase()
    return (
      (!s || [fullName(m), m.role, co?.name || '', m.bio_work, m.bio_personal, ...(m.tags || [])].some(v => v?.toLowerCase().includes(s)))
      && (pCity === 'all' || m.city === pCity)
      && (pOpen === 'all' || (m.open_to || []).includes(pOpen))
    )
  })

  const filteredCompanies = companies.filter(co => {
    const s = cSearch.toLowerCase()
    return (
      (!s || [co.name, co.industry || '', co.bio].some(v => v?.toLowerCase().includes(s)))
      && (cInd === 'all' || co.industry === cInd)
    )
  })

  function openCompany(id: string) {
    const co = companies.find(c => c.id === id)
    if (co) { setSelectedMember(null); setSelectedCompany(co); setPage('companies') }
  }

  function openMember(id: string) {
    const m = members.find(x => x.id === id)
    if (m) { setSelectedCompany(null); setSelectedMember(m); setPage('people') }
  }

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <a className="wordmark" href="/" onClick={e => { e.preventDefault(); setPage('people') }}>
            <span className="wordmark-main">Toronto Tech Brothers</span>
            <span className="wordmark-sub">Muslim Entrepreneurs · Toronto</span>
          </a>
          <div className="nav-tabs">
            <button className={`nav-tab${page === 'people'    ? ' active' : ''}`} onClick={() => setPage('people')}>People</button>
            <button className={`nav-tab${page === 'companies' ? ' active' : ''}`} onClick={() => setPage('companies')}>Companies</button>
          </div>
          <button className="header-cta" onClick={() => setShowJoin(true)}>Add yourself →</button>
        </div>
      </header>

      {/* ── PEOPLE ── */}
      {page === 'people' && (
        <>
          <div className="hero">
            <div className="hero-inner">
              <div>
                <h1>Know who&apos;s<br />in <em>the room.</em></h1>
                <p className="hero-desc">Muslim entrepreneurs, founders, engineers, and operators — all in one place. Find who you need, when you need them.</p>
              </div>
              <div className="hero-stats">
                <div><div className="stat-num">{members.length || '—'}</div><div className="stat-label">Members</div></div>
                <div><div className="stat-num">{[...new Set(members.map(m => m.city))].length || '—'}</div><div className="stat-label">Cities</div></div>
              </div>
            </div>
          </div>

          <div className="controls">
            <div className="controls-inner">
              <div className="search-wrap">
                <span className="search-icon">⌕</span>
                <input className="search-input" placeholder="Search name, role, expertise…" value={pSearch} onChange={e => setPSearch(e.target.value)} />
              </div>
              <div className="filter-row">
                <span className="filter-label">City</span>
                {['all', ...CITIES].map(v => (
                  <button key={v} className={`chip${pCity === v ? ' active' : ''}`} onClick={() => setPCity(v)}>{v === 'all' ? 'All' : v}</button>
                ))}
              </div>
              <div className="filter-row">
                <span className="filter-label">Open to</span>
                {['all', ...OPEN_TO].map(v => (
                  <button key={v} className={`chip${pOpen === v ? ' active' : ''}`} onClick={() => setPOpen(v)}>{v === 'all' ? 'All' : v}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="results-meta">
            <div className="results-meta-inner">
              <span className="results-count">
                {loading ? 'Loading…' : filteredMembers.length === members.length
                  ? `Showing all ${members.length} members`
                  : `${filteredMembers.length} of ${members.length} members`}
              </span>
            </div>
          </div>

          <div className="grid">
            {loading ? <div className="loading">Loading members…</div> :
             filteredMembers.length === 0 ? (
               <div className="empty"><div className="empty-icon">◎</div><h3>No results</h3><p>Try adjusting your search or filters.</p></div>
             ) : filteredMembers.map((m, i) => {
               const co = m.company_id ? getCompany(m.company_id) : null
               return (
                 <div key={m.id} className="card" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => setSelectedMember(m)}>
                   <div className="card-top">
                     <Avatar member={m} size={48} color={memberColor(m.id)} />
                     <div style={{ minWidth: 0, flex: 1 }}>
                       <div className="card-name">{fullName(m)}</div>
                       <div className="card-role">{m.role}{co && <> · <strong>{co.name}</strong></>}</div>
                       {co && <span className="card-co-link" onClick={e => { e.stopPropagation(); openCompany(co.id) }}>View company →</span>}
                       <div className="card-city">📍 {m.city}</div>
                     </div>
                   </div>
                   <div className="card-bio">{m.bio_work}</div>
                   <div className="tags">
                     {(m.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
                     {(m.open_to || []).slice(0, 1).map(o => <span key={o} className="tag open">↗ {o}</span>)}
                   </div>
                   <div className="card-footer">
                     <span className="open-to-label">Open to {(m.open_to || []).length} thing{(m.open_to || []).length !== 1 ? 's' : ''}</span>
                     <span className="reach-out">View profile →</span>
                   </div>
                 </div>
               )
             })}
          </div>
        </>
      )}

      {/* ── COMPANIES ── */}
      {page === 'companies' && (
        <>
          <div className="hero">
            <div className="hero-inner">
              <div>
                <h1>The <em>companies</em><br />behind the people.</h1>
                <p className="hero-desc">Startups, agencies, and businesses run by members of the network. Click any company to see who&apos;s involved.</p>
              </div>
              <div className="hero-stats">
                <div><div className="stat-num">{companies.length || '—'}</div><div className="stat-label">Companies</div></div>
                <div><div className="stat-num">{[...new Set(companies.map(c => c.industry))].length || '—'}</div><div className="stat-label">Industries</div></div>
              </div>
            </div>
          </div>

          <div className="controls">
            <div className="controls-inner">
              <div className="search-wrap">
                <span className="search-icon">⌕</span>
                <input className="search-input" placeholder="Search company, industry…" value={cSearch} onChange={e => setCSearch(e.target.value)} />
              </div>
              <div className="filter-row">
                <span className="filter-label">Industry</span>
                {['all', ...INDUSTRIES].map(v => (
                  <button key={v} className={`chip${cInd === v ? ' active' : ''}`} onClick={() => setCInd(v)}>{v === 'all' ? 'All' : v}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="results-meta">
            <div className="results-meta-inner">
              <span className="results-count">
                {loading ? 'Loading…' : filteredCompanies.length === companies.length
                  ? `Showing all ${companies.length} companies`
                  : `${filteredCompanies.length} of ${companies.length} companies`}
              </span>
            </div>
          </div>

          <div className="companies-grid">
            {loading ? <div className="loading">Loading companies…</div> :
             filteredCompanies.length === 0 ? (
               <div className="empty"><div className="empty-icon">◎</div><h3>No results</h3><p>Try adjusting your search or filters.</p></div>
             ) : filteredCompanies.map((co, i) => {
               const team = getTeam(co.id)
               return (
                 <div key={co.id} className="co-card" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => setSelectedCompany(co)}>
                   <div className="co-logo" style={{ color: coColor(co.id) }}>{coInitials(co.name)}</div>
                   <div className="co-name">{co.name}</div>
                   <div className="co-meta">
                     {co.industry && <span className="co-industry">{co.industry}</span>}
                   </div>
                   <div className="co-bio">{co.bio}</div>
                   <div className="co-footer">
                     <span className="co-member-count">{team.length} member{team.length !== 1 ? 's' : ''} in network</span>
                     <div className="co-avatars">
                       {team.slice(0, 4).map(m => (
                         <div key={m.id} className="co-avatar-mini" style={{ background: memberColor(m.id) }} title={fullName(m)}>
                           {m.photo_url
                             ? <img src={m.photo_url} alt={fullName(m)} />
                             : initials(m)}
                         </div>
                       ))}
                       {team.length > 4 && (
                         <div className="co-avatar-mini" style={{ background: 'var(--muted)', fontStyle: 'normal', fontSize: '8px', fontFamily: 'var(--font-mono)' }}>
                           +{team.length - 4}
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               )
             })}
          </div>
        </>
      )}

      <footer>
        <div className="footer-inner">
          <span className="footer-text">Members only · Not publicly indexed</span>
          <span className="footer-bismillah">بِسْمِ اللَّهِ</span>
        </div>
      </footer>

      {selectedMember && (
        <PersonModal
          member={selectedMember}
          company={selectedMember.company_id ? getCompany(selectedMember.company_id) : null}
          color={memberColor(selectedMember.id)}
          onClose={() => setSelectedMember(null)}
          onViewCompany={id => { setSelectedMember(null); openCompany(id) }}
        />
      )}
      {selectedCompany && (
        <CompanyModal
          company={selectedCompany}
          team={getTeam(selectedCompany.id)}
          coColor={coColor(selectedCompany.id)}
          memberColor={memberColor}
          onClose={() => setSelectedCompany(null)}
          onViewMember={id => { setSelectedCompany(null); openMember(id) }}
        />
      )}
      {showJoin && <JoinModal onClose={() => setShowJoin(false)} companies={companies} />}
    </>
  )
}
