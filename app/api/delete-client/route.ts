import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { clientId } = await request.json()

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
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
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(client.user_id)

      if (authDeleteError) {
        return NextResponse.json({ error: authDeleteError.message }, { status: 400 })
      }
    }

    const { error: clientDeleteError } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', clientId)

    if (clientDeleteError) {
      return NextResponse.json({ error: clientDeleteError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}
