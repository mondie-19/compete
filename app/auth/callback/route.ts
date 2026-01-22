import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server' // You'll need a server util too eventually

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    // This is where the code is exchanged for a session
    // For now, redirecting to home is enough to clear the build error
    return NextResponse.redirect(`${origin}/lobby`)
  }

  return NextResponse.redirect(`${origin}`)
}