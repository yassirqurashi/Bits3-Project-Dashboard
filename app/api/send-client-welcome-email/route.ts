import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '../../../lib/supabase/config'
import { sendGmailMessage } from '../../../lib/email/gmail'
import { buildClientWelcomeEmail } from '../../../lib/email/client-welcome-notifications'
import { getClientLoginUrl } from '../../../lib/email/client-links'

export async function POST(request: Request) {
  try {
    const { clientId, password } = await request.json()

    if (!clientId) {
      return NextResponse.json({ error: 'Client is required' }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ error: 'Password is required for the welcome email' }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY')
    }

    const supabaseAdmin = createClient(getSupabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, name, email')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    if (!client.email) {
      return NextResponse.json({ error: 'Client email is missing' }, { status: 400 })
    }

    const email = buildClientWelcomeEmail({
      clientName: client.name || 'Client',
      username: client.email,
      password,
      clientDashboardLink: getClientLoginUrl(),
    })

    await sendGmailMessage({
      to: client.email,
      subject: email.subject,
      body: email.body,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Client welcome email failed', error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to send client welcome email' },
      { status: 500 }
    )
  }
}
