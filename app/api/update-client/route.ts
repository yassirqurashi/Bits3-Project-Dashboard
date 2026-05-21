import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      clientId,
      name,
      email,
      password,
      logo_url,
      primary_color,
      secondary_color,
    } = body

    if (!clientId || !name || !email) {
      return NextResponse.json(
        { error: 'Client, name, and email are required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: client, error: clientFetchError } = await supabaseAdmin
      .from('clients')
      .select('id, user_id')
      .eq('id', clientId)
      .single()

    if (clientFetchError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    if (client.user_id) {
      const authUpdates: { email: string; password?: string } = { email }

      if (password) {
        authUpdates.password = password
      }

      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        client.user_id,
        authUpdates
      )

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }
    }

    const { error: clientUpdateError } = await supabaseAdmin
      .from('clients')
      .update({
        name,
        email,
        logo_url,
        primary_color,
        secondary_color,
      })
      .eq('id', clientId)

    if (clientUpdateError) {
      return NextResponse.json({ error: clientUpdateError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 }
    )
  }
}
