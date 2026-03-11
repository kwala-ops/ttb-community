'use client'

import type { Member, Company } from '@/lib/types'
import Avatar from './Avatar'

type Props = {
  company: Company
  team: Member[]
  coColor: string
  memberColor: (id: string) => string
  onClose: () => void
  onViewMember: (id: string) => void
}

export default function CompanyModal({ company, team, coColor, memberColor, onClose, onViewMember }: Props) {
  const initials = company.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}>✕</button>
          <div className="co-modal-top">
            <div className="co-modal-logo" style={{ color: coColor }}>{initials}</div>
            <div>
              <div className="co-modal-name">{company.name}</div>
              <div className="co-meta" style={{ marginTop: 6, marginBottom: 0 }}>
                {company.industry && <span className="co-industry">{company.industry}</span>}
              </div>
              {company.website && (
                <a className="co-modal-website" href={company.website} target="_blank" rel="noopener noreferrer">
                  {company.website.replace('https://', '')}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="modal-body">
          <div className="section-label" style={{ marginTop: 0 }}>About</div>
          <div className="modal-bio">{company.bio}</div>

          <div className="section-label">Team in the network</div>
          <div className="team-grid">
            {team.length === 0
              ? <p style={{ fontSize: 13, color: 'var(--muted)' }}>No members listed yet.</p>
              : team.map(m => (
                  <div key={m.id} className="team-member" onClick={() => onViewMember(m.id)}>
                    <Avatar member={m} size={32} color={memberColor(m.id)} />
                    <div>
                      <div className="team-name">{m.first_name} {m.last_name}</div>
                      <div className="team-role">{m.role}</div>
                    </div>
                  </div>
                ))
            }
          </div>

          {company.website && (
            <a href={company.website} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-outline">Visit website →</button>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
