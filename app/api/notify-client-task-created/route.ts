import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '../../../lib/supabase/config'
import { sendGmailMessage } from '../../../lib/email/gmail'
import { buildClientTaskCreatedEmail } from '../../../lib/email/client-task-notifications'

const getClientTaskLink = () => {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''
  const baseUrl = explicitUrl || vercelUrl || 'http://localhost:3000'

  return `${baseUrl.replace(/\/$/, '')}/client-tasks`
}

const formatDate = (date: string | null | undefined) => {
  if (!date) return 'Not set'
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('en-GB')
}

export async function POST(request: Request) {
  try {
    const { taskId } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: 'Client task is required' }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY')
    }

    const supabaseAdmin = createClient(getSupabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { data: task, error: taskError } = await supabaseAdmin
      .from('client_tasks')
      .select('id, client_id, project_id, title, creation_date, due_date, status')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Client task not found' }, { status: 404 })
    }

    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, name, email')
      .eq('id', task.client_id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    if (!client.email) {
      return NextResponse.json({ error: 'Client email is missing' }, { status: 400 })
    }

    const { data: project } = task.project_id
      ? await supabaseAdmin
        .from('projects')
        .select('id, name')
        .eq('id', task.project_id)
        .single()
      : { data: null }

    const email = buildClientTaskCreatedEmail({
      clientName: client.name || 'Client',
      projectName: project?.name || 'No project selected',
      taskTitle: task.title || 'Client Task',
      creationDate: formatDate(task.creation_date),
      dueDate: formatDate(task.due_date),
      status: task.status || 'Not Started',
      taskLink: getClientTaskLink(),
    })

    await sendGmailMessage({
      to: client.email,
      subject: email.subject,
      body: email.body,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Client task email failed', error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to send client task notification' },
      { status: 500 }
    )
  }
}
