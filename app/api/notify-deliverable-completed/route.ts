import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '../../../lib/supabase/config'
import { buildDeliverableCompletedEmail } from '../../../lib/email/deliverable-notifications'
import { sendGmailMessage } from '../../../lib/email/gmail'
import { getClientLoginUrl } from '../../../lib/email/client-links'

const calculateProgress = async (
  supabaseAdmin: any,
  projectId: string
) => {
  const { data: projectMilestones, error: milestonesError } = await supabaseAdmin
    .from('milestones')
    .select('id')
    .eq('project_id', projectId)

  if (milestonesError) {
    throw milestonesError
  }

  const milestoneIds = (projectMilestones || []).map((milestone: { id: string }) => milestone.id)

  if (milestoneIds.length === 0) {
    return 0
  }

  const { data: projectDeliverables, error: deliverablesError } = await supabaseAdmin
    .from('deliverables')
    .select('id, status')
    .in('milestone_id', milestoneIds)

  if (deliverablesError) {
    throw deliverablesError
  }

  const total = projectDeliverables?.length || 0

  if (total === 0) {
    return 0
  }

  const completed = projectDeliverables?.filter((deliverable: { status: string }) => deliverable.status === 'Completed').length || 0

  return Math.round((completed / total) * 100)
}

export async function POST(request: Request) {
  try {
    const { deliverableId } = await request.json()

    if (!deliverableId) {
      return NextResponse.json({ error: 'Deliverable is required' }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY')
    }

    const supabaseAdmin = createClient(getSupabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { data: deliverable, error: deliverableError } = await supabaseAdmin
      .from('deliverables')
      .select('id, title, status, milestone_id')
      .eq('id', deliverableId)
      .single()

    if (deliverableError || !deliverable) {
      return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 })
    }

    if (deliverable.status !== 'Completed') {
      return NextResponse.json({ skipped: true, reason: 'Deliverable is not completed' })
    }

    const { data: milestone, error: milestoneError } = await supabaseAdmin
      .from('milestones')
      .select('id, project_id')
      .eq('id', deliverable.milestone_id)
      .single()

    if (milestoneError || !milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    }

    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, name, client_id')
      .eq('id', milestone.project_id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, name, email')
      .eq('id', project.client_id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    if (!client.email) {
      return NextResponse.json({ error: 'Client email is missing' }, { status: 400 })
    }

    const progressPercentage = await calculateProgress(supabaseAdmin, project.id)
    const completionDate = new Date().toLocaleDateString('en-GB')
    const email = buildDeliverableCompletedEmail({
      clientName: client.name || 'Client',
      projectName: project.name || 'Project',
      deliverableName: deliverable.title || 'Deliverable',
      completionDate,
      progressPercentage,
      clientDashboardLink: getClientLoginUrl(),
    })

    await sendGmailMessage({
      to: client.email,
      subject: email.subject,
      body: email.body,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Deliverable completion email failed', error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to send deliverable notification' },
      { status: 500 }
    )
  }
}
