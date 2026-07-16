import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '../../../lib/supabase/config'
import { sendGmailMessage } from '../../../lib/email/gmail'
import { buildArtifactPendingApprovalEmail } from '../../../lib/email/artifact-notifications'
import { getClientLoginUrl } from '../../../lib/email/client-links'

const formatDate = (date: string | null | undefined) => {
  if (!date) return 'Not set'
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('en-GB')
}

export async function POST(request: Request) {
  try {
    const { artifactId } = await request.json()

    if (!artifactId) {
      return NextResponse.json({ error: 'Artifact is required' }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY')
    }

    const supabaseAdmin = createClient(getSupabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { data: artifact, error: artifactError } = await supabaseAdmin
      .from('artifacts')
      .select('id, client_id, project_id, name, description, creation_date, file_name, approval_status')
      .eq('id', artifactId)
      .single()

    if (artifactError || !artifact) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
    }

    if (artifact.approval_status !== 'Pending Approval') {
      return NextResponse.json({ skipped: true, reason: 'Artifact is not pending approval' })
    }

    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, name, email')
      .eq('id', artifact.client_id)
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
      .eq('id', artifact.project_id)
      .single()

    const email = buildArtifactPendingApprovalEmail({
      clientName: client.name || 'Client',
      projectName: project?.name || 'Project',
      artifactName: artifact.name || 'Artifact',
      artifactDescription: artifact.description || '',
      creationDate: formatDate(artifact.creation_date),
      fileName: artifact.file_name || '',
      artifactLink: getClientLoginUrl(),
    })

    await sendGmailMessage({
      to: client.email,
      subject: email.subject,
      body: email.body,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Artifact pending approval email failed', error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to send artifact notification' },
      { status: 500 }
    )
  }
}
