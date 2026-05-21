import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '../../../lib/supabase/config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, logo_url, primary_color, secondary_color } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      getSupabaseUrl(),
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const { error: clientError } = await supabaseAdmin.from('clients').insert({
      name,
      email,
      user_id: authData.user.id,
      logo_url,
      primary_color,
      secondary_color,
    })

    if (clientError) {
      return NextResponse.json({ error: clientError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}
