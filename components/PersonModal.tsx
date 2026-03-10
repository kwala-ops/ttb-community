'use client'

import type { Member, Company } from '@/lib/types'
import Avatar from './Avatar'

const SOCIAL_ICON: Record<string, string> = {
  linkedin:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>`,
  twitter:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`,
  github:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
  website:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>`,
}
const SOCIAL_LABEL: Record<string, string> = {
  linkedin: 'LinkedIn', twitter: 'X / Twitter', instagram: 'Instagram', github: 'GitHub', website: 'Website',
}

type Props = {
  member: Member
  company: Company | null
  color: string
  onClose: () => void
  onViewCompany: (id: string) => void
}

export default function PersonModal({ member, company, color, onClose, onViewCompany }: Props) {
  const fullName = `${member.first_name} ${member.last_name}`

  // Build social links — stored as full URLs
  const socials = [
    member.linkedin  && ['linkedin',  member.linkedin],
    member.twitter   && ['twitter',   member.twitter],
    member.instagram && ['instagram', member.instagram],
    member.github    && ['github',    member.github],
    member.website   && ['website',   member.website],
  ].filter(Boolean) as [string, string][]

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}>✕</button>
          <div className="person-top">
            <Avatar member={member} size={64} color={color} />
            <div>
              <div className="modal-name">{fullName}</div>
              <div className="modal-role">
                {member.role}{company && <> · <strong>{company.name}</strong></>}
              </div>
              {company && (
                <div className="modal-co-link" onClick={() => onViewCompany(company.id)}>
                  ↗ View company profile
                </div>
              )}
              <div className="modal-city">📍 {member.city}</div>
            </div>
          </div>
        </div>

        <div className="modal-body">
          {/* Career bio */}
          <div className="section-label" style={{ marginTop: 0 }}>Work</div>
          <div className="modal-bio">{member.bio_work}</div>

          {/* Personal bio */}
          {member.bio_personal && <>
            <div className="section-label">Outside of work</div>
            <div className="modal-bio">{member.bio_personal}</div>
          </>}

          {(member.tags || []).length > 0 && <>
            <div className="section-label">Expertise</div>
            <div className="modal-tags">
              {(member.tags || []).map(t => <span key={t} className="modal-tag">{t}</span>)}
            </div>
          </>}

          {(member.open_to || []).length > 0 && <>
            <div className="section-label">Open to</div>
            <div className="modal-tags">
              {(member.open_to || []).map(o => <span key={o} className="modal-tag open">↗ {o}</span>)}
            </div>
          </>}

          {socials.length > 0 && <>
            <div className="section-label">Find online</div>
            <div className="social-links">
              {socials.map(([platform, url]) => (
                <a
                  key={platform}
                  className="social-link"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                >
                  <span dangerouslySetInnerHTML={{ __html: SOCIAL_ICON[platform] }} />
                  {SOCIAL_LABEL[platform]}
                </a>
              ))}
            </div>
          </>}

          {member.one_percent && <>
            <div className="section-label">If I could donate 1% of my time…</div>
            <div className="one-percent-block">
              <div className="one-percent-text">{member.one_percent}</div>
            </div>
          </>}

          {member.contact && (
            <a href={member.contact} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-primary">
                Connect with {member.first_name} →
              </button>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
