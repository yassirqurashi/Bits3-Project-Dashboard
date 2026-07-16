import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '../../../lib/supabase/config'
import { sendGmailMessage } from '../../../lib/email/gmail'
import { buildClientChatOpenedEmail } from '../../../lib/email/chat-notifications'
import { getClientLoginUrl } from '../../../lib/email/client-links'

export async function POST(request: Request) {
  try {
    const { requestId } = await request.json()

    if (!requestId) {
      return NextResponse.json({ error: 'Chat is required' }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY')
    }

    const supabaseAdmin = createClient(getSupabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { data: chat, error: chatError } = await supabaseAdmin
      .from('client_requests')
      .select('id, client_id, project_id, subject, description, status, created_by')
      .eq('id', requestId)
      .single()

    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, name, email')
      .eq('id', chat.client_id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    if (!client.email) {
      return NextResponse.json({ error: 'Client email is missing' }, { status: 400 })
    }

    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('id, name')
      .eq('id', chat.project_id)
      .single()

    const email = buildClientChatOpenedEmail({
      clientName: client.name || 'Client',
      projectName: project?.name || 'Project',
      chatSubject: chat.subject || 'New Chat',
      chatDescription: chat.description || '',
      createdDate: new Date().toLocaleDateString('en-GB'),
      clientChatLink: getClientLoginUrl(),
    })

    await sendGmailMessage({
      to: client.email,
      subject: email.subject,
      body: email.body,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Client chat opened email failed', error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to send client chat notification' },
      { status: 500 }
    )
  }
}
