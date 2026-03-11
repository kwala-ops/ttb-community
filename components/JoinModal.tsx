'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Company } from '@/lib/types'

const CITIES = ['Toronto','Mississauga','Ottawa','Waterloo','Hamilton','Remote','Other']
const OPEN_TO = ['Hiring','Investing','Mentorship','Referrals','Coffee chats']
const EXPERTISE_OPTIONS = [
  'AI/ML','Backend','Frontend','Mobile','Design','Product','Growth',
  'Marketing','Fintech','HealthTech','B2B SaaS','Consumer',
  'Venture Capital','Operations','Sales','Other',
]

type Props = { onClose: () => void; companies: Company[] }

export default function JoinModal({ onClose, companies }: Props) {
  const [step, setStep]       = useState<'form'|'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [photoFile, setPhotoFile]     = useState<File|null>(null)
  const [photoPreview, setPhotoPreview] = useState<string|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    role: '', company_id: '', new_company_name: '', city: '',
    bio_work: '', bio_personal: '',
    linkedin: '', twitter: '', instagram: '', github: '', website: '', contact: '',
    one_percent: '',
    tags: [] as string[],
    open_to: [] as string[],
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  function toggleArr(k: 'tags' | 'open_to', v: string) {
    setForm(f => ({
      ...f,
      [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v],
    }))
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function submit() {
    setError('')
    if (!form.first_name.trim()) return setError('First name is required.')
    if (!form.last_name.trim())  return setError('Last name is required.')
    if (!form.email.trim())      return setError('Email is required.')
    if (!form.role.trim())       return setError('Role is required.')
    if (!form.city)              return setError('City is required.')
    if (!form.bio_work.trim())   return setError('Work bio is required.')
    if (!form.bio_personal.trim()) return setError('Personal bio is required.')
    if (!form.one_percent.trim()) return setError('The 1% question is required.')
    if (form.open_to.length === 0) return setError('Please select at least one "open to" option.')

    setLoading(true)
    try {
      let photo_url: string | null = null

      if (photoFile) {
        const ext  = photoFile.name.split('.').pop()
        const path = `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, photoFile)
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        photo_url = urlData.publicUrl
      }

      let company_id = form.company_id && form.company_id !== '__new__' ? form.company_id : null
      if (form.company_id === '__new__' && form.new_company_name.trim()) {
        const { data: newCo, error: coErr } = await supabase
          .from('companies')
          .insert({ name: form.new_company_name.trim(), bio: '', status: 'pending' })
          .select('id').single()
        if (coErr) throw coErr
        company_id = newCo.id
      }

      const { error: insertErr } = await supabase.from('members').insert({
        first_name:   form.first_name.trim(),
        last_name:    form.last_name.trim(),
        email:        form.email.trim(),
        role:         form.role.trim(),
        company_id,
        city:         form.city,
        bio_work:     form.bio_work.trim(),
        bio_personal: form.bio_personal.trim(),
        tags:         form.tags,
        open_to:      form.open_to,
        linkedin:     form.linkedin.trim()  || null,
        twitter:      form.twitter.trim()   || null,
        instagram:    form.instagram.trim() || null,
        github:       form.github.trim()    || null,
        website:      form.website.trim()   || null,
        contact:      form.contact.trim()   || null,
        one_percent:  form.one_percent.trim(),
        photo_url,
        status: 'pending',
      })
      if (insertErr) throw insertErr

      setStep('success')
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : (e as { message?: string })?.message ?? 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: 600 }}>
        {step === 'success' ? (
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🌿</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 10 }}>You&apos;re in the queue</div>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Your submission is under review. Once approved, your profile will go live. Jazakallah khayran.
            </p>
            <button className="btn btn-primary" style={{ maxWidth: 200, margin: '0 auto' }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <button className="modal-close" onClick={onClose}>✕</button>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Add yourself to the directory</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Every submission is reviewed before going live.</div>
            </div>

            <div className="modal-body">

              {/* Photo */}
              <div className="form-group">
                <label className="form-label">Profile photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {photoPreview
                    ? <img src={photoPreview} alt="preview" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                    : <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--tag-bg)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 22 }}>👤</div>
                  }
                  <div>
                    <button className="chip" style={{ fontSize: 12 }} onClick={() => fileRef.current?.click()}>
                      {photoPreview ? 'Change photo' : 'Upload photo'}
                    </button>
                    <div className="form-hint" style={{ marginTop: 4 }}>JPG or PNG, max 5MB</div>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
                </div>
              </div>

              {/* Name */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First name <span>*</span></label>
                  <input className="form-input" value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Ahmad" />
                </div>
                <div className="form-group">
                  <label className="form-label">Last name <span>*</span></label>
                  <input className="form-input" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Al-Farsi" />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email <span>*</span></label>
                <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ahmad@example.com" />
                <div className="form-hint">Only visible to admins. Never shown publicly.</div>
              </div>

              {/* Role */}
              <div className="form-group">
                <label className="form-label">Role / title <span>*</span></label>
                <input className="form-input" value={form.role} onChange={e => set('role', e.target.value)} placeholder="Founder, Senior Engineer, Product Designer…" />
              </div>

              {/* Company */}
              <div className="form-group">
                <label className="form-label">Company</label>
                <select className="form-select" value={form.company_id} onChange={e => set('company_id', e.target.value)}>
                  <option value="">Select existing company…</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="__new__">+ Add a new company</option>
                </select>
                {form.company_id === '__new__' && (
                  <input className="form-input" style={{ marginTop: 8 }} value={form.new_company_name} onChange={e => set('new_company_name', e.target.value)} placeholder="Company name" />
                )}
              </div>

              {/* City */}
              <div className="form-group">
                <label className="form-label">City <span>*</span></label>
                <select className="form-select" value={form.city} onChange={e => set('city', e.target.value)}>
                  <option value="">Select city…</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Work bio */}
              <div className="form-group">
                <label className="form-label">Work bio <span>*</span></label>
                <textarea
                  className="form-textarea"
                  value={form.bio_work}
                  onChange={e => set('bio_work', e.target.value)}
                  placeholder="What do you do professionally? What are you building or working on right now?"
                  maxLength={400}
                />
                <div className="form-hint">{form.bio_work.length}/400 characters</div>
              </div>

              {/* Personal bio */}
              <div className="form-group">
                <label className="form-label">Personal bio <span>*</span></label>
                <textarea
                  className="form-textarea"
                  value={form.bio_personal}
                  onChange={e => set('bio_personal', e.target.value)}
                  placeholder="Who are you outside of work? Interests, background, what makes you you."
                  maxLength={400}
                />
                <div className="form-hint">{form.bio_personal.length}/400 characters</div>
              </div>

              {/* Expertise */}
              <div className="form-group">
                <label className="form-label">Expertise</label>
                <div className="checkbox-group">
                  {EXPERTISE_OPTIONS.map(t => (
                    <label key={t} className={`checkbox-chip${form.tags.includes(t) ? ' checked' : ''}`}>
                      <input type="checkbox" checked={form.tags.includes(t)} onChange={() => toggleArr('tags', t)} />
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              {/* Open to */}
              <div className="form-group">
                <label className="form-label">Open to <span>*</span></label>
                <div className="checkbox-group">
                  {OPEN_TO.map(o => (
                    <label key={o} className={`checkbox-chip${form.open_to.includes(o) ? ' checked' : ''}`}>
                      <input type="checkbox" checked={form.open_to.includes(o)} onChange={() => toggleArr('open_to', o)} />
                      {o}
                    </label>
                  ))}
                </div>
              </div>

              {/* Socials */}
              <div className="section-label">Socials & links <span style={{ fontFamily: 'var(--font-body)', textTransform: 'none', letterSpacing: 0, color: 'var(--muted)', fontSize: 11 }}>(optional)</span></div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">LinkedIn</label>
                  <input className="form-input" value={form.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" />
                </div>
                <div className="form-group">
                  <label className="form-label">X / Twitter</label>
                  <input className="form-input" value={form.twitter} onChange={e => set('twitter', e.target.value)} placeholder="https://x.com/username" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Instagram</label>
                  <input className="form-input" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="https://instagram.com/username" />
                </div>
                <div className="form-group">
                  <label className="form-label">GitHub</label>
                  <input className="form-input" value={form.github} onChange={e => set('github', e.target.value)} placeholder="https://github.com/username" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Personal website</label>
                <input className="form-input" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://yoursite.com" />
              </div>

              {/* Contact */}
              <div className="form-group">
                <label className="form-label">Preferred contact link</label>
                <input className="form-input" value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="https://cal.com/you  or  mailto:you@email.com" />
                <div className="form-hint">This is what people click when they want to reach you.</div>
              </div>

              {/* 1% */}
              <div className="form-group">
                <label className="form-label">If you could donate 1% of your time, what would it be for? <span>*</span></label>
                <textarea
                  className="form-textarea"
                  value={form.one_percent}
                  onChange={e => set('one_percent', e.target.value)}
                  placeholder="Be honest. This is the part people remember."
                  maxLength={300}
                  style={{ minHeight: 70 }}
                />
              </div>

              {error && (
                <div style={{ background: '#FFE0D8', color: '#B5451B', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 8 }}>
                  {error}
                </div>
              )}

              <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={submit} disabled={loading}>
                {loading ? 'Submitting…' : 'Submit for review →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
