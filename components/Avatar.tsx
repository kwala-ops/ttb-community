'use client'

import { useState } from 'react'
import type { Member } from '@/lib/types'

type Props = {
  member: Member
  size: number
  color: string
}

export default function Avatar({ member, size, color }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const initials = `${member.first_name[0]}${member.last_name[0]}`
  const fullName = `${member.first_name} ${member.last_name}`
  const fontSize = size >= 64 ? '24px' : size >= 48 ? '17px' : '12px'

  if (member.photo_url && !imgFailed) {
    return (
      <div className="avatar" style={{ width: size, height: size, background: color }}>
        <img
          src={member.photo_url}
          alt={fullName}
          onError={() => setImgFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
        />
      </div>
    )
  }

  return (
    <div className="avatar" style={{ width: size, height: size, background: color, fontSize }}>
      {initials}
    </div>
  )
}
