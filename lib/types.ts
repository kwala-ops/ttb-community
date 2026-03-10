export type Member = {
  id: string
  first_name: string
  last_name: string
  email: string          // admin-only — never rendered in public UI
  role: string
  company_id: string | null
  city: string
  bio_work: string
  bio_personal: string
  tags: string[]
  open_to: string[]
  linkedin: string | null
  twitter: string | null
  instagram: string | null
  github: string | null
  website: string | null
  contact: string | null
  photo_url: string | null
  one_percent: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  last_updated_at: string
}

export type Company = {
  id: string
  name: string
  bio: string
  website: string | null
  industry: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  last_updated_at: string
}
