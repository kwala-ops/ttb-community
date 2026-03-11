import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const correct = process.env.SITE_PASSWORD

  if (password === correct) {
    const response = NextResponse.json({ ok: true })
    response.cookies.set('site-auth', correct!, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    return response
  }

  return NextResponse.json({ ok: false }, { status: 401 })
}
